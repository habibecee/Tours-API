import qs from "qs";

const formatQuery = (req, res, next) => {
  // client'dan gelen parametre formatı: { 'price[gt]': '900' , 'rating[lt]': '4' }
  // eldeki parametre formatı (qs öncesi): {"price[$gt]":"900","rating[$lt]":"4"}
  // eldeki parametre formatı (qs sonrası): {"price":{"$gt":"900"},"rating":{"$lt":"4"}}
  // mongodb'nin istediği format: { price: { $gt: 900 }, rating: { $lt: 4 } }

  // 1) Url'deki arama parametresine eriş
  const queryObj = qs.parse(req.query);

  // 2) arama parametreleri arasından sort, fields, page, limit parametrelerini kaldır
  const fields = ["sort", "fields", "page", "limit"];
  fields.forEach((field) => {
    delete queryObj[field];
  });

  // 3) string methodlarını kullanabilmek için oarametreler nesnesini stringe çevir
  let queryStr = JSON.stringify(queryObj);

  // 4) bütün operatörlerin başına $ ekleyerek mongodb'nin istediği formata çevir
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|ne)\b/g,
    (found) => `$${found}`,
  );

  // 5) QueryString'i nesne formatına çevir
  const parsedQuery = JSON.parse(queryStr);

  // 6) request nesnesi içerisine parametreleri ekle
  // Middleware içerisinde oluşturulan bir değerin middleware'den sonra çalışacak bir fonksiyona iletilmesinin tek yolu REQUEST nesnesidir.
  req.parsedQuery = parsedQuery;

  // 7) sonraki fonksiyona geç
  next();
};

export default formatQuery;
