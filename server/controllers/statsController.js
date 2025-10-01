// server/controllers/statsController.js
import mongoose from "mongoose";
import SubmissionAnalysis from "../models/submissionAnalysis.js";

/** ===== 可按实际量表修改 ===== */
const NUM_ITEMS = 7; // GAD-7 为 7 题；若是别的问卷，把题数改这里

function anxietyLevelFromScore(totalScore) {
    // 以 GAD-7 总分分段：0–4 / 5–9 / 10–14 / 15–21
    if (totalScore <= 4) return "Minimal anxiety"; // 或 "No significant anxiety"
    if (totalScore <= 9) return "Mild anxiety";
    if (totalScore <= 14) return "Moderate anxiety";
    return "Severe anxiety";
}

function emotionStateFromScore(score0to3) {
    // 你的映射阈值本是 0–1，这里放大到 0–3
    if (score0to3 < 0.1 * 3) return "Happy";
    if (score0to3 < 0.2 * 3) return "Surprised";
    if (score0to3 < 0.3 * 3) return "Calm";
    if (score0to3 < 0.5 * 3) return "Sad";
    if (score0to3 < 0.7 * 3) return "Fearful";
    if (score0to3 < 1.0 * 3) return "Disgusted";
    return "Angry";
}

/** ========== 报告总览 ========== */
export const simpleReport = async (req, res, next) => {
    try {
        const { from, to, questionnaireId } = req.query;

        // 构造筛选条件
        const match = {};
        if (from || to) {
            match.createdAt = {};
            if (from) match.createdAt.$gte = new Date(from);
            if (to)   match.createdAt.$lte = new Date(to);
        }
        if (questionnaireId) {
            try {
                match.questionnaireId = new mongoose.Types.ObjectId(questionnaireId);
            } catch (e) {
                // 非法 id 则忽略筛选
            }
        }

        // === 概览聚合：三类均值 + 修正占比 ===
        const overviewAgg = await SubmissionAnalysis.aggregate([
            { $match: match },
            {
                $project: {
                    // 先把 0–1 归一化数组分别求和
                    subjSum01: { $sum: "$normQuestionnaireScores" },
                    objSum01:  { $sum: "$normEmotionScores" },
                    // 综合分（字符串）转 double
                    adjTotal:  { $convert: { input: "$adjustedTotal", to: "double", onError: null, onNull: null } },
                    needsAdjustment: 1
                }
            },
            {
                $group: {
                    _id: null,
                    n: { $sum: 1 },
                    subjMeanSum01: { $avg: "$subjSum01" },
                    objMeanSum01:  { $avg: "$objSum01"  },
                    adjMean:       { $avg: "$adjTotal"  },
                    adjustedCount:    { $sum: { $cond: ["$needsAdjustment", 1, 0] } },
                    notAdjustedCount: { $sum: { $cond: ["$needsAdjustment", 0, 1] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    n: 1,
                    // 0–1 → 0–3（乘 3）
                    means: {
                        subjective: { $multiply: ["$subjMeanSum01", 3] },
                        objective:  { $multiply: ["$objMeanSum01", 3] },
                        adjusted:   "$adjMean" // 综合本身就是总分（如 0–21），不缩放
                    },
                    pie: {
                        labels: ["Adjusted", "Not adjusted"],
                        values: ["$adjustedCount", "$notAdjustedCount"]
                    }
                }
            }
        ]);

        const overview = overviewAgg[0] || {
            n: 0,
            means: { subjective: 0, objective: 0, adjusted: 0 },
            pie: { labels: ["Adjusted", "Not adjusted"], values: [0, 0] }
        };

        // 群体状态：主观/综合用总分分级；客观用情绪映射
        const states = {
            subjective: anxietyLevelFromScore(overview.means.subjective * NUM_ITEMS),
            adjusted:   anxietyLevelFromScore(overview.means.adjusted   * NUM_ITEMS),
            objective:  emotionStateFromScore(overview.means.objective)
        };

        // === 明细 participants：按 createdAt 升序并命名 Participant 1..N ===
        const docs = await SubmissionAnalysis
            .find(match, {
                normQuestionnaireScores: 1,
                normEmotionScores: 1,
                adjustedTotal: 1,
                needsAdjustment: 1,
                createdAt: 1
            })
            .sort({ createdAt: 1 })
            .lean();

        const participants = docs.map((d, idx) => {
            const subjSum01 = Array.isArray(d.normQuestionnaireScores)
                ? d.normQuestionnaireScores.reduce((a, b) => a + (+b || 0), 0)
                : 0;
            const objSum01 = Array.isArray(d.normEmotionScores)
                ? d.normEmotionScores.reduce((a, b) => a + (+b || 0), 0)
                : 0;

            // 还原到 0–3 的“总分感”
            const subjective = Math.round(subjSum01 * 3);
            // 客观 → 保留两位小数
            const objective = (objSum01 * 3).toFixed(2);

            // 综合分转 number
            /*const adjNum = d.adjustedTotal != null ? Number(d.adjustedTotal) : null;
            const adjusted = Number.isFinite(adjNum) ? +adjNum.toFixed(2) : null;*/
            let adjusted = null;
            if (d.needsAdjustment) {
                // 按原来的逻辑，用 adjustedTotal
                const adjNum = d.adjustedTotal != null ? Number(d.adjustedTotal) : null;
                adjusted = Number.isFinite(adjNum) ? Number(adjNum.toFixed(2)) : null;
            } else {
                // 如果不需要修正 → 综合 = 主观分数 *3 取整
                adjusted = Math.round(subjSum01 * 3);
            }

            return {
                id: String(d._id),
                name: `Participant ${idx + 1}`,
                subjective,
                objective,
                adjusted
            };
        });

        // 返回
        res.json({
            ok: true,
            data: {
                n: overview.n,
                means: overview.means,
                pie: overview.pie,
                states,
                participants
            }
        });
    } catch (e) {
        next(e);
    }
};

/** ========== 个体报告 ========== */
export const getIndividualReport = async (req, res, next) => {
    try {
        const { id } = req.params;

        const doc = await SubmissionAnalysis.findById(id).lean();
        if (!doc) return res.status(404).json({ ok: false, message: "Not found" });

        // 主观/客观数组求和并乘 3 还原
        const subjSum01 = Array.isArray(doc.normQuestionnaireScores)
            ? doc.normQuestionnaireScores.reduce((a, b) => a + (+b || 0), 0)
            : 0;
        const objSum01 = Array.isArray(doc.normEmotionScores)
            ? doc.normEmotionScores.reduce((a, b) => a + (+b || 0), 0)
            : 0;

        const subjective =  Math.round(subjSum01 * 3);
        const objective  = +(objSum01  * 3).toFixed(2);

        /*const adjNum = doc.adjustedTotal != null ? Number(doc.adjustedTotal) : null;
        const adjusted = Number.isFinite(adjNum) ? +adjNum.toFixed(2) : null;*/

        const needsAdj =
            doc.needsAdjustment === true ||
            doc.needsAdjustment === 1 ||
            doc.needsAdjustment === "true";

        let adjusted = null;
        if (needsAdj) {
            const adjNum = doc.adjustedTotal != null ? Number(doc.adjustedTotal) : null;
            adjusted = Number.isFinite(adjNum) ? Number(adjNum.toFixed(2)) : null;
        } else {
            adjusted =  Math.round(subjSum01 * 3);  // 不需要修正：综合 = 主观
        }


        const states = {
            subjective: anxietyLevelFromScore(subjective * NUM_ITEMS),
            adjusted:   adjusted != null ? anxietyLevelFromScore(adjusted) : "N/A",
            objective:  emotionStateFromScore(objective)
        };

        res.json({
            ok: true,
            data: {
                id: String(doc._id),
                name: "Participant",
                createdAt: doc.createdAt,
                subjectiveTotal: subjective,
                objectiveTotal: objective,
                needsAdjustment: needsAdj,
                adjustedTotal: adjusted,
                states,
                normQuestionnaireScores: doc.normQuestionnaireScores || [],
                normEmotionScores: doc.normEmotionScores || [],
                adjustedScores: doc.adjustedScores || []
            }
        });

    } catch (e) {
        next(e);
    }
};
