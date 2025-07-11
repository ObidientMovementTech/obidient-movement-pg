import express from "express";
import { submitEvaluation, getEvaluations } from "../controllers/evaluation.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ✅ SUBMIT an evaluation
router.post("/submit", protect, submitEvaluation);

// ✅ FETCH all past evaluations
router.get("/all", protect, getEvaluations);

export default router;
