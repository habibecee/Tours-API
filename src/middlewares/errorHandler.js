import { BaseError } from "../utils/error.js";
import dotenv from "dotenv";

dotenv.config();

const errorHandler = (err, req, res, next) => {
  // belirlenen hataların dışında bir hata meydana gelirse;
  if (!(err instanceof BaseError)) {
    console.log("Bilinmeyen bir hata oluştu:", err);

    err = new BaseError(
      err.message || "Beklenmeyen bir hata oluştu",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }

  // Gönderilecek cevabı hazırla
  const response = {
    status: "error",
    message: err.message,
    code: err.errorCode,
  };

  // Geliştirme modunda stack trace'i ekle (hataları daha detaylı görmek için)
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  // client'a cevap gönder
  res.status(err.statusCode || 500).json(response);
};

export default errorHandler;
