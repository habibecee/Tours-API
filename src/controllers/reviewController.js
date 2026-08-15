import catchAsync from "../utils/catchAsync.js";
import APIFeatures from "../utils/APIFeatures.js";
import Review from "../models/reviewModel.js";
import { NotFound } from "../utils/error.js";

export const getAllReviews = catchAsync(async (req, res, next) => {
  const reviewFeatures = new APIFeatures(
    Review.find(),
    req.query,
    req.parsedQuery,
  )
    .filter()
    .sort()
    .pagination();
  const reviews = await reviewFeatures.query;

  res.status(200).json({
    message: "Tüm yorumlar getirildi",
    results: reviews.length,
    data: reviews,
  });
});

export const getOneReview = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const review = await Review.findById(id);

  if (!review) {
    throw new NotFound("Yorum bulunamadı");
  }
  res.status(200).json({ message: "Yorum detayı getirildi", data: review });
});

export const createReview = catchAsync(async (req, res, next) => {
  const tour = req.body.tour; // hangi tur
  const rating = req.body.rating; // puan 1-5
  const review = req.body.review; // yorum metni
  const user = req.user._id; // yorumu atan kullanıcı

  const newReview = await Review.create({
    tour,
    rating,
    review,
    user,
  });

  res.status(201).json({ message: "Yorum oluşturuldu", data: newReview });
});

export const updateReview = catchAsync(async (req, res, next) => {
  res.json("Yorum güncellendi");
});

export const deleteReview = catchAsync(async (req, res, next) => {
  res.json("Yorum silindi");
});
