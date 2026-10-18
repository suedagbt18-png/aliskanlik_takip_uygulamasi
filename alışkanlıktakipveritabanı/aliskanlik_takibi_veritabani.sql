#CREATE DATABASE aliskanlik_takibi;
/*
CREATE TABLE kullanicilar (
kullanici_id INT PRIMARY KEY,
kullanicilarkullanici_adi VARCHAR(50),
kullanici_soyadi VARCHAR(50),
kullanici_eposta VARCHAR(50),
kullanici_nickname VARCHAR(50),
kullanici_sifre VARCHAR(50),
kullanici_seviyesi INT,
kullanici_saglik INT,
kullanici_tecrübe INT,
kullanici_unvan VARCHAR(50)
);

CREATE TABLE aliskanliklar (
aliskanlik_id INT PRIMARY KEY,
kullanici_id INT,
aliskanlik_title VARCHAR(50),
aliskanlik_body VARCHAR(100),
aliskanlik_puani INT,
aliskanlik_etiketi VARCHAR(50),
FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(kullanici_id)
);

CREATE TABLE aliskanlik_takip (
takip_id INT PRIMA	RY KEY, 
kullanici_id INT,
aliskanlik_id INT,
tarih DATE,
yapildi_mi boolean,
FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(kullanici_id),kullanici_seviyesi
FOREIGN KEY (aliskanlik_id) REFERENCES aliskanliklar(aliskanlik_id)
);

CREATE TABLE gorevler (
gorev_id INT PRIMARY KEY,
kullanici_id INT,
gorev_title VARCHAR(50),
gorev_body VARCHAR(100),
gorev_puani INT,
gorev_etiketi VARCHAR(50),
FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(kullanici_id)
);

CREATE TABLE gorev_takip (
takip_id INT PRIMARY KEY,
kullanici_id INT,
gorev_id INT,
tarih DATE,
yapildi_mi boolean,
FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(kullanici_id)
);

CREATE TABLE seviyeler (
seviye_id INT PRIMARY KEY,
seviye_araligi_baslangic INT, 
seviye_araligi_bitis INT, 
unvan VARCHAR(50) 
);

# sütunun adını değiştirdim
ALTER TABLE aliskanlik_takip
CHANGE takip_id aliskanlik_takip_id INT;

# sütunun adını değiştirdim
ALTER TABLE gorev_takip
CHANGE takip_id gorev_takip_id INT;

#ALTER TABLE kullanicilar
#MODIFY COLUMN kullanici_sifre VARCHAR(150);  kullanicilar



#ALTER TABLE aliskanliklar DROP FOREIGN KEY aliskanliklar_ibfk_1;
#ALTER TABLE gorevler DROP FOREIGN KEY gorevler_ibfk_1;
#ALTER TABLE aliskanlik_takip DROP FOREIGN KEY aliskanlik_takip_ibfk_1;
#ALTER TABLE gorev_takip DROP FOREIGN KEY gorev_takip_ibfk_1;aliskanliklarkullanicilar
#ALTER TABLE kullanicilar
#MODIFY kullanici_id INT NOT NULL AUTO_INCREMENT;
/*ALTER TABLE aliskanliklar 
ADD CONSTRAINT aliskanliklar_ibfk_1 
FOREIGN KEY (kullanici_id) 
REFERENCES kullanicilar(kullanici_id);
ALTER TABLE gorevler 
ADD CONSTRAINT gorevler_ibfk_1 
FOREIGN KEY (kullanici_id) 
REFERENCES kullanicilar(kullanici_id);
ALTER TABLE aliskanlik_takip 
ADD CONSTRAINT aliskanlik_takip_ibfk_1 
FOREIGN KEY (kullanici_id) 
REFERENCES kullanicilar(kullanici_id);
ALTER TABLE gorev_takip 
ADD CONSTRAINT gorev_takip_ibfk_1 
FOREIGN KEY (kullanici_id) 
REFERENCES kullanicilar(kullanici_id);
ALTER TABLE kullanicilar 
MODIFY Column kullanici_seviyesi INT DEFAULT 1;


SELECT * FROM kullanicilar;


#ALTER TABLE seviyeler
#MODIFY seviye_id INT NOT NULL AUTO_INCREMENT;

ALTER TABLE gorevler
MODIFY gorev_id INT NOT NULL AUTO_INCREMENT;

ALTER TABLE aliskanlik_takip DROP FOREIGN KEY aliskanlik_takip_ibfk_2; (geçici olarak foregiin key özelliğini kaldırdık)

ALTER TABLE aliskanliklar
MODIFY aliskanlik_id INT NOT NULL AUTO_INCREMENT; ( primary key yaparken auto ıncrement özelliğini unuttuğum için sonradan ekledim.)

ALTER TABLE aliskanlik_takip 
ADD CONSTRAINT aliskanlik_takip_ibfk_2 
FOREIGN KEY (aliskanlik_id) 
REFERENCES aliskanliklar(aliskanlik_id);(foreign key özelliğini tekrar ektif ettik)

ALTER TABLE gorev_takip
MODIFY gorev_takip_id INT NOT NULL AUTO_INCREMENT; 

ALTER TABLE gorev_takip
MODIFY COLUMN tarih DATETIME DEFAULT CURRENT_TIMESTAMP;*/
/*
INSERT INTO seviyeler (seviye_araligi_baslangic, seviye_araligi_bitis, unvan)
VALUES
(21, 30, 'Acemi Savaşçı'),
(31, 40, 'Savaş Ustası'),
(41, 50, 'Komutan'),
(51, 60, 'Kahraman'),
(61, 70, 'Efsanevi Savaşçı'),
(71, 80, 'Gölge Lordu'),
(81, 90, 'Zamanın Efendisi'),
(91, 100, 'İrade Şampiyonu');

SELECT * FROM seviyeler;


CREATE TABLE seviye_puanlari (
    seviye_puanlari_id INT AUTO_INCREMENT PRIMARY KEY,
    seviye_puanlari_puan INT,
    seviye_id INT,
    FOREIGN KEY (seviye_id) REFERENCES seviyeler(seviye_id)
);
*/
/*
#ALTER TABLE seviye_puanlari
#ADD seviye INT;

INSERT INTO seviye_puanlari (seviye, seviye_puanlari_puan)
VALUES 
(1, 50),
(2, 55),
(3, 60),
(4, 65),
(5, 70),
(6, 75),
(7, 80),
(8, 85),
(9, 90),
(10, 95),
(11, 100),
(12, 105),
(13, 110),
(14, 115),
(15, 120),
(16, 125),
(17, 130),
(18, 135),
(19, 140),
(20, 145),
(21, 150),
(22, 155),
(23, 160),
(24, 165),
(25, 170),
(26, 175),
(27, 180),
(28, 185),
(29, 190),
(30, 195),
(31, 200),
(32, 205),
(33, 210),
(34, 215),
(35, 220),
(36, 225),
(37, 230),
(38, 235),
(39, 240),
(40, 245),
(41, 250),
(42, 255),
(43, 260),
(44, 265),
(45, 270),
(46, 275),
(47, 280),
(48, 285),
(49, 290),
(50, 295),
(51, 300),
(52, 305),
(53, 310),
(54, 315),
(55, 320),
(56, 325),
(57, 330),
(58, 335),
(59, 340),
(60, 345),
(61, 350),
(62, 355),
(63, 360),
(64, 365),
(65, 370),
(66, 375),
(67, 380),
(68, 385),
(69, 390),
(70, 395),
(71, 400),
(72, 405),
(73, 410),
(74, 415),
(75, 420),
(76, 425),
(77, 430),
(78, 435),
(79, 440),
(80, 445),
(81, 450),
(82, 455),
(83, 460),
(84, 465),
(85, 470),
(86, 475),
(87, 480),
(88, 485),
(89, 490),
(90, 495),
(91, 500),
(92, 505),
(93, 510),
(94, 515),
(95, 520),
(96, 525),
(97, 530),
(98, 535),
(99, 540),
(100, 545);*/
/*
# UPDATE kullanicilar SET kullanici_saglik = 50 WHERE kullanici_id = 13;

ALTER TABLE aliskanlik_takip
DROP PRIMARY KEY;
       
ALTER TABLE aliskanlik_takip 
MODIFY column aliskanlik_takip_id INT AUTO_INCREMENT PRIMARY KEY; 

ALTER TABLE aliskanlik_takip
DROP FOREIGN KEY aliskanlik_takip_ibfk_2;
*/

