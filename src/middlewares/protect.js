import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import { NotFound, Unauthorized, Forbidden } from "../utils/error.js";

dotenv.config();

// ! ----- Authorization Middleware ----- //
/*
 * Client'ın gönderdiği token'ın geçerliliğini doğrular
 * Token geçersiz ise route'a erişimine izin vermeyip hata fırlatır
 * Token geçerliyse routr'a erişmesine izin verir
 */
export const protect = async (req, res, next) => {
  // 1) çerez ile gelen token'ı almayı sağlar.

  const token = req.cookies.jwt;

  // 2) token gelmediyse hata fırlat
  if (!token) {
    throw new Unauthorized();
  }

  // 3) token geldiyse token'ı doğrula (zaman aşımına uğradı mı? | imza doğru mu?)
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Unauthorized();
  }

  // 4) token ile gelen kullanıcı hesabı duruyor mu?
  let activeUser;
  try {
    activeUser = await User.findById(decoded.id);
  } catch (error) {
    throw new Unauthorized("Kullanıcı hesabı bulunamadı");
  }

  // 4.1) Kullanıcı hesabı silindiyse hata fırlat
  if (!activeUser) {
    throw new Unauthorized("Kullanıcı hesabı bulunamadı");
  }

  // 4.2) hesap dondurulduysa hata fırlat
  if (!activeUser.active) {
    throw new Unauthorized("Kullanıcı hesabı bulunamadı!");
  }

  // 5) kullanıcıya token'ı verdikten sonra şifresini değiştirdi mi diye bak
  if (activeUser?.passwordChangedAt) {
    const passwordChangedSeconds =
      activeUser.passwordChangedAt.getTime() / 1000;
    const tokenCreatedSeconds = decoded.iat;

    if (passwordChangedSeconds > tokenCreatedSeconds) {
      throw new Forbidden("Şifreniz değiştirildi, lütfen tekrar giriş yapın");
    }
  }

  // 6) Protect'den sonra çalışacak fonksiyonlarda kullanıcı verisine erişebilmek için req nesnesine user'ı ekle
  req.user = activeUser;

  // bir sonraki adım'a geç
  next();
};

// ! ----- Roll Control Middleware -----
/*
 * İstek atan kullanıcının rolü fonksiyonun parametre olarak aldığı rollerden biriyse;
 * Erişime izin ver
 * Değilse erişimi engelle
 */
export const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    // kullanıcının rolü izin verilen roller arasında var mı?
    const hasPermission = allowedRoles.includes(req.user.role);

    // kullanıcının rolü yeterli değilse hata fırlat
    if (!hasPermission) {
      // 403 forbidden - Erişim reddedildi
      throw new Forbidden();
    }

    // rolü yeterliyse devam et
    next();
  };
