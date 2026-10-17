const db = require("../Database/db");
const pdb = db.promise(); // async/await ile sorgu yazabilmek için

const GUNLUK_CEZA = 10; // kaçırılan her alışkanlık için günlük can kaybı

// Seviyeye göre ördeğin aşaması
function asamaBul(seviye) {
  if (seviye <= 2) return "yumurta";
  if (seviye <= 4) return "catlayan_yumurta";
  if (seviye <= 9) return "yavru";
  if (seviye <= 19) return "genc";
  return "yetiskin";
}

function yumurtaMi(seviye) {
  return seviye <= 4;
}

// Cana göre ruh hali (yumurta hastalanmaz, soğur)
function ruhHaliBul(can, seviye) {
  if (yumurtaMi(seviye)) return can >= 40 ? "sicak" : "soguk";
  if (can >= 70) return "mutlu";
  if (can >= 40) return "yorgun";
  return "hasta";
}

// Ördek ölünce: anı defterine yaz, kullanıcıyı yeni yumurtayla başlat
async function ordekOldur(k) {
  await pdb.query(
    `INSERT INTO ani_defteri (kullanici_id, ordek_adi, dogum_tarihi, ulastigi_seviye)
     VALUES (?, ?, ?, ?)`,
    [k.kullanici_id, k.ordek_adi, k.ordek_dogum_tarihi, k.kullanici_seviyesi]
  );

  const [unvanlar] = await pdb.query(
    `SELECT unvan FROM seviyeler
     WHERE 1 BETWEEN seviye_araligi_baslangic AND seviye_araligi_bitis`
  );

  // ordek_adi NULL olunca arayüz "yeni yumurtana isim ver" ekranını gösterecek
  await pdb.query(
    `UPDATE kullanicilar
     SET kullanici_seviyesi = 1, kullanici_tecrübe = 0, kullanici_saglik = 100,
         kullanici_unvan = ?, ordek_adi = NULL, ordek_dogum_tarihi = NOW()
     WHERE kullanici_id = ?`,
    [unvanlar[0]?.unvan ?? null, k.kullanici_id]
  );

  await pdb.query(`UPDATE aliskanliklar SET seri = 0 WHERE kullanici_id = ?`, [k.kullanici_id]);
 
 }

const SEVIYE_XP = 100; // her seviye için gereken XP
const IYILESME = 5;    // tamamlanan alışkanlık başına can

async function unvanBul(seviye) {
  const [rows] = await pdb.query(
    `SELECT unvan FROM seviyeler
     WHERE ? BETWEEN seviye_araligi_baslangic AND seviye_araligi_bitis`,
    [seviye]
  );
  return rows[0]?.unvan ?? null;
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

  const unvan = await unvanBul(seviye);
  await pdb.query(
    `UPDATE kullanicilar
     SET kullanici_seviyesi = ?, kullanici_tecrübe = ?, kullanici_saglik = ?,
         kullanici_unvan = COALESCE(?, kullanici_unvan)
     WHERE kullanici_id = ?`,
    [seviye, tecrube, saglik, unvan, kullaniciID]
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
  // Arada sadece son kontrol günü aktifti, o gün yapılanları düşüyoruz.
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

module.exports = { gunlukKontrol, ordekOldur, odulVer, cezaVer, asamaBul, ruhHaliBul, yumurtaMi, IYILESME };