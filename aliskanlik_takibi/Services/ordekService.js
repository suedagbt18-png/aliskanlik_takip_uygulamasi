const db = require("../Database/db");
const pdb = db.promise(); // async/await ile sorgu yazabilmek için

// ---------------- OYUN KURALLARI ----------------
const GUNLUK_CEZA = 10; // kaçırılan her alışkanlık için günlük can kaybı
const SEVIYE_XP = 100; // her seviye için gereken XP
const IYILESME = 10; // tamamlanan alışkanlık başına can
const SERI_BONUSU = 15; // her 7 günlük seride ekstra can
const YETISKIN_SEVIYE = 10; // bu seviyede ördek yetişkin olur ve çiftliğe gönderilebilir

// Yumurtadan çıkacak ördeğin rengi: sürpriz! (oran ne kadar büyükse o kadar sık çıkar)
const RENKLER = [
  { renk: "beyaz", oran: 35 },
  { renk: "yaban", oran: 30 },
  { renk: "siyah", oran: 20 },
  { renk: "altin", oran: 12 },
  { renk: "lavanta", oran: 3 }, // nadir!
];

// Çiftlikteki ördek sayısına göre unvan
const UNVANLAR = [
  { enAz: 0, unvan: "Yumurta Bekçisi" },
  { enAz: 1, unvan: "Acemi Çiftçi" },
  { enAz: 3, unvan: "Gölet Sahibi" },
  { enAz: 5, unvan: "Sazlık Ustası" },
  { enAz: 10, unvan: "Göl Muhafızı" },
  { enAz: 20, unvan: "Efsanevi Çiftçi" },
];

function rastgeleRenk() {
  const toplam = RENKLER.reduce((t, r) => t + r.oran, 0);
  let zar = Math.random() * toplam;
  for (const r of RENKLER) {
    if (zar < r.oran) return r.renk;
    zar -= r.oran;
  }
  return "beyaz";
}

// Unvan ve bir sonraki unvana ne kadar kaldığı
function unvanHesapla(ciftlikSayisi) {
  let simdiki = UNVANLAR[0];
  let sonraki = null;
  for (const u of UNVANLAR) {
    if (ciftlikSayisi >= u.enAz) simdiki = u;
    else if (!sonraki) sonraki = u;
  }
  return { unvan: simdiki.unvan, sonrakiUnvan: sonraki ? sonraki.unvan : null, sonrakiIcin: sonraki ? sonraki.enAz : null };
}

// Seviyeye göre ördeğin aşaması
function asamaBul(seviye) {
  if (seviye <= 2) return "yumurta";
  if (seviye <= 3) return "catlayan_yumurta";
  if (seviye <= 6) return "yavru";
  if (seviye < YETISKIN_SEVIYE) return "genc";
  return "yetiskin";
}

function yumurtaMi(seviye) {
  return seviye <= 3;
}

// Cana göre ruh hali (yumurta hastalanmaz, soğur)
function ruhHaliBul(can, seviye) {
  if (yumurtaMi(seviye)) return can >= 40 ? "sicak" : "soguk";
  if (can >= 70) return "mutlu";
  if (can >= 40) return "yorgun";
  return "hasta";
}

// Kullanıcıyı yeni bir yumurtayla başlatır (ölüm ve çiftliğe gönderme sonrası)
async function yeniYumurta(kullaniciID) {
  await pdb.query(
    `UPDATE kullanicilar
     SET kullanici_seviyesi = 1, kullanici_tecrübe = 0, kullanici_saglik = 100,
         ordek_adi = NULL, ordek_renk = ?, ordek_dogum_tarihi = NOW()
     WHERE kullanici_id = ?`,
    [rastgeleRenk(), kullaniciID]
  );
}

// Ördek ölünce: anı defterine yaz, seriler sıfırlanır, yeni yumurta
async function ordekOldur(k) {
  await pdb.query(
    `INSERT INTO ani_defteri (kullanici_id, ordek_adi, renk, dogum_tarihi, ulastigi_seviye)
     VALUES (?, ?, ?, ?, ?)`,
    [k.kullanici_id, k.ordek_adi, k.ordek_renk, k.ordek_dogum_tarihi, k.kullanici_seviyesi]
  );
  await pdb.query(`UPDATE aliskanliklar SET seri = 0 WHERE kullanici_id = ?`, [k.kullanici_id]);
  await yeniYumurta(k.kullanici_id);
}

// Yetişkin ördeği çiftliğe gönder: seriler KORUNUR (bu bir ödül, ceza değil)
async function ciftligeGonder(kullaniciID) {
  const [rows] = await pdb.query(
    `SELECT *, DATEDIFF(NOW(), ordek_dogum_tarihi) AS yas FROM kullanicilar WHERE kullanici_id = ?`,
    [kullaniciID]
  );
  const k = rows[0];
  if (!k) return { hata: "Kullanıcı bulunamadı." };
  if (asamaBul(k.kullanici_seviyesi) !== "yetiskin") {
    return { hata: "Ördeğin henüz yetişkin değil." };
  }

  await pdb.query(
    `INSERT INTO ciftlik (kullanici_id, ordek_adi, renk, dogum_tarihi, buyume_gunu)
     VALUES (?, ?, ?, ?, ?)`,
    [kullaniciID, k.ordek_adi, k.ordek_renk, k.ordek_dogum_tarihi, Math.max(1, k.yas)]
  );
  await yeniYumurta(kullaniciID);

  const [[{ sayi }]] = await pdb.query(`SELECT COUNT(*) AS sayi FROM ciftlik WHERE kullanici_id = ?`, [kullaniciID]);
  return { ordek_adi: k.ordek_adi, renk: k.ordek_renk, buyume_gunu: Math.max(1, k.yas), ciftlikSayisi: sayi, ...unvanHesapla(sayi) };
}

