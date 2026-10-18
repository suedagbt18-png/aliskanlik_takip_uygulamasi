
const db = require("../Database/db");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

//Kullanıcı ekliyoruz. 
const register = async (req, res) => {
  const {
    kullanici_adi,
    kullanici_soyadi,
    kullanici_eposta,
    kullanici_nickname,
    kullanici_sifre
  } = req.body;

  
  console.log("Gelen body:", req.body);
  
  

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(kullanici_sifre, saltRounds);

    const query = `INSERT INTO kullanicilar (kullanici_adi, kullanici_soyadi, kullanici_eposta, kullanici_nickname, kullanici_sifre) VALUES (?, ?, ?, ?, ?)`;

    const values = [
      kullanici_adi,
      kullanici_soyadi,
      kullanici_eposta,
      kullanici_nickname,
      hashedPassword
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Veri ekleme hatası:", err);
        console.error("MySQL Hatası:", err.sqlMessage);
        return res.status(500).json({ code:"db", mesaj: "Veri eklenemedi." });
      }
      return res.status(201).json({ mesaj: "Kullanıcı başarıyla eklendi." });
    });
  } catch (err) {
    console.error("Hashleme hatası:", err);
    return res.status(500).json({ mesaj: "Sunucu hatası." });
  }
};

const JWT_SECRET = process.env.JWT_SECRET;

const { gunlukKontrol, asamaBul, ruhHaliBul, unvanHesapla } = require("../Services/ordekService");

// giriş yapma
const login = (req, res) => {
  const { kullanici_nickname, kullanici_sifre } = req.body;

  const query = "SELECT * FROM kullanicilar WHERE kullanici_nickname = ?";
  
  db.query(query, [kullanici_nickname], async (err, results) => {
    if (err) {
      console.error("Veritabanı hatası:", err);
      return res.status(500).json({ mesaj: "Sunucu hatası." });
    }

  

    if (results.length === 0) {
      return res.status(401).json({ 
        succeeded: false,
        error: "Geçersiz kullanıcı adı veya şifre." 
      });
    }

    const user = results[0];
    const same = await bcrypt.compare(kullanici_sifre, user.kullanici_sifre);
   
    
    

    if (!same) {
      return res.status(401).json({ 
        succeeded: false,
        error: "Geçersiz kullanıcı adı veya şifre." 
      });
    }

    // Token oluştur
    const payload = {
      kullanici_id: user.kullanici_id,
      kullanici_nickname: user.kullanici_nickname
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d" 
    });
    //kullanıcıya döndürür
    return res.status(200).json({
      succeeded: true,
      mesaj: "Giriş başarılı.",
      token: token
    });
  });
};

//kullanıcı id ile kullanıcı bul.
const getUserInfo = async (req, res) => {
  const userId = req.tokenPayload.kullanici_id;

  try {
    // Günlük kontrol sadece ?kontrol=1 ile istenirse yapılır (ördek kartı ister)
    const kontrol = req.query.kontrol === "1" ? await gunlukKontrol(userId) : null;

    const [rows] = await db.promise().query(
      "SELECT * FROM kullanicilar WHERE kullanici_id = ?", [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ code: "Kullanıcı bulunamadı" });
    }
    const user = rows[0];

    // Unvan artık çiftlikteki ördek sayısına göre
    const [[{ ciftlikSayisi }]] = await db.promise().query(
      "SELECT COUNT(*) AS ciftlikSayisi FROM ciftlik WHERE kullanici_id = ?", [userId]
    );

    res.json({
      name: user.kullanici_adi,
      surname: user.kullanici_soyadi,
      nickname: user.kullanici_nickname,
      level: user.kullanici_seviyesi,
      hp: user.kullanici_saglik,
      xp: user.kullanici_tecrübe,
      title: unvanHesapla(ciftlikSayisi).unvan,
      ciftlikSayisi,
      ordek: {
        ad: user.ordek_adi,
        renk: user.ordek_renk,
        asama: asamaBul(user.kullanici_seviyesi),
        ruh_hali: ruhHaliBul(user.kullanici_saglik, user.kullanici_seviyesi),
        dogum_tarihi: user.ordek_dogum_tarihi,
      },
      bildirim: kontrol,
    });
  } catch (err) {
    console.error("getUserInfo hatası:", err);
    res.status(500).json({ code: "db" });
  }
};
// Yeni yumurtaya isim ver (sadece adı boşken)
const ordekIsimVer = async (req, res) => {
  const kullaniciID = req.tokenPayload.kullanici_id;
  const ad = (req.body.ad || "").trim();

  if (ad.length < 1 || ad.length > 20) {
    return res.status(400).json({ code: "gecersiz", mesaj: "İsim 1-20 karakter olmalı." });
  }

  try {
    const [sonuc] = await db.promise().query(
      `UPDATE kullanicilar SET ordek_adi = ? WHERE kullanici_id = ? AND ordek_adi IS NULL`,
      [ad, kullaniciID]
    );
    if (sonuc.affectedRows === 0) {
      return res.status(400).json({ code: "zatenVar", mesaj: "Ördeğinin zaten bir adı var." });
    }
    res.status(200).json({ code: "success", ad });
  } catch (err) {
    console.error("ordekIsimVer hatası:", err);
    res.status(500).json({ code: "db" });
  }
};

// Kullanıcının ölen ördekleri
const aniDefteri = async (req, res) => {
  const kullaniciID = req.tokenPayload.kullanici_id;

  try {
    const [rows] = await db.promise().query(
      `SELECT ani_id, ordek_adi, renk, ulastigi_seviye,
              DATE_FORMAT(dogum_tarihi, '%Y-%m-%d') AS dogum,
              DATE_FORMAT(olum_tarihi, '%Y-%m-%d') AS olum,
              DATEDIFF(olum_tarihi, dogum_tarihi) AS yasadigi_gun
       FROM ani_defteri WHERE kullanici_id = ?
       ORDER BY olum_tarihi DESC`,
      [kullaniciID]
    );

    const anilar = rows.map((r) => ({ ...r, asama: asamaBul(r.ulastigi_seviye) }));
    res.status(200).json({ code: "success", anilar });
  } catch (err) {
    console.error("aniDefteri hatası:", err);
    res.status(500).json({ code: "db", mesaj: "Anı defteri alınamadı." });
  }
};

 module.exports = {
  register,login,getUserInfo,ordekIsimVer,aniDefteri
};


