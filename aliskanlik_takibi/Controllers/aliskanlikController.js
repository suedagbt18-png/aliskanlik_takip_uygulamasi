const db = require("../Database/db");

const pdb = db.promise();
const { odulVer, cezaVer, IYILESME } = require("../Services/ordekService");

//Alışkanlıkların listesini getiren fonksiyon
const getAliskanlik = (req, res) => {
    const kullaniciID = req.tokenPayload.kullanici_id;
  const query = "SELECT * FROM aliskanliklar WHERE kullanici_id = ?";

  db.query(query, [kullaniciID], (err, results) => {
    if (err) {
      return res.status(500).json({ code: "db" });
    }
    res.status(200).send(results);
  });
};


//Alışkanlık ekleme fonksiyonu

const addAliskanlik = (req, res) => {
  const {
    aliskanlik_title,
    aliskanlik_body,
    aliskanlik_puani,
    aliskanlik_etiketi,
  } = req.body;

  const kullaniciID = req.tokenPayload.kullanici_id;
  //kontrol et

  const checkQuery = `
SELECT * FROM aliskanliklar
WHERE kullanici_id= ? AND aliskanlik_title=? `;

  db.query(checkQuery, [kullaniciID, aliskanlik_title], (err, results) => {
    if (err) {
      return res.status(500).json({ code: "db", mesaj: "Hata oluştu." });
    }
    if (results.length > 0) {
      return res.status(400).json({
        code: "alreadyExist",
        mesaj: "Bu alışkanlığı zaten eklediniz.",
      });
    }

    //ekle
    const query = `INSERT INTO aliskanliklar (kullanici_id, aliskanlik_title,aliskanlik_body,aliskanlik_puani,aliskanlik_etiketi ) VALUES(?,?,?,?,?)`;

    db.query(
      query,
      [
        kullaniciID,
        aliskanlik_title,
        aliskanlik_body,
        aliskanlik_puani,
        aliskanlik_etiketi,
      ],
      (err, results) => {
        if (err) {
          console.error("Veri ekleme hatası:", err);
          return res
            .status(500)
            .json({ code: "db",mesaj: "Alışkanlık bilgisi eklenemedi." });
        }
        res.status(201).json({code:"success", mesaj: "Alışkanlık bilgisi eklendi." });
      }
    );
  });
};

// Alışkanlık güncelleme fonksiyonu

const updateAliskanlik = (req, res) => {
  const {
    aliskanlik_title,
    aliskanlik_body,
    aliskanlik_puani,
    aliskanlik_etiketi,
    aliskanlik_id,
  } = req.body;
  const kullaniciID = req.tokenPayload.kullanici_id;
  const query = `UPDATE aliskanliklar 
                 SET  aliskanlik_title =?,aliskanlik_body=?,aliskanlik_puani=?,aliskanlik_etiketi=?
                 WHERE aliskanlik_id =? AND kullanici_id=? `;

  db.query(
    query,
    [
      aliskanlik_title,
      aliskanlik_body,
      aliskanlik_puani,
      aliskanlik_etiketi,
      aliskanlik_id,
      kullaniciID
    ],
    (err, results) => {
      if (err) {
        console.error("Veri ekleme hatası.", err);
        return res
          .status(500)
          .json({ mesaj: "Alışkanlık bilgisi güncellenemedi." });
      }
      res.status(201).json({ mesaj: "Alışkanlık bilgisi güncellendi." });
    }
  );
};

//Alışkanlık silme fonksiyonu

const deleteAliskanlik = (req, res) => {
  const { aliskanlik_id } = req.body;
  const kullaniciID = req.tokenPayload.kullanici_id;

  const query = `DELETE FROM aliskanliklar
                WHERE aliskanlik_id=? AND kullanici_id = ?`;
  db.query(query, [aliskanlik_id,kullaniciID], (err, results) => {
    if (err) {
      console.error("Veri silme hatasi.", err);
      return res.status(500).json({ mesaj: "Alışkanlık bilgisi silinemedi." });
    }
    res.status(201).json({ mesaj: "Alışkanlık bilgisi silindi." });
  });
};