// XP ve can ver, gerekirse seviye atlat
async function odulVer(kullaniciID, xp, can) {
  const [rows] = await pdb.query(
    `SELECT kullanici_seviyesi, kullanici_tecrübe, kullanici_saglik
     FROM kullanicilar WHERE kullanici_id = ?`,
    [kullaniciID]
  );
  let seviye = rows[0].kullanici_seviyesi;
  let tecrube = rows[0].kullanici_tecrübe + xp;
  const saglik = Math.min(rows[0].kullanici_saglik + can, 100);

  let seviyeAtladi = false;
  while (tecrube >= SEVIYE_XP) {
    tecrube -= SEVIYE_XP;
    seviye++;
    seviyeAtladi = true;
  }

  await pdb.query(
    `UPDATE kullanicilar SET kullanici_seviyesi = ?, kullanici_tecrübe = ?, kullanici_saglik = ?
     WHERE kullanici_id = ?`,
    [seviye, tecrube, saglik, kullaniciID]
  );
  return { seviye, tecrube, saglik, seviyeAtladi, asama: asamaBul(seviye) };
}

// Can düşür; 0'a inerse (yumurta değilse) ördek ölür
async function cezaVer(kullaniciID, miktar) {
  const [rows] = await pdb.query(`SELECT * FROM kullanicilar WHERE kullanici_id = ?`, [kullaniciID]);
  const k = rows[0];
  const yeniCan = k.kullanici_saglik - miktar;

  if (yeniCan <= 0 && !yumurtaMi(k.kullanici_seviyesi)) {
    await ordekOldur(k);
    return { oldu: true, olenOrdek: k.ordek_adi };
  }

  const saglik = Math.max(yeniCan, 1);
  await pdb.query(`UPDATE kullanicilar SET kullanici_saglik = ? WHERE kullanici_id = ?`, [saglik, kullaniciID]);
  return { oldu: false, saglik };
}

// Kullanıcı her girdiğinde çalışır
async function gunlukKontrol(kullaniciID) {
  const [kullanicilar] = await pdb.query(
    `SELECT *, DATEDIFF(CURDATE(), son_kontrol_tarihi) AS gecen_gun
     FROM kullanicilar WHERE kullanici_id = ?`,
    [kullaniciID]
  );
  const k = kullanicilar[0];
  if (!k) return null;

  // Hiç kontrol yapılmamışsa (yeni kullanıcı) bugünden başlat
  if (k.son_kontrol_tarihi === null) {
    await pdb.query(`UPDATE kullanicilar SET son_kontrol_tarihi = CURDATE() WHERE kullanici_id = ?`, [kullaniciID]);
    return { ceza: 0, oldu: false };
  }

  // Bugün zaten kontrol edildiyse bir şey yapma
  if (k.gecen_gun <= 0) return { ceza: 0, oldu: false };

  // Kaç alışkanlık-gün kaçırıldı?
  // Arada sadece son kontrol günü aktifti, o gün işaretlenenleri düşüyoruz.
  const [sayim] = await pdb.query(
    `SELECT COUNT(*) AS toplam,
            COALESCE(SUM(son_yapilma_tarihi = DATE(?) OR son_basarisiz_tarihi = DATE(?)), 0) AS kontrol_gunu_yapilan
     FROM aliskanliklar WHERE kullanici_id = ?`,
    [k.son_kontrol_tarihi, k.son_kontrol_tarihi, kullaniciID]
  );
  const kacirilan = sayim[0].toplam * k.gecen_gun - Number(sayim[0].kontrol_gunu_yapilan);
  const ceza = Math.max(kacirilan, 0) * GUNLUK_CEZA;

  // Kontrolü "sahiplen": aynı anda iki istek gelirse ceza iki kez kesilmesin
  const [sahiplen] = await pdb.query(
    `UPDATE kullanicilar SET son_kontrol_tarihi = CURDATE()
     WHERE kullanici_id = ? AND son_kontrol_tarihi < CURDATE()`,
    [kullaniciID]
  );
  if (sahiplen.affectedRows === 0) return { ceza: 0, oldu: false };

  if (ceza === 0) return { ceza: 0, oldu: false };

  // Can zaten 1'deyse ve ördek yumurtadan çıkmışsa: ölüm
  if (k.kullanici_saglik <= 1 && !yumurtaMi(k.kullanici_seviyesi)) {
    await ordekOldur(k);
    return { ceza, oldu: true, olenOrdek: k.ordek_adi };
  }

  // Değilse canı düşür ama en az 1'de bırak (ağır hasta, son şans)
  const yeniCan = Math.max(k.kullanici_saglik - ceza, 1);
  await pdb.query(`UPDATE kullanicilar SET kullanici_saglik = ? WHERE kullanici_id = ?`, [yeniCan, kullaniciID]);
  return { ceza, oldu: false };
}

module.exports = {
  gunlukKontrol,
  ordekOldur,
  ciftligeGonder,
  odulVer,
  cezaVer,
  asamaBul,
  ruhHaliBul,
  yumurtaMi,
  unvanHesapla,
  rastgeleRenk,
  IYILESME,
  SERI_BONUSU,
};
