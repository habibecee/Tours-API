/*
! Mongoose'da neden modele ihtiyaç vardır?
* bir koleksiyona yeni bir veri eklerken, eklenecek olan verinin bir kısıtlamaya tabi tutulmasını isteriz.
* Örneğin; users koleksiyonundaki her bir belgenin name, surname, age değerlerinin zorunlu olmasını isteriz.
* Kaydedilecek olan her bir veri öncelikle modeldeki kısıtlamalara uyuyor mu kontrol edilir,
* eğer uymuyorsa hata fırlatır,
* uygunsa veri tabanına kaydedilir. (validasyon)
* bu sayede koleksiyonda tutulan belgelerin daha tutarlı olması sağlanır. 
*/

import mongoose from "mongoose";
import validator from "validator";

// schema: veritabanına kaydedilecek tur verisinin şartlarını tanımlamamızı sağlar

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      validate: [
        (val) => validator.isAlphanumeric(val, "tr-TR", { ignore: " " }), // validator kütüphanesi kullanım örneği
      ],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Fiyat 0 veya daha büyük olmalıdır"], // özel mesaj ekleme örneği
    },
    priceDiscount: {
      type: Number,
    },
    maxGroupSize: {
      type: Number,
      required: true,
      min: 1,
      // kendi validasyon fonksiyonumuzu tanımlama örneği
      validate: {
        validator: Number.isInteger,
        message: "Değer tam sayı olmalıdır",
      },
    },
    // duration: {type:Number, required: true},
    difficulty: {
      type: String,
      required: true,
      enum: ["kolay", "orta", "zor", "çok zor"],
    },
    ratingsAverage: { type: Number, min: 0, max: 5, default: 4.0 },
    ratingsQuantity: { type: Number, min: 0, default: 0 },
    summary: { type: String, required: true },
    description: { type: String, required: true },
    imageCover: { type: String, required: true },
    images: { type: [String], required: true },
    startDates: { type: [Date], required: true },
    premium: { type: Boolean },
    //embedding
    startLocation: {
      description: String,
      type: { type: String, default: "Point", enum: ["Point"] },
      coordinates: [Number],
      address: String,
    },
    //embedding
    locations: [
      {
        descriptin: String,
        type: { type: String, default: "Point", enum: ["Point"] },
        coordinates: [Number],
        day: Number,
      },
    ],
    durations: { type: Number, required: true },
    // refferance (parent)
    guides: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  {
    timestamps: true, // created_at ve updated_at alanlarını otomatik ekler
    versionKey: false, // __v alanını otomatik eklemesin
    toJSON: { virtuals: true }, // virtual property'leri JSON'a dahil et
    toObject: { virtuals: true }, // virtual property'leri object'e dahil et
  },
);

/*
!Virtual Property ( Sanal Özellik)
 * Fiyat ve indirim tutarı veri tabanında mevcut iken indirimli fiyatı ayrıca veritabanında tutmak gereksiz maliyet olur. 
 * Bunun yerine cevap gönderme sırasında indirimli fiyat alanını hesaplayıp gönderecek bir cevap eklenirse hem frontend tarafında kullanılabilir hem veritabanında gereksiz veri olmaz.
 * middleware gibi yanıttan önce çalışır.
*/
// discountPrice virtual property'sini tanımlıyoruz: price'dan priceDiscount çıkararak indirimli fiyatı hesaplar
tourSchema.virtual("discountPrice").get(function () {
  return this.price - this.priceDiscount;
});

// Frontend yönlendirme için slug verisi isterse:
// Bu alan tur ismi üzerinden hesaplanabileceği için veritabanına kaydetmeden VIRTUAL PROPERTY olarak göndermek daha mantıklıdır.
// Ege Doğa Gezisi ===> ege-doga-gezisi
tourSchema.virtual("slug").get(function () {
  return this.name.replaceAll(" ", "-").toLowerCase();
});

/*
! Document Middleware
 * Document middleware'ler, belge (document) üzerindeki işlemlerden önce veya sonra çalışan fonksiyonlardır.
 * Güncellenme, silinme, okunma gibi işlemlerden önce veya sonra çalıştırılabilir.
 * .pre (işlemden önce) ve .post (işlemden sonra) türü olarak 2 türdür.
 * find, save, update, delete...
*/
//

// Ör: Herhangi bir find sorgusunda premium turların dahil edilmesini engellemek amacıyla kullanılabilir.
// find bir sorgu işleminde kullanılır
tourSchema.pre("find", function () {
  this.find({ premium: { $ne: true } });
});

// Ör: Client'dan gelen tur verisinin veritabanına kaydedildikten sonra mail gönderilmek istendiğinde kullanılabilir.
// save bir kayıt işleminde kullanılır
tourSchema.post("save", function (doc) {
  // mail gönder
  console.log(`${doc._id} id li tur sisteme kaydedildi. Mail gönderiliyor...`);
});

//! Index
// Coğrafi sorguların gerçekleşmesi için eklenmeasi zorunlu olan bir indextir.
tourSchema.index({ startLocation: "2dsphere" });

// yukarıdaki şemayı kullanarak mongoose modeli oluşturma: ilk parametre modelin ismi, ikinci parametre schemanın kendisidir.
const Tour = mongoose.model("Tour", tourSchema);

export default Tour;
