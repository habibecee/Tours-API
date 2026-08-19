import express from "express";
import {
  profile,
  updateMe,
  deleteMe,
  getAllUsers,
  createUser,
  getOneUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { authorizeRoles, protect } from "../middlewares/protect.js";
import { upload, resize } from "../utils/upload.js";

const router = express.Router();

router
  .route("/me")
  .get(protect, profile)
  .patch(protect, upload.single("photo"), resize, updateMe)
  .delete(protect, deleteMe);

router.use(protect, authorizeRoles("admin")); // bu satırdan sonra gelen tüm route'lar sadece admin kullanıcılar tarafından erişilebilir
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getOneUser).patch(updateUser).delete(deleteUser);

export default router;
