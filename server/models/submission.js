import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  prompt: { type: String, required: true },
  optionIndex: { type: Number, required: true },
  optionText: { type: String, required: true },
  score: { type: Number, required: true },
});

const SubmissionSchema = new mongoose.Schema({
  questionnaireId: { type: mongoose.Schema.Types.ObjectId, ref: "Questionnaire", required: true, index: true },
  title: { type: String },
  version: { type: String },
  answers: [AnswerSchema],
  totalScore: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Submission = mongoose.model("Submission", SubmissionSchema);
export default Submission;
