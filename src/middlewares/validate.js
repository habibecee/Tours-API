import { BadRequest } from "../utils/error.js";
import { z } from "zod";

/* isteğin body, params ya da query bölümünden gelen veri Zod şemasına uygun mu kontrol et 
 değilse global hata middleware'ine yönlendir. */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    return next(new BadRequest(z.prettifyError(result.error)));
  }

  // Client'ın gönderdiği body/params alanları yerine Zod'un işlenmiş alanlarını isteğe dahil et
  req.validated = result.data;

  next();
};

export default validate;