// alışkanlık tamamlama fonksiyonu kullanici seviyesi arttığında sağlık puanı 50 oluyor tecrübe puanı sıfır oluyor.
const aliskanlikBasarili = async (req, res) => {
  const { aliskanlik_id } = req.body;
  const kullaniciID = req.tokenPayload.kullanici_id;

  try {
    // 1. İşaretle ve seriyi güncelle: sadece bu kullanıcınınsa ve bugün işaretlenmediyse
    //    (seri, son_yapilma_tarihi'nden ÖNCE yazıldığı için eski tarihe bakarak hesaplanır)
    const [isaret] = await pdb.query(
      `UPDATE aliskanliklar
       SET seri = IF(son_yapilma_tarihi = CURDATE() - INTERVAL 1 DAY, seri + 1, 1),
           son_yapilma_tarihi = CURDATE()
       WHERE aliskanlik_id = ? AND kullanici_id = ?
         AND (son_yapilma_tarihi IS NULL OR son_yapilma_tarihi < CURDATE())
         AND (son_basarisiz_tarihi IS NULL OR son_basarisiz_tarihi < CURDATE())`,
      [aliskanlik_id, kullaniciID]
    );
    if (isaret.affectedRows === 0) {
      return res.status(404).json({ code: "notFound", mesaj: "Alışkanlık bulunamadı ya da bugün zaten işaretlendi." });
    }

    const [rows] = await pdb.query(`SELECT aliskanlik_puani, seri FROM aliskanliklar WHERE aliskanlik_id = ?`, [aliskanlik_id]);
    const { aliskanlik_puani, seri } = rows[0];

    // 2. Takip tablosuna kayıt (ileride istatistik ekranında kullanacağız)
    await pdb.query(
      `INSERT INTO aliskanlik_takip (kullanici_id, aliskanlik_id, tarih, yapildi_mi) VALUES (?, ?, CURDATE(), 1)`,
      [kullaniciID, aliskanlik_id]
    );

    // 3. Ödül: XP + can
    const sonuc = await odulVer(kullaniciID, aliskanlik_puani, IYILESME);

    res.status(200).json({ code: "success", mesaj: "Alışkanlık tamamlandı!", seri, ...sonuc });
  } catch (err) {
    console.error("aliskanlikBasarili hatası:", err);
    res.status(500).json({ code: "db" });
  }
};

//alışkanlık tamamlamama fonksiyonu çalışıyor. seviyesi düştüğünde sağlık puanı yenilenip 50 oluyor tecrübe puanı da sıfırlanıyor.
const aliskanlikBasarisiz = async (req, res) => {
  const { aliskanlik_id } = req.body;
  const kullaniciID = req.tokenPayload.kullanici_id;

  try {
    const [isaret] = await pdb.query(
      `UPDATE aliskanliklar
       SET seri = 0, son_basarisiz_tarihi = CURDATE()
       WHERE aliskanlik_id = ? AND kullanici_id = ?
         AND (son_yapilma_tarihi IS NULL OR son_yapilma_tarihi < CURDATE())
         AND (son_basarisiz_tarihi IS NULL OR son_basarisiz_tarihi < CURDATE())`,
      [aliskanlik_id, kullaniciID]
    );
    if (isaret.affectedRows === 0) {
      return res.status(404).json({ code: "notFound", mesaj: "Alışkanlık bulunamadı ya da bugün zaten işaretlendi." });
    }

    const [rows] = await pdb.query(`SELECT aliskanlik_puani FROM aliskanliklar WHERE aliskanlik_id = ?`, [aliskanlik_id]);

    await pdb.query(
      `INSERT INTO aliskanlik_takip (kullanici_id, aliskanlik_id, tarih, yapildi_mi) VALUES (?, ?, CURDATE(), 0)`,
      [kullaniciID, aliskanlik_id]
    );

    const sonuc = await cezaVer(kullaniciID, rows[0].aliskanlik_puani);
    const mesaj = sonuc.oldu
      ? `${sonuc.olenOrdek ?? "Ördeğin"} öldü... Anı defterine eklendi.`
      : "Ördeğin üzüldü, canı azaldı.";

    res.status(200).json({ code: "success", mesaj, ...sonuc });
  } catch (err) {
    console.error("aliskanlikBasarisiz hatası:", err);
    res.status(500).json({ code: "db" });
  }
};


