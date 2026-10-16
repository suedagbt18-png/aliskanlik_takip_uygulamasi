const mysql = require("mysql2");

let baglanti = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "aliskanlik_takibi",
});

baglanti.connect(function (err) {
  if (err) {
    console.log("Veritabanı bağlantısı kurulurken bir hata oluştu. Hata : " + err.message);
  }


  console.log("Veritabanı bağlantısı başarılı bir şekilde kuruldu.");
});

module.exports = baglanti;
