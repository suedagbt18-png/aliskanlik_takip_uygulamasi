const db = require("../Database/db");

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
        code: " alreadyExist",
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
const aliskanlikBasarili = (req, res) => {
  // gerekli kayıtları al.
  const {
    aliskanlik_id,
    kullanici_id,
    aliskanlik_body,
    aliskanlik_title,
    aliskanlik_puani,
    aliskanlik_etiketi,
  } = req.body;
  const kullaniciID = req.tokenPayload.kullanici_id;


  // aliskalnlik ID ile ilgili parametreleri al

  const findAliskanlikQuery = `SELECT * FROM aliskanliklar WHERE aliskanlik_id=? AND kullanici_id = ? AND yapildi_mi = 0`;
  db.query(findAliskanlikQuery, [aliskanlik_id,kullaniciID], (err, results) => {
    if (err) {
      console.log(err);

      return res
        .status(500)
        .json({ code: "db", mesaj: "Böyle bir alışkanlık bulunamadı." });
    }

    const aliskanlikInfo = results[0];
    console.log(aliskanlikInfo);

    //alışkanlık takip tablosuna ekledi.
    const takipQuery = `INSERT INTO aliskanlik_takip (kullanici_id,aliskanlik_id) VALUES (?,?)`;
    db.query(takipQuery, [kullaniciID, aliskanlik_id], (err1, results1) => {
      if (err1) {
        console.log(err1);

        return res
          .status(500)
          .json({ code: "db", mesaj: "Takip tablosuna eklenemedi." });
      }

      //kullanıcı tecrübe puanını al
      const mevcutTecrubeQuery = `SELECT kullanici_tecrübe FROM kullanicilar WHERE kullanici_id =?`;
      db.query(mevcutTecrubeQuery, [kullaniciID], (err, results) => {
        if (err) {
          return res
            .status(500)
            .json({ code: "db", mesaj: " mevcut tecrübe puanı alınamadı." });
        }

        if (results.length === 0) {
          return res
            .status(404)
            .json({ code: "notFound", mesaj: "Kullanıcı bulunamadı." });
        }

        //tecrübe puanına aliskanlik puanını ekle
        const mevcut_tecrube = results[0].kullanici_tecrübe;
        let yeni_tecrube = mevcut_tecrube + aliskanlikInfo.aliskanlik_puani;

        //güncel kullanıcı tecrübe değeri
        const updateTecrube = `UPDATE kullanicilar
                               SET kullanici_tecrübe=?
                               WHERE kullanici_id = ?`;
        db.query(updateTecrube, [yeni_tecrube, kullaniciID], (err) => {
          if (err) {
            return res
              .status(500)
              .json({ code: "db", mesaj: "Tecrübe puanı güncellenemedi." });
          }

          // alışkanlıklar tablosunda alışkanlık durumunu güncelle yapildi=1

          const updateAliskanlikDurumuQuery= `UPDATE aliskanliklar
                                              SET yapildi_mi=1
                                              WHERE aliskanlik_id =?`;
            db.query(updateAliskanlikDurumuQuery,[aliskanlik_id],(err,results)=>{
              if(err){
                console.log("Alışkanlık durumu güncellenemedi.",err);
                return res.status(500).json({code:"db",mesaj:"Alışkanlık durumu güncellenemedi."})
              }
          
         
            // seviye işlemleri

            // 1. Önce kullanıcının mevcut seviyesini al
            const mevcutSeviyeQuery = `SELECT kullanici_seviyesi FROM kullanicilar WHERE kullanici_id = ?`;
            db.query(
              mevcutSeviyeQuery,
              [kullaniciID],
              (err, mevcutResults) => {
                if (err) {
                  return res
                    .status(500)
                    .send({ code: "db", mesaj: "Mevcut seviye alınamadı." });
                }

                const mevcutSeviye = mevcutResults[0].kullanici_seviyesi;

                // 2. Yeni seviyeyi belirle
                const seviyeBelirlemeQuery = `SELECT seviye FROM seviye_puanlari WHERE seviye_puanlari_puan = ?`;
                db.query(
                  seviyeBelirlemeQuery,
                  [yeni_tecrube],
                  (err, seviyeResults) => {
                    if (err) {
                      return res.status(500).send({ code: "db" });
                    }

                    const belirlenenSeviye = seviyeResults[0].seviye;

                    // 3. Eğer yeni seviye > mevcut seviye ise, seviye güncelle ve XP'yi sıfırla
                    let updateSeviyeQuery;
                    let updateSeviyeParams;

                    if (belirlenenSeviye > mevcutSeviye) {
                                        updateSeviyeQuery = `
                          UPDATE kullanicilar 
                          SET kullanici_seviyesi = ?, kullanici_tecrübe = 0 , kullanici_saglik = 50
                          WHERE kullanici_id = ?
                        `;
                      updateSeviyeParams = [belirlenenSeviye, kullaniciID];
                    } else {
                      updateSeviyeQuery = `
                                    UPDATE kullanicilar 
                                    SET kullanici_seviyesi = ? 
                                    WHERE kullanici_id = ?
                                  `;
                      updateSeviyeParams = [belirlenenSeviye, kullaniciID];
                    }

                    db.query(
                      updateSeviyeQuery,
                      updateSeviyeParams,
                      (err, results) => {
                        if (err) {
                          console.log("hata"+err);
                          
                          return res.status(500).json({
                            code: "db",
                            mesaj: "Seviye bilgisi güncellenemedi.",
                          });
                        }

                        //unvan güncelle
                        const getSeviyeQuery = "SELECT * FROM seviyeler";
                        db.query(getSeviyeQuery, (err, results) => {
                          if (err) {
                            return res
                              .status(500)
                              .json({ code: "db", mesaj: "Seviye alınamadı." });
                          }

                          const filteredValue = results.filter(
                            (x) =>
                              x.seviye_araligi_baslangic <= belirlenenSeviye &&
                              x.seviye_araligi_bitis >= belirlenenSeviye
                          );
                          const unvan = filteredValue[0].unvan;

                          const updateUnvanQuery = `
                              UPDATE kullanicilar
                              SET kullanici_unvan = ?
                              WHERE kullanici_id = ?
                            `;

                          db.query(
                            updateUnvanQuery,
                            [unvan, kullaniciID],
                            (err3) => {
                              if (err3) {
                                return res.status(500).json({
                                  code: "db",
                                  mesaj: "Unvan güncellenemedi",
                                  hata: err3,
                                });
                              }

                              return res.status(200).json({
                                code: "success",
                                mesaj: "Seviye ve unvan başarıyla güncellendi.",
                                yeni_seviye: belirlenenSeviye,
                                yeni_unvan: unvan,
                                puan:
                                  belirlenenSeviye > mevcutSeviye
                                    ? 0
                                    : yeni_tecrube,
                              });
                            }
                          );
                        });
                       
                      }
                    );
                  }
                );
              }
            );
          });
        });
      });
    });
  });
};

