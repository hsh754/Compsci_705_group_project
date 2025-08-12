import mongoose from "mongoose";

const QuestionnaireSchema = new mongoose.Schema({
  title: { type: String, required: true },
  version: { type: String, default: "1.0" },
  items: [{
    id: String,
    type: { type: String, enum: ["text", "choice", "scale"], default: "text" },
    prompt: String,
    options: [String],
  }],
  createdAt: { type: Date, default: Date.now },
});

const Questionnaire = mongoose.model("Questionnaire", QuestionnaireSchema);
export default Questionnaire;