/* #tabloların değerlerini sıfırlıyor.
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE aliskanlik_takip;
TRUNCATE TABLE aliskanliklar;
TRUNCATE TABLE kullanicilar;

SET FOREIGN_KEY_CHECKS = 1;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE gorev_takip;
TRUNCATE TABLE gorevler;
TRUNCATE TABLE kullanicilar;

SET FOREIGN_KEY_CHECKS = 1;
*/
SELECT * FROM kullanicilar;

-- =========================================
-- ÖRDEK SİSTEMİ (Ekim 2026)
-- =========================================

-- Kullanıcıya ördek bilgileri
ALTER TABLE kullanicilar
  ADD COLUMN ordek_adi VARCHAR(50) DEFAULT 'Ördek',
  ADD COLUMN ordek_dogum_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN son_kontrol_tarihi DATE NULL;

-- Alışkanlıklara seri bilgisi
ALTER TABLE aliskanliklar
  ADD COLUMN seri INT DEFAULT 0,
  ADD COLUMN son_yapilma_tarihi DATE NULL;

-- Ölen ördeklerin kaydı
CREATE TABLE ani_defteri (
  ani_id INT AUTO_INCREMENT PRIMARY KEY,
  kullanici_id INT NOT NULL,
  ordek_adi VARCHAR(50),
  dogum_tarihi DATETIME,
  olum_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
  ulastigi_seviye INT,
  FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(kullanici_id)
);

