import catchAsync from "../utils/catchAsync.js";
import User from "../models/userModel.js";
import { BadRequest } from "../utils/error.js";
import * as factory from "../utils/handlerFactory.js";

export const profile = catchAsync(async (req, res) => {
  //client'a yanıt gönder
  res.status(200).json({ message: "Profil bilgileri alındı", data: req.user });
});

export const updateMe = catchAsync(async (req, res) => {
  // 1) bu endpoint ile şifre güncelleme işlemi yapılmasını engelle hata fırlat
  if (req.body.password)
    throw new BadRequest("Şifreyi bu yöntemle güncelleyemezsiniz");

  // 2) kullanıcı bilgilerini güncelle
  const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  });

  //client'a yanıt gönder
  res
    .status(200)
    .json({ message: "Hesap bilgileri güncellendi.", data: updatedUser });
});

export const deleteMe = catchAsync(async (req, res) => {
  // 1. yol: kaldırma ---> bu seçenekte kullanıcı verisi geri döndürülemez şekilde silinir.
  // await User.findByIdAndDelete(req.user._id)

  // 2. yol: inaktif yapma ---> bu seçenekte kullanıcı verisi korunur ancak hesap pasif hale getirilir.
  await User.findByIdAndUpdate(req.user._id, { active: false });

  //client'a yanıt gönder
  res.status(200).json({ message: "Hesap silindi." });
});

// Admin endpointleri
export const getAllUsers = factory.getAll(User);
export const getOneUser = factory.getOne(User);
export const createUser = factory.createOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
