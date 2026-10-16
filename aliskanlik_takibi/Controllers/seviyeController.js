const db = require("../Database/db");

// seviyeyi getiren fonksiyon
const getSeviye = (req, res) => {
  const query = "SELECT * FROM seviyeler";

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send("Veritabanında bir hata oluştu. Hata:" + err);
    }

    res.status(200).send(results);
  });
};

// seviye ekleyen fonksiyon
const addSeviye = (req, res) => {
  const { seviye_araligi_baslangic, seviye_araligi_bitis, unvan } = req.body;

  const query = `INSERT INTO seviyeler (seviye_araligi_baslangic, seviye_araligi_bitis, unvan)  VALUES(?,?,?)`;

  db.query(
    query,
    [seviye_araligi_baslangic, seviye_araligi_bitis, unvan],
    (err, result) => {
      if (err) {
        console.error("Veri ekleme hatası:", err);
        return res.status(500).json({ mesaj: "Seviye bilgisi eklenemedi." });
      }
      res.status(201).json({ mesaj: "Seviye bilgisi eklendi." });
    }
  );
};

//seviye güncelleme fonksiyonu

const updateSeviye = (req, res) => {
  const { seviye_araligi_baslangic, seviye_araligi_bitis, unvan, seviye_id} = req.body;

  const query = `UPDATE seviyeler 
                  SET seviye_araligi_baslangic = ?, seviye_araligi_bitis = ?, unvan = ?
                  WHERE seviye_id = ?`;
  db.query(
    query,
    [seviye_araligi_baslangic, seviye_araligi_bitis, unvan,seviye_id],
    (err, results) => {
      if (err) {
        console.error("Veri güncelleme hatası:", err);
        return res
          .status(500)
          .json({ mesaj: "Seviye bilgisi güncellenemedi." });
      }
      res.status(201).json({ mesaj: "Seviye bilgisi güncellendi." });
    }
  );
};

//seviye silme fonksiyonu
const deleteSeviye = (req, res) => {
  const { seviye_id } = req.body;

  const query = `DELETE FROM seviyeler
                  WHERE seviye_id=?`;

  db.query(query, [seviye_id], (err, results) => {
    if (err) {
      console.error("Veri silme hatası:", err);
      return res.status(500).json({ mesaj: "Seviye bilgisi silinemedi." });
    }
    res.status(201).json({ mesaj: "Seviye bilgisi silindi." });
  });
};
module.exports = { getSeviye, addSeviye, updateSeviye,deleteSeviye };
