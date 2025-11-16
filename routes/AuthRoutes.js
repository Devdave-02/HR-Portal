import express from "express";
import { loginOrRegister } from "../controllers/AuthController.js";

const router = express.Router();

router.post("/login", loginOrRegister);

export default router;




