import * as z from "zod";

const passwordSchema = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalı")
  .regex(/[A-Z]/, "En az 1 büyük harf içermeli")
  .regex(/[a-z]/, "En az 1 küçük harf içermeli")
  .regex(/[0-9]/, "En az 1 rakam içermeli")
  .regex(/[^A-Za-z0-9]/, "En az 1 özel karakter içermeli");

// yeni kullanıcı oluştururken kullanılacak şema
export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "İsim en az 2 karakter olmalı"),
    email: z.string().email("Geçerli bir email adresi girin"),
    password: passwordSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});