ALTER TABLE aliskanliklar ADD COLUMN son_basarisiz_tarihi DATE NULL;

ALTER TABLE aliskanlik_takip ADD COLUMN yapildi_mi BOOLEAN;

DROP TABLE seviye_puanlari;

ALTER TABLE kullanicilar ALTER COLUMN ordek_adi SET DEFAULT NULL;

ALTER TABLE aliskanliklar
  ADD COLUMN en_uzun_seri INT DEFAULT 0,
  ADD COLUMN olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP;

UPDATE aliskanliklar SET en_uzun_seri = seri WHERE aliskanlik_id > 0;

UPDATE seviyeler SET unvan = CASE
    WHEN seviye_araligi_baslangic < 11 THEN 'Yumurta Bekçisi'
    WHEN seviye_araligi_baslangic < 21 THEN 'Gölet Çırağı'
    WHEN seviye_araligi_baslangic < 31 THEN 'Kıyı Gezgini'
    WHEN seviye_araligi_baslangic < 41 THEN 'Sazlık Ustası'
    WHEN seviye_araligi_baslangic < 51 THEN 'Göl Muhafızı'
    WHEN seviye_araligi_baslangic < 61 THEN 'Dalga Kaptanı'
    WHEN seviye_araligi_baslangic < 71 THEN 'Göç Lideri'
    WHEN seviye_araligi_baslangic < 81 THEN 'Rüzgâr Kanadı'
    WHEN seviye_araligi_baslangic < 91 THEN 'Göllerin Bilgesi'
    ELSE 'Efsanevi Ördek'
  END
WHERE seviye_id > 0;

-- Mevcut kullanıcıların unvanlarını da yenile
UPDATE kullanicilar k
JOIN seviyeler s ON k.kullanici_seviyesi BETWEEN s.seviye_araligi_baslangic AND s.seviye_araligi_bitis
SET k.kullanici_unvan = s.unvan
WHERE k.kullanici_id > 0;

ALTER TABLE gorevler ADD COLUMN olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP;

-- =========================================
-- ÇİFTLİK GÜNCELLEMESİ
-- =========================================

-- Her ördeğin bir rengi var (yumurtadan çıkınca ortaya çıkar)
ALTER TABLE kullanicilar ADD COLUMN ordek_renk VARCHAR(20) DEFAULT 'beyaz';

-- Mevcut ördeklere rastgele renk ver (sürpriz!)
UPDATE kullanicilar
SET ordek_renk = ELT(FLOOR(1 + RAND() * 5), 'beyaz', 'yaban', 'siyah', 'altin', 'lavanta')
WHERE kullanici_id > 0;

-- Anı defterindeki ördeklerin de rengi olsun
ALTER TABLE ani_defteri ADD COLUMN renk VARCHAR(20) DEFAULT 'beyaz';

-- Çiftlik: yetişkinliğe kadar büyütülen ördekler
CREATE TABLE ciftlik (
  ciftlik_id INT AUTO_INCREMENT PRIMARY KEY,
  kullanici_id INT NOT NULL,
  ordek_adi VARCHAR(50),
  renk VARCHAR(20),
  dogum_tarihi DATETIME,
  katilma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
  buyume_gunu INT,
  FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(kullanici_id)
);
