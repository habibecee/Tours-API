import multer from "multer";
import path from "path";
import sharp from "sharp";
import { BadRequest } from "./error.js";

// diskStorage kurulum : dosyaları sunucuya kaydetmek için gerekir
const diskStorage = multer.diskStorage({
  // dosyanın yükleneceği klasörü belirleme
  destination: function (req, file, cb) {
    cb(null, "uploads/users");
  },
  // dosyanın ismini belirleme
  filename: function (req, file, cb) {
    // benzersiz bir sayı oluştur
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // dosya uzantısını belirle
    const ext = path.extname(file.originalname);
    // dosyanın ismini belirle
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// memoryStorage kurulum : dosyaları belleğe kaydetmek için gerekir
const memoryStorage = multer.memoryStorage();

// fotoğraf içeriği dışındaki dosyaları kabul etmeyecek middleware
const multerFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.mimetype.startsWith("image") || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new BadRequest("Dosya tipi sadece resim olabilir (jpg,jpeg,png,webp...)"),
    );
  }
};

// multer middleware kurulumu
export const upload = multer({
  storage: memoryStorage,
  fileFilter: multerFilter,
});

/* 
! sharp kütüphanesi
 * Kullanıcı 4k çözünürlükte 20-30 mb bir fotoğrafı profil fotoğrafı olarak yüklemek isteyebilir.
 * Proje içerisinde profil fotoğrafları genelde 40x40 veya 80x80 boyutlarında kullanılır.
 * Ama kullanıcı fotoğrafı seçerken çok daha büyük boyutta ve yüksek kalitede fotoğraf seçebilir.
 * Bu şekilde doğrudan kaydedilirse gereksiz alan kaplar.
 * Bu yüzden fotoğrafları sunucuya kaydetmeden önce sharp kütüphanesi ile işlemek gerekir.
 */
export const resize = (req, res, next) => {
  if (!req.file) return next();

  // dosya ismini belirle
  const filename = `photo-${req.user.id}-${Date.now()}.webp`;

  // sharp ile fotoğrafı işle ve diske kaydet
  sharp(req.file.buffer)
    .resize(200, 200) // boyutu ayarla
    .toFormat("webp") // formatı belirle
    .webp({ quality: 90 }) // kaliteyi belirle
    .toFile(`uploads/users/${filename}`);

  // yeni yüklenen dosyayı middleware'den sonra çalışacak fonksiyonda erişmek için req'e ekle
  req.file = `uploads/users/${filename}`;

  next();
};
