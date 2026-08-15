import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Yorum içeriği boş olamaz!"],
    },
    rating: {
      type: Number,
      min: [1, "Puan en az 1 olabilir"],
      max: [5, "Puan en fazla 5 olabilir"],
      required: [true, "Puan alanı boş olamaz!"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Yorum yapan kullanıcı bilgisi boş olamaz"],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Yorumun ait olduğu tur bilgisi boş olamaz"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// * Yapılan sorgulardan önce kullanıcının belirtilen bilgilerini getirecek middleware
reviewSchema.pre(/^find/, function () {
  this.populate("user", "name photo");
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
