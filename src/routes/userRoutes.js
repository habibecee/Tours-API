import express from "express";
import { profile, updateMe, deleteMe } from "../controllers/userController.js";
import { protect } from "../middlewares/protect.js";

const router = express.Router();

router
  .route("/me")
  .get(protect, profile)
  .patch(protect, updateMe)
  .delete(protect, deleteMe);

export default router;
