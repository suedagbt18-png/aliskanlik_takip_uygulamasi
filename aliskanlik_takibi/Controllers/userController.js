const db = require("../Database/db");
const bcrypt = require("bcrypt");

// Kullanıcı listesini getiren fonksiyon
const getUsers = (req, res) => {
  const query = "SELECT * FROM kullanicilar";

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send("Veritabanında bir hata oluştu. Hata:" + err);
    }
    res.status(200).send(results);
  });
};



//Yeni kullanıcı ekleyen fonksiyon
const addUsers = async (req, res) => {
  const {
    kullanici_adi,
    kullanici_soyadi,
    kullanici_eposta,
    kullanici_nickname,
    kullanici_sifre,
    kullanici_seviyesi,
    kullanici_saglik,
    kullanici_tecrübe,
    kullanici_unvan,
  } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(kullanici_sifre, saltRounds);

    const query = ` INSERT INTO kullanicilar
                 VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      query,
      [
        kullanici_adi,
        kullanici_soyadi,
        kullanici_eposta,
        kullanici_nickname,
        hashedPassword,
        kullanici_seviyesi,
        kullanici_saglik,
        kullanici_tecrübe,
        kullanici_unvan,
      ],
      (err, res) => {
        if (err) {
          console.error("Veri ekleme hatası:", err);
          return res
            .status(500)
            .json({ code: "db", mesaj: "Veri eklenemedi." });
        }
        res.status(200).json({ code: "Succes", mesaj: "Kullanıcı eklendi." });
      }
    );
  } catch (err) {
    console.error("Hashleme hatası:", err);
    res.status(500).json({ code: "db", mesaj: "sunucu hatası" });
  }
};

module.exports = {
  getUsers,
  addUsers,
  
};

// DB'de seviye sağlık tecrübe ve unvan için default değer ataması yap
