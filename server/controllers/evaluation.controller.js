import Evaluation from "../models/evaluation.model.js";

export const submitEvaluation = async (req, res) => {
  try {
    const {
      assessor,
      candidate,
      scores,
      finalScore,
    } = req.body;

    //  Validate required fields
    if (!assessor || !candidate || !scores || finalScore === undefined) {
      return res.status(400).json({ message: "All fields are required." });
    }

    //  Create a new evaluation record
    const newEvaluation = new Evaluation({
      assessor,
      candidate,
      scores,
      finalScore,
    });

    //  Save to MongoDB
    await newEvaluation.save();

    res.status(201).json({ message: "Evaluation submitted successfully!", evaluation: newEvaluation });
  } catch (error) {
    console.error("Error saving evaluation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find().sort({ createdAt: -1 }); // Latest first
    const count = await Evaluation.countDocuments();
    res.status(200).json({ evaluations, count });
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};