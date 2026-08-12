import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const sendMail = async (options) => {
  // maili gönderecek sağlayıcı ayarlarını yap
  const transporter = nodemailer.createTransport(
    MailtrapTransport({
      token: process.env.EMAIL_TOKEN,
    }),
  );

  // mail gönderen'i tanımla
  const sender = {
    address: "support@demomailtrap.co",
    name: "Tour Destek",
  };

  //mail içeriğini tanımla
  const mailOptions = {
    from: sender,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  // maili gönder
  await transporter.sendMail(mailOptions);
};

export default sendMail;
