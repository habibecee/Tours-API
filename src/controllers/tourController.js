import Tour from "../models/tourModel.js";
import qs from "qs";
import APIFeatures from "../utils/apiFeatures.js";
import { NotFound, BadRequest } from "../utils/error.js";
import catchAsync from "../utils/catchAsync.js";
import * as factory from "../utils/handlerFactory.js";

// export const getAllTours = catchAsync(async (req, res) => {
//   // sorguyu oluştur
//   const features = new APIFeatures(Tour.find(), req.query, req.parsedQuery)
//     .filter()
//     .sort()
//     .pagination()
//     .select();

//   // sorguyu çalıştır
//   const tours = await features.query;

//   // client'a yanıt
//   res.status(200).json({
//     status: "success",
//     message: "Tüm turlar getirildi",
//     results: tours.length,
//     parsedQuery: req.parsedQuery,
//     data: tours,
//   });
// });

export const getAllTours = factory.getAll(Tour);

// export const getOneTour = catchAsync(async (req, res) => {
//   // parametre olarak gelen ID'ye eriş
//   const id = req.params.id;

//   // veritabanından id'si bilinen turu al
//   // * populate() : ref olarak tanımlanan id'lerin yerine ilgili belgeleri getirir.
//   // * İlk parametre de nerede kullanılacağı, ikinci parametrede getirilmesi istenen veriler belirtilir.
//   const tour = await Tour.findById(id).populate("guides", "name photo email");

//   if (!tour) {
//     throw new NotFound("Tur bulunamadı");
//   }

//   // client'a yanıt
//   res.status(200).json({
//     status: "success",
//     message: `${id} ID'li tur getirildi`,
//     data: tour,
//   });
// });

export const getOneTour = factory.getOne(Tour, [
  { path: "guides", select: "name photo email" },
]);

// export const createTour = catchAsync(async (req, res) => {
//   // isteğin body kısmındaki veriye eriş
//   const body = req.body;

//   // yeni turu veritabanına kaydet
//   const newTour = await Tour.insertOne(body);

//   // client'a yanıt
//   res.status(201).json({
//     status: "success",
//     message: "Tur oluşturuldu",
//     data: newTour,
//   });
// });

export const createTour = factory.createOne(Tour);

// export const updateTour = catchAsync(async (req, res) => {
//   // veritabanında tur belgesini güncelle
//   // const updateTour = await Tour.findOneAndUpdate({ _id: req.params.id }, req.body); // bir belgeyi herhangi bir değerine göre bulur getirir ve günceller. başka değere göre bulacaksa _id yeri değiştirilir. Güncellemeden önceki veya sonraki halini getiren bir parametresi yoktur.
//   const updateTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true, // güncellemeden sonraki halini döner
//     runValidators: true, // validation kurallarını uygula
//   }); // belgeyi id değerine göre bulur getirir ve günceller

//   if (!updateTour) {
//     throw new NotFound("Tur bulunamadı");
//   }

//   // client'a yanıt
//   res.status(200).json({
//     status: "success",
//     message: `ID'si ${req.params.id} olan tur güncellendi`,
//     data: updateTour,
//   });
// });

export const updateTour = factory.updateOne(Tour);

// export const deleteTour = catchAsync(async (req, res) => {
//   // veritabanından id'si bilinen belgeyi kaldır
//   const deletedTour = await Tour.findByIdAndDelete(req.params.id);

//   if (!deletedTour) {
//     throw new NotFound("Tur bulunamadı");
//   }

//   // client'a yanıt
//   res.status(200).json({
//     status: "success",
//     message: `ID'si ${req.params.id} olan tur silindi`,
//     data: deletedTour,
//   });
// });

export const deleteTour = factory.deleteOne(Tour);

// en iyi turları almayı sağlayacak parametreleri ayarlayan middleware
export const aliasTopTours = (req, res, next) => {
  req.query.sort = "-ratingsAverage,-ratingsQuantity";
  req.query.fields =
    "name,price,ratingsAverage,ratingsQuantity,summary,imageCover";
  req.query.limit = 5;
  next();
};

// tur için istatistikleri hesaplayan bir fonksiyon
export const getTourStats = catchAsync(async (req, res) => {
  // Aggregation Pipeline
  const stats = await Tour.aggregate([
    // 1. adım : rating 4 ve üzeri olanları al
    {
      $match: {
        ratingsAverage: { $gte: 4 },
      },
    },

    // 2. adım : zorluğa göre gruplandır ve ortalama değerleri hesapla
    {
      $group: {
        _id: "$difficulty",
        count: { $sum: 1 },
        averageRating: { $avg: "$ratingsAverage" },
        averagePrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },

    // 3. adım
    {
      $sort: { _id: 1 },
    },
  ]);
  return res.json({
    message: "Istatistik oluşturuldu",
    stats,
  });
});

// bir yıl içerisinde aylık planı raporla
export const getMonthlyPlan = catchAsync(async (req, res) => {
  // parametre olarak gelen yıla eriş
  const year = req.params.year;

  // istatistik hesaplama
  const stats = await Tour.aggregate([
    {
      $unwind: {
        path: "$startDates",
      },
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$startDates",
        },
        count: {
          $sum: 1,
        },
        tours: {
          $push: "$name",
        },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        month: 1,
      },
    },
  ]);

  // client'a yanıt olarak gönder
  return res.json({
    message: "Aylık plan oluşturuldu",
    stats,
  });
});

// belirli bir alandaki turları filtrele
export const getToursWithin = catchAsync(async (req, res) => {
  const { distance, unit, latlng } = req.params;

  // enlem/boylam değerini dizi formatına çevir
  const [lat, lng] = latlng.split(",");

  // enlem/boylam verisi sağlanmazsa hata fırlat
  if (!lat || !lng) {
    throw BadRequest("Lütfen merkez noktasını tanımlayın");
  }

  // daire yarıçapını radyan birimine çevir
  const radius = unit == "mi" ? distance / 3963.2 : distance / 6378.1;

  // belirlenen dairesel alandaki turları al
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lat, lng], radius],
      },
    },
  });

  res.json({
    message: "Sınırlar içerisindeki turlar algılandı",
    results: tours.length,
    data: tours,
  });
});

export const getDistances = catchAsync(async (req, res) => {
  const { unit, latlng } = req.params;

  // enlem/boylam değerini dizi formatına çevir
  const [lat, lng] = latlng.split(",");

  // enlem/boylam verisi sağlanmazsa hata fırlat
  if (!lat || !lng) {
    throw BadRequest("Lütfen merkez noktasını tanımlayın");
  }

  // turların merkez noktasından uzaklıklarını hesapla
  const tours = await Tour.aggregate([
    // 1) uzaklığı hesapla
    {
      $geoNear: {
        near: { type: "Point", coordinates: [+lat, +lng] },
        distanceField: "distance",
        distanceMultiplier: unit === "mi" ? 0.000621371 : 0.001, // mil veya km cinsinden
      },
    },
    // 2) istediğimiz alanları seç
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.json({
    message: "Mesafeler hesaplandı",
    data: tours,
  });
});
