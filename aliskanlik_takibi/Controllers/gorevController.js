const db = require("../Database/db");
const pdb = db.promise();
const { odulVer, cezaVer } = require("../Services/ordekService");

// Gorev listesini getiren fonksiyon
const getGorev = (req, res) => {
  const kullaniciID = req.tokenPayload.kullanici_id;
  const query = "SELECT * FROM gorevler WHERE kullanici_id = ?";

  db.query(query, [kullaniciID], (err, results) => {
    if (err) {
      return res.status(500).json({ code: "db" });
    }
    res.status(200).send(results);
  });
};

// Görev ekleme fonksiyonu

const addGorev = (req, res) => {
  const { gorev_title, gorev_body, gorev_puani, gorev_etiketi } = req.body;
  const kullaniciID = req.tokenPayload.kullanici_id;

  //kontrol et
  const checkQuery = `
    SELECT * FROM gorevler 
    WHERE kullanici_id = ? AND gorev_title = ? AND yapildi_mi = 0
  `;

  db.query(checkQuery, [kullaniciID, gorev_title], (err, results) => {
    if (err) {
      return res.status(500).json({ code: "db", mesaj: "Hata oluştu." });
    }

    if (results.length > 0) {
      return res
        .status(400)
        .json({ code: "alreadyExist", mesaj: "Bu görevi zaten eklediniz." });
    }

    // ekle
    const query = `
      INSERT INTO gorevler (kullanici_id, gorev_title, gorev_body, gorev_puani, gorev_etiketi) 
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [kullaniciID, gorev_title, gorev_body, gorev_puani, gorev_etiketi],
      (err2) => {
        if (err2) {
          console.error("Veri ekleme hatası:", err2);
          return res
            .status(500)
            .json({ code: "db", mesaj: "Görev bilgisi eklenemedi." });
        }
        res
          .status(200)
          .json({ code: "success", mesaj: "Görev başarıyla eklendi." });
      }
    );
  });
};

// Görev güncelleme fonksiyonu
const updateGorev = (req, res) => {
  const { gorev_title, gorev_body, gorev_puani, gorev_etiketi, gorev_id } =
    req.body;
    const kullaniciID = req.tokenPayload.kullanici_id;

  const query = `UPDATE gorevler 
                 SET gorev_title=?, gorev_body=?, gorev_puani=?, gorev_etiketi=?
                 WHERE gorev_id=? AND kullanici_id = ?`;
  db.query(
    query,
    [gorev_title, gorev_body, gorev_puani, gorev_etiketi, gorev_id, kullaniciID],
    (err, result) => {
      if (err) {
        console.error("Veri güncelleme hatası:", err);
        return res
          .status(500)
          .json({ code: "db", mesaj: "Görev bilgisi güncellenemedi." });
      }
      res
        .status(200)
        .json({ code: "success", mesaj: "Görev bilgisi güncellendi." });
    }
  );
};

// Görev silme fonksiyonu
const deleteGorev = async (req, res) => {
  const { gorev_id } = req.body;
  const kullaniciID = req.tokenPayload.kullanici_id;

  try {
    const [sahip] = await pdb.query(
      `SELECT gorev_id FROM gorevler WHERE gorev_id = ? AND kullanici_id = ?`,
      [gorev_id, kullaniciID]
    );
    if (sahip.length === 0) {
      return res.status(404).json({ code: "notFound", mesaj: "Görev bulunamadı." });
    }

    await pdb.query(`DELETE FROM gorev_takip WHERE gorev_id = ?`, [gorev_id]);
    await pdb.query(`DELETE FROM gorevler WHERE gorev_id = ?`, [gorev_id]);

    res.status(200).json({ code: "success", mesaj: "Görev silindi." });
  } catch (err) {
    console.error("deleteGorev hatası:", err);
    res.status(500).json({ code: "db", mesaj: "Görev silinemedi." });
  }
};

// Görev tamamlama fonksiyonu 
const gorevBasarili = async (req, res) => {
  const { gorev_id } = req.body;
  const kullaniciID = req.tokenPayload.kullanici_id;

  try {
    // 1. İşaretle: sadece bu kullanıcının ve henüz işaretlenmemiş göreviyse
    const [isaret] = await pdb.query(
      `UPDATE gorevler SET yapildi_mi = 1
       WHERE gorev_id = ? AND kullanici_id = ? AND yapildi_mi = 0`,
      [gorev_id, kullaniciID]
    );
    if (isaret.affectedRows === 0) {
      return res.status(404).json({ code: "notFound", mesaj: "Görev bulunamadı ya da zaten işaretlenmiş." });
    }

    const [rows] = await pdb.query(`SELECT gorev_puani FROM gorevler WHERE gorev_id = ?`, [gorev_id]);

    // 2. Takip kaydı
    await pdb.query(`INSERT INTO gorev_takip (kullanici_id, gorev_id) VALUES (?, ?)`, [kullaniciID, gorev_id]);

    // 3. Ödül: sadece XP (iyileşme alışkanlıklara özel)
    const sonuc = await odulVer(kullaniciID, rows[0].gorev_puani, 0);

    res.status(200).json({ code: "success", mesaj: "Görev tamamlandı!", ...sonuc });
  } catch (err) {
    console.error("gorevBasarili hatası:", err);
    res.status(500).json({ code: "db" });
  }
};

//Görev tamamlamama fonksiyonu
const gorevBasarisiz = async (req, res) => {
  const { gorev_id } = req.body;
  const kullaniciID = req.tokenPayload.kullanici_id;

  try {
    const [isaret] = await pdb.query(
      `UPDATE gorevler SET yapildi_mi = 2
       WHERE gorev_id = ? AND kullanici_id = ? AND yapildi_mi = 0`,
      [gorev_id, kullaniciID]
    );
    if (isaret.affectedRows === 0) {
      return res.status(404).json({ code: "notFound", mesaj: "Görev bulunamadı ya da zaten işaretlenmiş." });
    }

    const [rows] = await pdb.query(`SELECT gorev_puani FROM gorevler WHERE gorev_id = ?`, [gorev_id]);

    await pdb.query(`INSERT INTO gorev_takip (kullanici_id, gorev_id) VALUES (?, ?)`, [kullaniciID, gorev_id]);

    const sonuc = await cezaVer(kullaniciID, rows[0].gorev_puani);
    const mesaj = sonuc.oldu
      ? `${sonuc.olenOrdek ?? "Ördeğin"} öldü... Anı defterine eklendi.`
      : "Ördeğin üzüldü, canı azaldı.";

    res.status(200).json({ code: "success", mesaj, ...sonuc });
  } catch (err) {
    console.error("gorevBasarisiz hatası:", err);
    res.status(500).json({ code: "db" });
  }
};

// Kullanıcı bazında gorevler tablosundan listeleme yapalım
const getMyGorev = (req, res) => {
  const kullanici_id = req.tokenPayload.kullanici_id;

  const query = "SELECT * FROM gorevler WHERE kullanici_id = ? AND yapildi_mi =0";

  db.query(query, [kullanici_id], (err, results) => {
    if (err) {
      console.log(err);

      return res.status(500).json({ code: "db" });
    }
    res.status(200).send({ code: "success", gorevler: results });
  });
};

// Kullanıcı bazında görev takiplerinin listelenmesi gerekli (yapıldı-yapılmadı) getYapilanGorevler, getYapilmayanGorevler

//yapılan görevlerin listelenmesi
const getYapilanGorevler = (req, res) => {
   const kullanici_id = req.tokenPayload.kullanici_id;

  const query =
    `SELECT gorevler.gorev_title, gorevler.gorev_body,gorevler.gorev_puani,gorevler.gorev_etiketi , gorev_takip.tarih
     FROM gorevler
    LEFT JOIN gorev_takip 
    ON gorevler.gorev_id = gorev_takip.gorev_id 
    AND gorev_takip.kullanici_id = ? 
    WHERE gorevler.kullanici_id = ? AND yapildi_mi = 1`;
  db.query(query, [kullanici_id, kullanici_id], (err, results) => {
    if (err) {
      return res.status(500).send({ code: "db" });
    }
    res.status(200).send(results);
  });
};
//yapılmayan görevlerin listelenmesi
const getYapilmayanGorevler = (req, res) => {
   const kullanici_id = req.tokenPayload.kullanici_id;

  const query =
      `SELECT gorevler.gorev_title, gorevler.gorev_body,gorevler.gorev_puani,gorevler.gorev_etiketi , gorev_takip.tarih
     FROM gorevler
    LEFT JOIN gorev_takip 
    ON gorevler.gorev_id = gorev_takip.gorev_id 
    AND gorev_takip.kullanici_id = ? 
    WHERE gorevler.kullanici_id = ? AND yapildi_mi = 2`;
  db.query(query, [kullanici_id, kullanici_id], (err, results) => {
    if (err) {
      return res.status(500).send({ code: "db" });
    }
    res.status(200).send(results);
  });
};

module.exports = {
  getGorev,
  addGorev,
  updateGorev,
  deleteGorev,
  gorevBasarili,
  gorevBasarisiz,
  getMyGorev,
  getYapilanGorevler,
  getYapilmayanGorevler,
};
