const db = require("../Database/db");
const pdb = db.promise();

const TAKVIM_GUN = 84; // ısı haritası: son 12 hafta

// "2026-10-18" gibi bir tarihten n gün önceki/sonraki tarihi döndürür
function gunEkle(tarih, n) {
  const d = new Date(tarih + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Veritabanından gelen ham verilerden istatistikleri hesaplar.
// (Ayrı bir fonksiyon olması, veritabanı olmadan test edebilmemizi sağlıyor.)
function istatistikHesapla(bugun, aliskanliklar, takipler, toplamTamamlanan) {
  // "aliskanlikId|tarih" -> 1 (yapıldı) / 0 (yapılmadı)
  const durum = new Map();
  for (const t of takipler) {
    durum.set(`${t.aliskanlik_id}|${t.gun}`, Number(t.yapildi));
  }

  // Bir alışkanlığın belirli bir aralıktaki başarı oranı.
  // Bugün henüz işaretlenmediyse bugünü hesaba katmıyoruz (gün bitmedi).
  function oranHesapla(a, gunSayisi) {
    let yapilan = 0;
    let toplam = 0;
    for (let i = gunSayisi - 1; i >= 0; i--) {
      const gun = gunEkle(bugun, -i);
      if (gun < a.olusturma) continue; // alışkanlık o gün daha yoktu
      const d = durum.get(`${a.aliskanlik_id}|${gun}`);
      if (gun === bugun && d === undefined) continue;
      toplam++;
      if (d === 1) yapilan++;
    }
    return { yapilan, toplam };
  }

  // Her alışkanlık için kart bilgisi
  const liste = aliskanliklar.map((a) => {
    const son7 = [];
    for (let i = 6; i >= 0; i--) {
      const gun = gunEkle(bugun, -i);
      const d = durum.get(`${a.aliskanlik_id}|${gun}`);
      let s;
      if (d === 1) s = "yapildi";
      else if (d === 0) s = "yapilmadi";
      else if (gun === bugun) s = "bekliyor";
      else if (gun < a.olusturma) s = "yok"; // alışkanlık henüz eklenmemişti
      else s = "kacirildi";
      son7.push({ tarih: gun, durum: s });
    }
    const o30 = oranHesapla(a, 30);
    return {
      aliskanlik_id: a.aliskanlik_id,
      baslik: a.aliskanlik_title,
      etiket: a.aliskanlik_etiketi,
      seri: Number(a.seri) || 0,
      rekor: Math.max(Number(a.en_uzun_seri) || 0, Number(a.seri) || 0),
      oran30: o30.toplam > 0 ? Math.round((o30.yapilan / o30.toplam) * 100) : null,
      son7,
    };
  });

  // Isı haritası: her gün kaç alışkanlık yapıldı?
  const takvim = [];
  for (let i = TAKVIM_GUN - 1; i >= 0; i--) {
    const gun = gunEkle(bugun, -i);
    const oGunVarOlan = aliskanliklar.filter((a) => a.olusturma <= gun).length;
    const yapilan = aliskanliklar.filter((a) => durum.get(`${a.aliskanlik_id}|${gun}`) === 1).length;
    let seviye = 0;
    if (yapilan > 0 && oGunVarOlan > 0) {
      const oran = yapilan / oGunVarOlan;
      seviye = oran >= 1 ? 4 : oran >= 0.67 ? 3 : oran >= 0.34 ? 2 : 1;
    }
    takvim.push({ tarih: gun, yapilan, toplam: oGunVarOlan, seviye });
  }

  // Özet kutucukları
  let haftaYapilan = 0;
  let haftaToplam = 0;
  for (const a of aliskanliklar) {
    const o = oranHesapla(a, 7);
    haftaYapilan += o.yapilan;
    haftaToplam += o.toplam;
  }

  const ozet = {
    aktif: aliskanliklar.length,
    rekorSeri: liste.reduce((m, a) => Math.max(m, a.rekor), 0),
    haftaOrani: haftaToplam > 0 ? Math.round((haftaYapilan / haftaToplam) * 100) : null,
    toplamTamamlanan: Number(toplamTamamlanan) || 0,
  };

  return { bugun, ozet, takvim, aliskanliklar: liste };
}

// GET /aliskanlikIstatistik
const aliskanlikIstatistik = async (req, res) => {
  const kullaniciID = req.tokenPayload.kullanici_id;

  try {
    // Tarihi veritabanından alıyoruz ki sunucu ile MySQL'in saat farkı sorun çıkarmasın
    const [[{ bugun }]] = await pdb.query(`SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS bugun`);

    const [aliskanliklar] = await pdb.query(
      `SELECT aliskanlik_id, aliskanlik_title, aliskanlik_etiketi, en_uzun_seri,
              CASE WHEN son_yapilma_tarihi < CURDATE() - INTERVAL 1 DAY THEN 0 ELSE seri END AS seri,
              DATE_FORMAT(olusturma_tarihi, '%Y-%m-%d') AS olusturma
       FROM aliskanliklar WHERE kullanici_id = ?
       ORDER BY aliskanlik_id`,
      [kullaniciID]
    );

    // Aynı gün için birden fazla kayıt varsa "yapıldı" (1) öncelikli
    const [takipler] = await pdb.query(
      `SELECT aliskanlik_id, DATE_FORMAT(tarih, '%Y-%m-%d') AS gun, MAX(yapildi_mi) AS yapildi
       FROM aliskanlik_takip
       WHERE kullanici_id = ? AND tarih IS NOT NULL AND yapildi_mi IS NOT NULL
         AND tarih >= CURDATE() - INTERVAL ? DAY
       GROUP BY aliskanlik_id, gun`,
      [kullaniciID, TAKVIM_GUN]
    );

    const [[{ toplam }]] = await pdb.query(
      `SELECT COUNT(*) AS toplam FROM aliskanlik_takip WHERE kullanici_id = ? AND yapildi_mi = 1`,
      [kullaniciID]
    );

    res.status(200).json({
      code: "success",
      ...istatistikHesapla(bugun, aliskanliklar, takipler, toplam),
    });
  } catch (err) {
    console.error("aliskanlikIstatistik hatası:", err);
    res.status(500).json({ code: "db", mesaj: "İstatistikler alınamadı." });
  }
};

// ---------------- GÖREVLER ----------------

// Görev listesinden özet ve etiket dağılımını hesaplar
function gorevOzetHesapla(gorevler) {
  const ozet = { bekleyen: 0, tamamlanan: 0, yapilmayan: 0, kazanilanXP: 0, basariOrani: null };
  const etiketler = {};

  for (const g of gorevler) {
    const etiket = g.gorev_etiketi || "Etiketsiz";
    if (!etiketler[etiket]) etiketler[etiket] = { etiket, tamamlanan: 0, yapilmayan: 0, bekleyen: 0 };

    if (g.yapildi_mi === 1) {
      ozet.tamamlanan++;
      ozet.kazanilanXP += Number(g.gorev_puani) || 0;
      etiketler[etiket].tamamlanan++;
    } else if (g.yapildi_mi === 2) {
      ozet.yapilmayan++;
      etiketler[etiket].yapilmayan++;
    } else {
      ozet.bekleyen++;
      etiketler[etiket].bekleyen++;
    }
  }

  const biten = ozet.tamamlanan + ozet.yapilmayan;
  if (biten > 0) ozet.basariOrani = Math.round((ozet.tamamlanan / biten) * 100);

  // En çok görev olan etiket en üstte
  const etiketListesi = Object.values(etiketler).sort(
    (a, b) => b.tamamlanan + b.yapilmayan + b.bekleyen - (a.tamamlanan + a.yapilmayan + a.bekleyen)
  );

  return { ozet, etiketler: etiketListesi };
}

// GET /gorevIstatistik
const gorevIstatistik = async (req, res) => {
  const kullaniciID = req.tokenPayload.kullanici_id;

  try {
    const [[{ bugun }]] = await pdb.query(`SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS bugun`);

    // Her görev + işaretlendiği zaman (gorev_takip'teki son kayıt)
    const [gorevler] = await pdb.query(
      `SELECT g.gorev_id, g.gorev_title, g.gorev_body, g.gorev_puani, g.gorev_etiketi, g.yapildi_mi,
              DATE_FORMAT(g.olusturma_tarihi, '%Y-%m-%d') AS olusturma,
              DATE_FORMAT(MAX(t.tarih), '%Y-%m-%d') AS isaret_gunu,
              DATE_FORMAT(MAX(t.tarih), '%H:%i') AS isaret_saati
       FROM gorevler g
       LEFT JOIN gorev_takip t ON t.gorev_id = g.gorev_id AND t.kullanici_id = g.kullanici_id
       WHERE g.kullanici_id = ?
       GROUP BY g.gorev_id
       ORDER BY MAX(t.tarih) DESC, g.gorev_id DESC`,
      [kullaniciID]
    );

    res.status(200).json({ code: "success", bugun, gorevler, ...gorevOzetHesapla(gorevler) });
  } catch (err) {
    console.error("gorevIstatistik hatası:", err);
    res.status(500).json({ code: "db", mesaj: "Görev istatistikleri alınamadı." });
  }
};

module.exports = { aliskanlikIstatistik, istatistikHesapla, gorevIstatistik, gorevOzetHesapla };