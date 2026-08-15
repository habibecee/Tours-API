// Sıralama, Filtreleme, Alan Limitleme (Fields), Sayfalama gibi özellikler için projede her ihtiyaç duyulduğunda
// bu özellikleri en baştan yazmamak için sınıf oluşturma:

class APIFeatures {
  constructor(query, queryParams, parsedQuery) {
    this.query = query; // veritabanı sorgu ismi
    this.queryParams = queryParams; // client'dan gelen arama parametreleri
    this.parsedQuery = parsedQuery; // işlenmiş arama parametreleri ($ ekli)
  }

  filter() {
    this.query = this.query.find(this.parsedQuery);

    return this;
  }

  sort() {
    if (this.queryParams.sort) {
      this.query.sort(this.queryParams.sort.replaceAll(",", " "));
    }
    return this;
  }

  select() {
    if (this.queryParams.fields) {
      this.query.select(this.queryParams.fields.replaceAll(",", " "));
    }
    return this;
  }

  pagination() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 5;

    this.query.limit(limit).skip((page - 1) * limit);
    return this;
  }
}

export default APIFeatures;