// Kullanıcı bazında aliskanliklar tablosundan listeleme yapalım
const getMyAliskanlik = (req, res)=>{

 const kullanici_id = req.tokenPayload.kullanici_id;

    const query = `
    SELECT aliskanlik_id, aliskanlik_title, aliskanlik_body, aliskanlik_puani, aliskanlik_etiketi,
      CASE WHEN son_yapilma_tarihi < CURDATE() - INTERVAL 1 DAY THEN 0 ELSE seri END AS seri,
      CASE WHEN son_yapilma_tarihi = CURDATE() THEN 1
           WHEN son_basarisiz_tarihi = CURDATE() THEN 2
           ELSE 0 END AS yapildi_mi
    FROM aliskanliklar WHERE kullanici_id = ?`;

  db.query(query,[kullanici_id],(err,results)=>{
    if(err){
      return res.status(500).json({code:"db"});
    }
    res.status(200).send({code:"success",aliskanliklar:results});
  });
}


// Kullanıcı bazında alışkanlık takiplerinin listelenmesi gerekli (yapıldı-yapılmadı) getYapilanAliskanliklar, getYapilmayanAliskanliklar
//yapılan alışkanlıkların listelenmesi

const getYapilanAliskanliklar =(req,res) =>{

   const kullanici_id = req.tokenPayload.kullanici_id;

  const query = `SELECT aliskanliklar.aliskanlik_title,aliskanliklar.aliskanlik_body,aliskanliklar.aliskanlik_puani,aliskanliklar.aliskanlik_etiketi,aliskanlik_takip.tarih
                 FROM aliskanliklar
                 LEFT JOIN aliskanlik_takip
                 ON aliskanliklar.aliskanlik_id = aliskanlik_takip.aliskanlik_id
                 AND aliskanlik_takip.kullanici_id =?
                 WHERE aliskanliklar.kullanici_id = ? AND yapildi_mi = 1 `;

  db.query(query,[kullanici_id, kullanici_id],(err,results)=>{
    if(err){
      return res.status(500).send({code:"db"});
    }
    res.status(200).send(results);
  });
}

//yapılmayan alışkanlıkların listesi
const getYapilmayanAliskanliklar =(req,res) =>{
   const kullanici_id = req.tokenPayload.kullanici_id;

  const query=`SELECT aliskanliklar.aliskanlik_title,aliskanliklar.aliskanlik_body,aliskanliklar.aliskanlik_puani,aliskanliklar.aliskanlik_etiketi,aliskanlik_takip.tarih
                 FROM aliskanliklar
                 LEFT JOIN aliskanlik_takip
                 ON aliskanliklar.aliskanlik_id = aliskanlik_takip.aliskanlik_id
                 AND aliskanlik_takip.kullanici_id =?
                 WHERE aliskanliklar.kullanici_id = ? AND yapildi_mi = 2 `;
  db.query(query,[kullanici_id, kullanici_id],(err,results)=>{
    if(err){
      return res.status(500).send({code:"db"});
    }
    res.status(200).send(results);
  });
}

module.exports = {
  getAliskanlik,
  addAliskanlik,
  updateAliskanlik,
  deleteAliskanlik,
  aliskanlikBasarili,
  aliskanlikBasarisiz,
  getMyAliskanlik,
  getYapilanAliskanliklar,
  getYapilmayanAliskanliklar
};
