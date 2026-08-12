import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { BadRequest, Unauthorized } from "../utils/error.js";
import catchAsync from "../utils/catchAsync.js";
import sendMail from "../utils/sendMail.js";
import crypto from "crypto";

// env değişkenlerine erişim
dotenv.config();

export const register = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.validated.body.name,
    email: req.validated.body.email,
    password: req.validated.body.password,
  });

  res.status(201).json({
    status: "success",
    message: "Hesabınız oluşturuldu",
    user: newUser,
  });
});

export const login = catchAsync(async (req, res) => {
  // 1) body kısmındaki verilere eriş
  const { email, password } = req.body;

  // 2) email ve password geldi mi kontrol et
  if (!email || !password) {
    // 400 bad request - 401 unauthorized - 403 forbidden

    throw new BadRequest("Email ve password zorunludur");
  }

  // 3) email değerine sahip kullanıcıyı veritabanından bul
  const user = await User.findOne({ email });

  // 3.1) kullanıcı yoksa hata ver
  if (!user) {
    throw new Unauthorized("Email veya password hatalı");
  }

  // 4) client'dan gelen şifre ile veritabanındaki hashlenmiş şifre uyuyor mu kontrol et
  const isValid = await bcrypt.compare(password, user.password);

  // 4.1) şifre yanlışsa hata gönder
  if (!isValid) {
    throw new Unauthorized("Email veya password hatalı");
  }

  // 5) JWT token oluştur. Token de hashlenerek oluşturulur.
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true, // çerez artık sadece HTTP üzerinden seyahat eder. Bunun dışında bir yere gitmez daha güvenlidir.
    secure: false, // çerez sadece HTTP protokolüne sahip domainlerde seyahat eder. (https). Uygulama yayınlanmadığı için şimdilik false
    sameSite: "strict", // başka domain adreslerinde gezinmeyi önlemek için
  });

  res.json({
    message: "Giriş yapıldı",
    user,
  });
});

export const logout = catchAsync(async (req, res) => {
  res.clearCookie("jwt").json({
    message: "Çıkış yapıldı",
  });
});

//Şifremi unuttum
// a) Eposta adresine şifre sıfırlama bağlantısı gönder

export const forgotPassword = catchAsync(async (req, res) => {
  // 1) eposta adresine göre kullanıcı hesabına eriş
  const user = await User.findOne({
    email: req.body.email,
  });

  // kullanıcı varsa token oluştur ve mail gönder
  if (user) {
    // 2) şifre sıfırlama token'ı oluştur ve veritabanına hashlenmiş halini kaydet
    const resetToken = user.createResetToken();
    await user.save({
      validateBeforeSave: false,
    });
    // 3) şifre sıfırlamak için kullanılacak token'ı içeren url'i hazırla
    const url = `${req.protocol}://${req.headers.host}/api/auth/reset-password/${resetToken}`;
    // 4) url'i eposta adresine mail at
    await sendMail({
      to: user.email,
      subject: "Şifre Sıfırlama Bağlantısı (10 dk)",
      text: resetToken,
      html: `
      <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f8; padding: 40px 0;">
              <tr>
                  <td align="center">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);"> 
                          <!-- Header -->
                          <tr>
                              <td align="center" style="padding: 30px 40px 20px 40px; border-bottom: 1px solid #f0f0f0;">
                                  <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ff5a5f;">tourify</h1>
                              </td>
                          </tr>
                          <!-- İçerik -->
                          <tr>
                              <td style="padding: 40px;">
                                  <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                                      Merhaba ${user.name},
                                  </h2>
                                  <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #555555;">
                                      <strong>${user.email}</strong> e-posta adresiyle ilişkili Tourify hesabınız için şifre sıfırlama bağlantınız oluşturuldu.
                                  </p>
                                  <!-- Bağlantı Kutusu -->
                                  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 24px 0; word-break: break-all;">
                                      <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Sıfırlama Endpoint Bağlantısı</p>
                                      <a href="${url}" style="color: #ff5a5f; font-size: 14px; text-decoration: underline; font-family: monospace;">${url}</a>
                                  </div>
                                  <!-- PATCH İstek Uyarısı/Bilgilendirmesi -->
                                  <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 22px; color: #374151;">
                                      Şifrenizi güncellemek için yukarıdaki bağlantıya yeni şifreniz ile birlikte bir <strong>PATCH</strong> isteği atmanız gerekmektedir.
                                  </p>
                                  <p style="margin: 0; font-size: 13px; line-height: 20px; color: #6b7280;">
                                      Bu işlemi siz talep etmediyseniz lütfen bu e-postayı dikkate almayın. Hesabınız güvendedir.
                                  </p>
                              </td>
                          </tr>
                          <!-- Footer -->
                          <tr>
                              <td align="center" style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #f0f0f0; font-size: 12px; color: #9ca3af;">
                                  <p style="margin: 0;">© 2026 Tourify. Tüm hakları saklıdır.</p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>`,
    });
  }
  // her durumda aynı yanıtı gönder
  res.status(200).json({
    message: "Şifre sıfırlama bağlantısı e-posta adresine gönderildi",
    user,
  });
});

// b) yeni belirlenen şifreyi kaydet
export const resetPassword = catchAsync(async (req, res) => {
  // 1) URL'de parametre olarak gelen token'a eriş
  const token = req.params.token;

  // 2) elimizde normal, veritabanında ise hashlenmiş token bulunduğu için karşılaştırabilmek için normal token'ı hashlemek gerekir
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 3) hashlenmiş token'la ilişkili veritabanında kayıtlı kullanıcıyı bul
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // token'ın süresi dolmuş mu kontrolü
  });

  // 3.1) token geçersiz veya süresi dolmuş ise hata fırlat
  if (!user) throw new Unauthorized("Token geçersiz veya süresi dolmuş");

  if (!user) {
    throw new BadRequest("Geçersiz token veya token süresi dolmuş");
  }

  // 4) Kullanıcı bulundu ve token geçerliyse kullanıcının bilgilerini güncelle
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 5) client'a yanıt gönder
  res.status(200).json({
    message: "Şifre güncellendi",
  });
});

// Şifremi Güncelle
export const updatePassword = catchAsync(async (req, res) => {
  // 1) kullanıcı bilgilerini al
  const user = req.user;
  // 2) gelen mevcut şifre doğru mu?
  const isCorrect = await bcrypt.compare(
    req.body.currentPassword,
    user.password,
  );
  // 2.1) şifre yanlışsa hata fırlat
  if (!isCorrect) throw new BadRequest("Mevcut şifre yanlış");

  // 3) şifre doğruysa yeni şifreyi kaydet
  user.password = req.body.newPassword;
  user.save();

  res.status(200).json({
    message: "Şifre güncellendi",
  });
});
