/* Temel Hata Sınıfı
*  Mesaage /Hata kodu gibi bilgileri alacak
* Diğer bütün hata sınıfları sınıftan türeyecek

*/

export class BaseError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);

    this.statusCode = statusCode;
    this.errorCode = errorCode;

    // StackTrace: hata oluşana kadar izlediği yola denir
    Error.captureStackTrace(this, this.constructor);
  }
}

// HTTP Hatası
export class BadRequest extends BaseError {
  constructor(message = "Geçersiz İstek") {
    super(message, 400, "BAD_REQUEST");
  }
}

// Kimlik Doğrulama Hatası - Kim olduğunu bilmiyorum durumu
export class Unauthorized extends BaseError {
  constructor(message = "Yetkisiz Erişim") {
    super(message, 401, "UNAUTHORIZED");
  }
}
// Kimlik Doğrulandı Ancak Yetki Yok
export class Forbidden extends BaseError {
  constructor(message = "Bu işlem için yetkiniz yok") {
    super(message, 403, "FORBIDDEN");
  }
}

// Bulunamadı
export class NotFound extends BaseError {
  constructor(message = "Kaynak Bulunamadı") {
    super(message, 404, "NOT_FOUND");
  }
}
