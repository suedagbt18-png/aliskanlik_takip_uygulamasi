const db = require("../Database/db");
const pdb = db.promise();
const { ciftligeGonder, unvanHesapla } = require("../Services/ordekService");

// POST /ciftligeGonder  -> yetişkin ördeği çiftliğe gönder, yeni yumurta başlat
const ciftligeGonderIstegi = async (req, res) => {
  const kullaniciID = req.tokenPayload.kullanici_id;
  try {
    const sonuc = await ciftligeGonder(kullaniciID);
    if (sonuc.hata) {
      return res.status(400).json({ code: "uygunDegil", mesaj: sonuc.hata });
    }
    res.status(200).json({ code: "success", ...sonuc });
  } catch (err) {
    console.error("ciftligeGonder hatası:", err);
    res.status(500).json({ code: "db", mesaj: "Ördek çiftliğe gönderilemedi." });
  }
};

// GET /ciftlik  -> kullanıcının çiftliğindeki ördekler
const ciftlikGetir = async (req, res) => {
  const kullaniciID = req.tokenPayload.kullanici_id;
  try {
    const [ordekler] = await pdb.query(
      `SELECT ciftlik_id, ordek_adi, renk, buyume_gunu,
              DATE_FORMAT(dogum_tarihi, '%Y-%m-%d') AS dogum,
              DATE_FORMAT(katilma_tarihi, '%Y-%m-%d') AS katilma
       FROM ciftlik WHERE kullanici_id = ?
       ORDER BY katilma_tarihi ASC`,
      [kullaniciID]
    );
    res.status(200).json({ code: "success", ordekler, ...unvanHesapla(ordekler.length) });
  } catch (err) {
    console.error("ciftlik hatası:", err);
    res.status(500).json({ code: "db", mesaj: "Çiftlik yüklenemedi." });
  }
};

module.exports = { ciftligeGonderIstegi, ciftlikGetir };
