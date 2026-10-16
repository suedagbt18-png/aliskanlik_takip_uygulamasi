const db = require("../Database/db");

// Gorev listesini getiren fonksiyon
const getGorev = (req, res) => {
  const query = "SELECT * FROM gorevler";

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send("Veritabanında bir hata oluştu. Hata:" + err);
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

  const query = `UPDATE gorevler 
                 SET gorev_title=?, gorev_body=?, gorev_puani=?, gorev_etiketi=?
                 WHERE gorev_id=?`;
  db.query(
    query,
    [gorev_title, gorev_body, gorev_puani, gorev_etiketi, gorev_id],
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
const deleteGorev = (req, res) => {
  const { gorev_id } = req.body;

  const query = `DELETE FROM gorevler
                WHERE gorev_id=?`;

  db.query(query, [gorev_id], (err, result) => {
    if (err) {
      console.error("Veri silme hatası.", err);
      return res
        .status(500)
        .json({ code: "db", mesaj: "Görev bilgisi silinemedi." });
    }
    res.status(200).json({ code: "success", mesaj: "Görev bilgisi silindi." });
  });
};

// Görev tamamlama fonksiyonu !!!!!!!!!! kullanıcı her seviye atladığında tecrübe puanı sıfırlanmalı !!!!!!!!!! --> onun dışında herşey çalışıyor.
const gorevBasarili = (req, res) => {
  // Alınan kayıt üzerinden ilgili paremetreleri al
  const {
    gorev_id,
    kullanici_id,
    gorev_title,
    gorev_body,
    gorev_puani,
    gorev_etiketi,
  } = req.body;
  const kullaniciID = req.tokenPayload.kullanici_id;

  //Görev ID üzerinden gorevler tablosundaki ilgili kaydı al+
  const findGorevQuery = "SELECT * FROM gorevler WHERE gorev_id = ?";

  db.query(findGorevQuery, [gorev_id], (gorevErr, gorevResults) => {
    if (gorevErr) {
      console.log("hata", gorevErr);

      return res.status(500).send({ code: "db" });
    }
    const gorevInfo = gorevResults[0];

    const query = `SELECT * FROM gorevler
                WHERE kullanici_id=? AND gorev_id = ?`;
    db.query(query, [kullaniciID, gorev_id], (err1, results1) => {
      if (err1) {
        return res.status(500).json({ code: "db", mesaj: "Hata oluştu" });
      }
      if (results1.length === 0) {
        return res
          .status(400)
          .json({ code: "notFound", mesaj: "Böyle bir görev bulunamadı." });
      }

      // gorev_takip tablosuna kayıt ekle
      const takipQuery = `INSERT INTO gorev_takip (kullanici_id,gorev_id) VALUES(?,?)`;
      db.query(takipQuery, [kullaniciID, gorev_id], (err3) => {
        if (err3) {
          return res
            .status(500)
            .json({ code: "db", mesaj: "Görev takip tablosuna eklenemedi." });
        }

        // kullanıcı tecrübe puanını al
        const mevcut_tecrube = `SELECT kullanici_tecrübe FROM kullanicilar WHERE kullanici_id =?`;
        db.query(mevcut_tecrube, [kullaniciID], (err4, results) => {
          if (err4) {
            return res
              .status(500)
              .json({ code: "db", mesaj: "Mevcut tecrübe alınamadı." });
          }
          if (results.length === 0) {
            return res
              .status(404)
              .json({ code: "notFound", mesaj: "Kullanıcı bulunamadı." });
          }

          //tecrübe puanına görev puanını ekle
          const mevcut_tecrube = results[0].kullanici_tecrübe;
          let yeni_tecrube = mevcut_tecrube + gorevInfo.gorev_puani;

          // Güncel kullanici_tecrube değerini al,
          const updateTecrube = ` UPDATE kullanicilar
                       SET kullanici_tecrübe = ?
                       WHERE kullanici_id = ?`;

          db.query(updateTecrube, [yeni_tecrube, kullaniciID], (err5) => {
            if (err5) {
              return res
                .status(500)
                .json({ code: "db", mesaj: "Tecrübe puanı güncellenemedi." });
            }

             //gorev tablosunda ilgili kaydın yapildi kısmını güncelle yapıldı =1 
             const updateYapildiQuery = `UPDATE gorevler 
                                        SET yapildi_mi = 1
                                        WHERE gorev_id =?`;
              db.query(updateYapildiQuery,[gorev_id], (err,result)=>{
                if(err){
                  console.error('Gorev durumu güncellenemedi.',err);
                  return res.status(500).json({code: "db", mesaj: "Gorev  durumu güncellenemedi."})
                }
             


              // Kullanıcının seviyesini belirleme işlemleri

              //mevcut seviyeyi al
              const mevcutSeviyeQuery = `SELECT kullanici_seviyesi FROM kullanicilar WHERE kullanici_id =?`;
              db.query(
                mevcutSeviyeQuery,
                kullaniciID,
                (err, mevcutResults) => {
                  if (err) {
                    return res
                      .status(500)
                      .json({ code: "db", mesaj: "Mevcut seviye alınamadı." });
                  }

                  const mevcutSeviye = mevcutResults[0].kullanici_seviyesi;

                  // yeni seviyeyi belirle
                  const seviyeBelirlemeQuery =
                    "SELECT seviye FROM seviye_puanlari WHERE seviye_puanlari_puan = ?";
                  db.query(
                    seviyeBelirlemeQuery,
                    yeni_tecrube,
                    (err, yeniResults) => {
                      if (err) {
                        return res.status(500).send({ code: "db" });
                      }

                      const belirlenenSeviye = yeniResults[0].seviye;

                      //Eğer yeni seviye > mevcut seviye ise, seviye güncelle ve puanı sıfırla
                      let updateSeviyeQuery;
                      let updateSeviyeParams;

                      if (belirlenenSeviye > mevcutSeviye) {
                        updateSeviyeQuery = `UPDATE kullanicilar 
                                        SET kullanici_seviyesi = ?, kullanici_tecrübe = 0, kullanici_saglik = 50
                                        WHERE kullanici_id =?`;
                        updateSeviyeParams = [belirlenenSeviye, kullaniciID];
                      } else {
                        updateSeviyeQuery = `UPDATE kullanicilar 
                                         SET kullanici_seviyesi =?
                                         WHERE kullanici_id=?`;
                        updateSeviyeParams = [belirlenenSeviye, kullaniciID];
                      }

                      db.query(
                        updateSeviyeQuery,
                        updateSeviyeParams,
                        (err, results) => {
                          if (err) {
                            return res.status(500).json({
                              code: "db",
                              mesaj: "Seviye bilgisi güncellenemedi.",
                            });
                          }

                          //unvan güncelle
                          const getSeviyeQuery = `SELECT* FROM seviyeler`;
                          db.query(getSeviyeQuery, (err, results) => {
                            if (err) {
                              return res.status(500).json({
                                code: "db",
                                mesaj: "Seviye alınamadı.",
                              });
                            }
                            const filteredValue = results.filter(
                              (x) =>
                                x.seviye_araligi_baslangic <=
                                  belirlenenSeviye &&
                                x.seviye_araligi_bitis >= belirlenenSeviye
                            );

                            const unvan = filteredValue[0].unvan;

                            const updateUnvanQuery =
                              "UPDATE kullanicilar SET kullanici_unvan =? WHERE kullanici_id =?";
                            db.query(
                              updateUnvanQuery,
                              [unvan, kullaniciID],
                              (err) => {
                                if (err) {
                                  return res.status(500).json({
                                    code: "db",
                                    mesaj: "Unvan güncellenemedi.",
                                  });
                                }
                                return res.status(200).json({
                                  code: "succes",
                                  mesaj:
                                    "Seviye ve unvan başarıyla güncellendi.",
                                  yeni_seviye: belirlenenSeviye,
                                  yeni_unvan: unvan,
                                  tecrübe:
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
  });
};

//Görev tamamlamama fonksiyonu
const gorevBasarisiz = (req, res) => {
  //gerekli parametreleri al.
  const {
    gorev_id,
    kullanici_id,
    gorev_title,
    gorev_body,
    gorev_puani,
    gorev_etiketi,
  } = req.body;
   const kullaniciID = req.tokenPayload.kullanici_id;

  // görev id üzerinden ilgili kaydı al.
  const findGorevQuery = "SELECT * FROM gorevler WHERE gorev_id = ?";

  db.query(findGorevQuery, gorev_id, (err6, results6) => {
    if (err6) {
      console.log(err6);

      return res.status(500).send({ code: "db" });
    }
    const gorevInfo = results6[0];
    console.log(gorevInfo);

    // gorev_takip tablosuna kayıt ekle
    const takipQuery = `INSERT INTO gorev_takip (kullanici_id,gorev_id) VALUES(?,?)`;
    db.query(takipQuery, [kullaniciID, gorev_id], (err8) => {
      if (err8) {
        return res
          .status(500)
          .json({ code: "db", mesaj: "Görev takip tablosuna eklenemedi." });
      }

      //kullanıcı sağlık puanını al
      const mevcut_saglikQuery = `SELECT kullanici_saglik, kullanici_seviyesi FROM kullanicilar WHERE kullanici_id = ?`;
      db.query(mevcut_saglikQuery, [kullaniciID], (err9, results9) => {
        if (err9) {
          return res
            .status(500)
            .json({ code: "db", mesaj: "mevcut sağlık alınamadı." });
        }
        if (results9.length === 0) {
          return res
            .status(404)
            .json({ code: "notFound", mesaj: "Kullanıcı bulunamadı." });
        }

        // sağlık puanından görev puanını düşür.
        const mevcut_saglik = results9[0].kullanici_saglik;
        console.log("Mevcut sağlık:" + mevcut_saglik);

        let yeni_saglik = mevcut_saglik - gorevInfo.gorev_puani;
        console.log("Yeni sağlık:" + yeni_saglik);

        let kullaniciMevcutSeviye = results9[0].kullanici_seviyesi;

        // sağlık puanı durumuna göre seviye belirleme
        if (yeni_saglik <= 0) {
          let kullaniciGuncelSeviye = kullaniciMevcutSeviye - 1;

          const findSeviyelerQuery = "SELECT * FROM seviyeler";

          db.query(findSeviyelerQuery, (err, results) => {
            if (err) {
              return res
                .status(500)
                .json({ code: "db", mesaj: "Veritabanı hatası oluştu." });
            }

            const seviyeler = results;

            let temp = seviyeler.filter(
              (x) =>
                x.seviye_araligi_baslangic <= kullaniciGuncelSeviye &&
                x.seviye_araligi_bitis >= kullaniciGuncelSeviye
            );

            let yeniUnvan = temp[0].unvan;

            // güncel kullanici_saglik değerini al
            const updateSaglik = `UPDATE kullanicilar
                           SET kullanici_saglik = 50,kullanici_tecrübe =0, kullanici_seviyesi = ?, kullanici_unvan = ?
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

                 //gorevin tamamlanmama durumunu güncelle yapılmadı=2

                  const updateTamamlanmadıQuery = `UPDATE gorevler 
                                                   SET yapildi_mi=2
                                                   WHERE gorev_id =?`;
                db.query(updateTamamlanmadıQuery,[gorev_id],(err,results)=>{
                  if(err){
                    console.log("Gorev durumu güncellenemedi ",err)
                    return res.status(500).json({code:"db",mesaj:"Gorev durumu güncellenemedi."})
                  }

                  return res.status(200).send({
                    code: "success",
                    message: "Seviyenizi kaybettiniz.",
                    yeni_seviye: kullaniciGuncelSeviye,
                    yeni_unvan: yeniUnvan,
                    tecrübe: 0,
                    saglik: 50,
                  });
                });
              }
            );
          });
        } else {
          // güncel kullanici_saglik değerini al
          const updateSaglik = `UPDATE kullanicilar
                           SET kullanici_saglik = ?
                           WHERE kullanici_id = ?`;

          db.query(
            updateSaglik,
            [yeni_saglik, kullaniciID],
            (err10, results) => {
              if (err10) {
                return res
                  .status(500)
                  .json({ mesaj: "Sağlık puanı güncellenemedi.2" });
              }

             

                  //gorevin tamamlanmama durumunu güncelle yapılmadı=2

                  const updateTamamlanmadıQuery = `UPDATE gorevler 
                                                   SET yapildi_mi=2
                                                   WHERE gorev_id =?`;
                db.query(updateTamamlanmadıQuery,[gorev_id],(err,results)=>{
                  if(err){
                    console.log("Gorev durumu güncellenemedi ",err)
                    return res.status(500).json({code:"db",mesaj:"Gorev durumu güncellenemedi."})
                  }

               

                return res.status(200).send({
                  code: "success",
                  message: "Sağlık puanın azalıyor.",
                });
              });
            }
          );
        }
      });
    });
  });
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
    WHERE yapildi_mi=1`;
  db.query(query, [kullanici_id], (err, results) => {
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
    WHERE yapildi_mi=2;`;
  db.query(query, [kullanici_id], (err, results) => {
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