//alışkanlık tamamlamama fonksiyonu çalışıyor. seviyesi düştüğünde sağlık puanı yenilenip 50 oluyor tecrübe puanı da sıfırlanıyor.
const aliskanlikBasarisiz = (req, res) => {
  // gerekli parametreleri al
  const {
    aliskanlik_id,
    kullanici_id,
    aliskanlik_body,
    aliskanlik_title,
    aliskanlik_puani,
    aliskanlik_etiketi,
  } = req.body;
    const kullaniciID = req.tokenPayload.kullanici_id;

  // alışkanlık id üzerinden ilgili kaydı al.

  const findAliskanlikQuery =
    "SELECT * FROM aliskanliklar WHERE aliskanlik_id= ? AND kullanici_id = ? AND yapildi_mi = 0 ";
  db.query(findAliskanlikQuery, [aliskanlik_id,kullaniciID], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ code: "db", mesaj: "Alışkanlık bilgisi alınamadı." });
    }
    const aliskanlikInfo = results[0];
    console.log(aliskanlikInfo);

    //alışkanlık takip tablosuna ekle
    const takipQuery = `INSERT INTO aliskanlik_takip (kullanici_id, aliskanlik_id) VALUES(?,?)`;
    db.query(takipQuery, [kullaniciID, aliskanlik_id], (err) => {
      if (err) {
        return res.status(500).json({
          code: "db",
          mesaj: "Alışkanlık takip tablosuna eklenemedi.",
        });
      }

      // KUllanıcı sağlık puanın al.
      const mevcut_saglikQuery = `SELECT kullanici_saglik, kullanici_seviyesi FROM kullanicilar WHERE kullanici_id = ?`;
      db.query(mevcut_saglikQuery, [kullaniciID], (err, results) => {
        if (err) {
          return res
            .status(500)
            .json({ code: "db", mesaj: "Mevcut sağlık değeri alınamadı." });
        }
        if (results.length === 0) {
          return res
            .status(404)
            .json({ code: "notFound", mesaj: "Kullanıcı bulunamadı." });
        }

        // sağlık puanından görev puanını düşür.
        const mevcut_saglik = results[0].kullanici_saglik;
        console.log("mevcut sağlık" + mevcut_saglik);

        let yeni_saglik = mevcut_saglik - aliskanlikInfo.aliskanlik_puani;
        console.log("Yeni sağlık" + yeni_saglik);

        let kullaniciMevcutSeviye = results[0].kullanici_seviyesi;

        // kullanıcı seviyesini belirleme işlemleri
        if (yeni_saglik <= 0) {
          let kullaniciGuncelSeviye = kullaniciMevcutSeviye - 1;

          const findAliskanlikQuery = "SELECT * FROM seviyeler";

          db.query(findAliskanlikQuery, (err, results) => {
            if (err) {
              return res
                .status(500)
                .json({ code: "db", mesaj: "alışkanlık bulunamadı." });
            }

            const seviyeler = results;

            let temp = seviyeler.filter(
              (x) =>
                x.seviye_araligi_baslangic <= kullaniciGuncelSeviye &&
                x.seviye_araligi_bitis >= kullaniciGuncelSeviye
            );

            let yeniUnvan = temp[0].unvan;

            // güncel kullanıcı sağlık değerini al.
            const updateSaglik = `UPDATE kullanicilar
                           SET kullanici_saglik = 50, kullanici_tecrübe= 0, kullanici_seviyesi = ?, kullanici_unvan = ?
                           WHERE kullanici_id = ?`;
            db.query(
              updateSaglik,
              [kullaniciGuncelSeviye, yeniUnvan, kullaniciID],
              (err10, results) => {
                if (err10) {
                  return res.status(500).json({
                    code: "db",
                    mesaj: "Sağlık puanı güncellenemedi.1",
                  });
                }

                //alışkanlık tablosunda alışkanlık durumunu güncelle yapilmadı = 2
                const updateAliskanlikDurumuQuery = `UPDATE aliskanliklar
                                                     SET yapildi_mi =2
                                                     WHERE aliskanlik_id=?`;
                  db.query(updateAliskanlikDurumuQuery,[aliskanlik_id],(err,results)=>{
                   if(err){
                console.log("Alışkanlık durumu güncellenemedi.",err);
                return res.status(500).json({code:"db",mesaj:"Alışkanlık durumu güncellenemedi."})
              }
                  
                
                  return res.status(200).send({
                    code: "succes",
                    mesaj: "Seviyenizi kaybettiniz.",
                     yeni_seviye:kullaniciGuncelSeviye,
                    yeni_unvan:yeniUnvan,
                    tecrübe:0,
                    saglik:50
                  });
                });
              }
            );
          });
        } else {
          //güncel kullanıcı sağlık değerini al.
          const updateSaglik = `UPDATE kullanicilar
                               SET kullanici_saglik = ?
                               WHERE kullanici_id = ?`;
          db.query(
            updateSaglik,
            [yeni_saglik, kullaniciID],
            (err, results) => {
              if (err) {
                return res.status(500).json({
                  code: "db",
                  mesaj: "Yeni sağlık değeri girilemedi.",
                });
              }
                   //alışkanlık tablosunda alışkanlık durumunu güncelle yapilmadı = 2
                const updateAliskanlikDurumuQuery = `UPDATE aliskanliklar
                                                     SET yapildi_mi =2
                                                     WHERE aliskanlik_id=?`;
                  db.query(updateAliskanlikDurumuQuery,[aliskanlik_id],(err,results)=>{
                   if(err){
                console.log("Alışkanlık durumu güncellenemedi.",err);
                return res.status(500).json({code:"db",mesaj:"Alışkanlık durumu güncellenemedi."})
              }
                  
                return res.status(200).send({
                  code: "success",
                  message: "Sağlık puanınız azalıyor.",
                });
              });
            }
          );
        }
      });
    });
  });
};


// Kullanıcı bazında aliskanliklar tablosundan listeleme yapalım
const getMyAliskanlik = (req, res)=>{

 const kullanici_id = req.tokenPayload.kullanici_id;

  const query = "SELECT * FROM aliskanliklar WHERE kullanici_id =? AND yapildi_mi=0";

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
