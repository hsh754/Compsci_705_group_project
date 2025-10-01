import mongoose from "mongoose";

const SubmissionAnalysisSchema = new mongoose.Schema({
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true, index: true },
    questionnaireId: { type: mongoose.Schema.Types.ObjectId, ref: "Questionnaire", required: true },
    normQuestionnaireScores: [Number],
    normEmotionScores: [Number],
    spearmanCorr: { type: Number },      // 可以后面再计算
    needsAdjustment: { type: Boolean, default: false },
    adjustedScores: [Number],
    adjustedTotal: { type: Number },
    algorithmVersion: { type: String, default: "v1" },
    createdAt: { type: Date, default: Date.now },
});

const SubmissionAnalysis =
    mongoose.models.SubmissionAnalysis ||
    mongoose.model("SubmissionAnalysis", SubmissionAnalysisSchema);
export default SubmissionAnalysis;
