/* 
* Geliştirme aşamasında mongodb'deki veriler sıkça değişeceğinden veya silineceğinden dolayı
* veritabanındaki verileri temizlemeye ve json dosyasındaki örnek verileri veritabanına aktarmaya yarayan, 
! terminal komutları ile çalışacak fonksiyonları barındırır
! node ./src/dev-data/commands.js --import > npm run import        
! node ./src/dev-data/commands.js --clear  > npm run clear        
komutları ile kullanılır
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import Tour from "./../models/tourModel.js";
import User from "./../models/userModel.js";
import Review from "./../models/reviewModel.js";

dotenv.config();

// veritabanına bağlan
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(" ✅ MongoDB veritabanına bağlandı. ✅ "))
  .catch(() => console.log(" ❌ Veritabanına bağlantı başarısız. ❌ "));

// json dosyasındaki verileri al
const tours = JSON.parse(
  fs.readFileSync("./src/dev-data/data/tours.json", "utf-8"),
);
const users = JSON.parse(
  fs.readFileSync("./src/dev-data/data/users.json", "utf-8"),
);

const reviews = JSON.parse(
  fs.readFileSync("./src/dev-data/data/reviews.json", "utf-8"),
);

// json dosyasından alınan verileri veritabanına kaydedecek fonksiyon
const importData = async () => {
  try {
    await Tour.create(tours, { validateBeforeSave: false });
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews, { validateBeforeSave: false });

    console.log(" 🟢 🔄 Veriler başarıyla aktarıldı 🔄 🟢");
  } catch (error) {
    console.log(error);
    console.log(" 🔴 🔄 Veriler aktarılırken bir hata oluştu  🔄 🔴");
  }
  process.exit();
};

// verileri veritabanından silecek fonksiyon
const clearData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log(" 🟢 🚮 Veriler başarıyla silindi 🚮 🟢");
  } catch (error) {
    console.log(" 🔴 🚮 Veriler silinirken bir hata oluştu 🚮 🔴");
  }
  process.exit();
};

if (process.argv.includes("--import")) {
  importData();
} else if (process.argv.includes("--clear")) {
  clearData();
} else {
  console.log("🟠 Lütfen geçerli bir argüman girin: --import veya --clear 🟠");
  process.exit();
}
