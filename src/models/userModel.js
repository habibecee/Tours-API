import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendMail from "../utils/sendMail.js";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "isim alanı zorunludur"],
      minLength: [2, "isim 2 karakterden kısa olamaz"],
      maxLength: [30, "isim 30 karakterden uzun olamaz"],
      validate: [
        (val) =>
          validator.isAlpha(val, "tr-TR", {
            ignore: " ",
          }),
        "İsim sadece harflerden oluşabilir.",
      ],
    },
    email: {
      type: String,
      required: [true, "Email alanı zorunludur"],
      unique: [true, "Bu e posta adresi zaten kullanımda"],
      validate: [validator.isEmail, "Lütfen geçerli bir mail adresi giriniz."],
    },
    role: {
      type: String,
      enum: ["user", "admin", "guide", "lead-guide"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    photo: {
      type: String,
      default: "defaultpic",
    },
    /* Hash ve Salt: 
    * * Hashleme: veriyi alıp sabit uzunlukta geri döndürülemez bir çıktıya dönüştüren matematiksel bir işlemdir. 
    * Hash fonksiyonları tek yönlüdür, yani elde edilen hash değerinden orijinal veri geri elde edilemez. 
    * Aynı girdi aynı hash çıktısını üretir. 

    * * Saltlama: Hashleme işlemine ekstra bir rastgele veri (salt) ekleyerek aynı parolanın farklı hash değerleri üretmesini sağlar. 
    * Bu, hash tabanlı saldırıları (örn: rainbow table saldırıları) önlemek için kullanılır.
    * Parolaya hashlemeden önce eklenen rastgele üretilmiş bir dizidir. 
    * Salt, her kullanıcı için farklıdır ve hashleme işlemine dahil edilir.

    * * Hashleme ve Saltlama: verilerin güvenli bir şekilde saklanması ve özellikle parolaların korunması için birlikte kullanılan tekniklerdir.
    * Hash, şifreyi geri döndürülemez hale getirir. 
    * Salt ise aynı şifrenin aynı hash'i üretmesini engeller. 
    */
    password: {
      type: String,
      required: [true, "Şifre alanı zorunludur."],
      minLength: [8, "Şifre en az 8 karakter olmalıdır."],
      validate: [validator.isStrongPassword, "Şifreniz yeterince güçlü değil."],
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    // client'a veriyi göndermeden hemen önce çalışan bir fonksiyondur
    toJSON: {
      transform: function (doc, ret) {
        // client'a veri gönderirken password alanını kaldırır. Böylece hashlenmiş veri korunur.
        delete ret?.password;
        delete ret?.passwordResetToken;
        delete ret?.passwordResetExpires;
        delete ret?.passwordChangedAt;
        return ret;
      },
    },
  },
);

/*
? Veritabanına belge kaydedilmeden önce:
* password alanına hashleme ve saltlama yap
*/
userSchema.pre("save", async function () {
  // kaydedilen kullanıcının parolası değişmediyse fonksiyonu durdur
  if (!this.isModified("password")) return;

  // şifreyi hashle ve saltla
  this.password = await bcrypt.hash(this.password, 10); // ilk parametre şifrenin kendisidir, ikinci parametre saltlama karakter sayısıdır.
});

//? Model'in içerisine tanımlı bir fonksiyon
//* şifre tanımlama token'ı oluştur
userSchema.methods.createResetToken = function () {
  // 1) 32byte'lık rastgele bir veri oluştur ve bunu hexadecimal bir string formatına çevir
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 2) token'ı hashle ve veritabanına kaydet
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3) token'ın son geçerlilik tarihini veritabanına kkaydet
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 dakika

  // 4) token'ın normal halini return et
  return resetToken;
};

//? Şifre Güncellendiğinde çalışan middleware
userSchema.pre("save", async function () {
  // eğer şifre alanı güncellenmediyse fonksiyonu durdur
  if (!this.isModified("password") || this.isNew) return;

  // şifre değiştirme tarihini güncelle
  this.passwordChangedAt = Date.now() - 1000; // JWT token oluşturulma tarihi ile çakışmayı önlemek için 1 sn öncesi olarak kaydedildi

  // bilgilendirme maili gönder
  await sendMail({
    to: this.email,
    subject: "Tourify hesabı şifreniz güncellendi",
    html: `
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f8; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        
                        <!-- Header / Logo -->
                        <tr>
                            <td align="center" style="padding: 30px 40px 20px 40px; border-bottom: 1px solid #f0f0f0;">
                                <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ff5a5f;">tourify</h1>
                            </td>
                        </tr>

                        <!-- İçerik -->
                        <tr>
                            <td style="padding: 40px;">
                                
                                <!-- Onay İkonu / Visual -->
                                <div style="text-align: center; margin-bottom: 24px;">
                                    <span style="display: inline-block; width: 56px; height: 56px; background-color: #ecfdf5; color: #10b981; border-radius: 50%; font-size: 28px; line-height: 56px; text-align: center;">✓</span>
                                </div>

                                <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #1a1a1a; text-align: center;">
                                    Şifreniz Başarıyla Başarıyla Güncellendi
                                </h2>

                                <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #555555; text-align: center;">
                                    Merhaba <strong>${this.name}</strong>,
                                </p>

                                <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #555555;">
                                    <strong>${this.email}</strong> adresine bağlı Tourify hesabınızın şifresi başarıyla değiştirilmiştir. Artık yeni şifreniz ile giriş yapabilirsiniz.
                                </p>

                                <!-- Güvenlik Uyarısı Kutusu -->
                                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; padding: 16px; margin: 24px 0;">
                                    <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #991b1b;">
                                        Bu işlemi siz yapmadınız mı?
                                    </p>
                                    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #7f1d1d;">
                                        Eğer bu şifre değişikliğinden haberiniz yoksa, hesabınızın güvenliği riske girmiş olabilir. Lütfen hemen <a href="mailto:destek@tourify.com" style="color: #ef4444; font-weight: 600; text-decoration: underline;">destek ekibimizle iletişime geçin</a> veya şifrenizi tekrar sıfırlayın.
                                    </p>
                                </div>

                                <p style="margin: 0; font-size: 13px; line-height: 20px; color: #6b7280;">
                                    Güvenliğiniz için bu tür e-postaları saklamanızı ve şifrenizi kimseyle paylaşmamanızı öneririz.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #f0f0f0; font-size: 12px; color: #9ca3af;">
                                <p style="margin: 0 0 6px 0;">© ${new Date().getFullYear()} Tourify. Tüm hakları saklıdır.</p>
                                <p style="margin: 0;">Bu otomatik bir güvenlik bilgilendirmesidir.</p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>

  `,
  });
});

const User = mongoose.model("User", userSchema);
export default User;
