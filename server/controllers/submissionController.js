import Submission from "../models/submission.js";
import Questionnaire from "../models/questionnaire.js";
import multer from "multer";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import SubmissionAnalysis from "../models/submissionAnalysis.js";



ffmpeg.setFfmpegPath(ffmpegPath.path);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });
console.log("DEBUG: PYTHON_SCRIPT=", process.env.PYTHON_SCRIPT);
const PYTHON_SCRIPT = "../python/ER_FullClip_DEMO.py";
const PYTHON_EXE = "../Emotion-Recognition_SER-FER_RAVDESS/.venv/emotion/Scripts/python.exe";
const PY_SCRIPT_N = path.win32.normalize(PYTHON_SCRIPT);
const PY_EXE_N = path.win32.normalize(PYTHON_EXE);

function assertPathsOrThrow() {
  if (!fs.existsSync(PY_SCRIPT_N)) {
    throw new Error(`Python script not found at ${PY_SCRIPT_N}. `);
  }
}

// Submit answers for a questionnaire (public)
export const submitAnswers = async (req, res) => {
  try {
    const q = await Questionnaire.findById(req.params.id);
    if (!q) return res.status(404).json({ error: "Not found" });

    const body = req.body || {};
    const received = Array.isArray(body.answers) ? body.answers : [];
    const sessionId = body.sessionId || null;

    // Process answers: [{questionId, optionIndex}]
    const answers = [];
    let total = 0;
    for (let i = 0; i < q.items.length; i++) {
      const item = q.items[i];
      const match = received.find(a => (a.questionId === item.id || a.index === i));
      const optionIndex = typeof match?.optionIndex === 'number' ? match.optionIndex : -1;
      const optionText = (item.options?.[optionIndex]) ?? "Not answered";
      const score = optionIndex >= 0 ? Math.min(Math.max(optionIndex, 0), 3) : 0;
      answers.push({ questionId: item.id, prompt: item.prompt, optionIndex, optionText, score });
      total += score;
    }

    const sub = await Submission.create({
      questionnaireId: q._id,
      title: q.title,
      version: q.version,
      answers,
      totalScore: total
    });

    // Bind any uploaded videos of this answering session to the submissionId
    if (sessionId) {
      try {
        await mongoose.connection.db.collection('videos.files').updateMany(
          { 'metadata.questionnaireId': req.params.id, 'metadata.sessionId': sessionId },
          { $set: { 'metadata.submissionId': sub._id.toString() } }
        );
      } catch (e) {
        console.warn('Failed to bind videos to submission', e);
      }
    }

    res.status(201).json({ success: true, id: sub._id, totalScore: total, resultUrl: `/result/${sub._id}`});
  } catch (err) {
    console.error('Submit answers error:', err);
    res.status(500).json({ error: "Failed to submit answers" });
  }
};

// List saved submissions (public)
export const listSubmissions = async (req, res) => {
  try {
    const docs = await Submission.find({}).sort({ createdAt: -1 }).limit(20);
    res.json(docs.map(d => ({
      id: d._id,
      questionnaireId: d.questionnaireId,
      title: d.title,
      version: d.version,
      submittedAt: d.createdAt,
      score: d.totalScore
    })));
  } catch (err) {
    console.error('List submissions error:', err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

// Upload per-question video (GridFS) - store as webm by default
export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No video" });

    const { sessionId, questionId, index } = req.body || {};
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "videos" });
    const filename = `${req.params.id}_${sessionId || Date.now()}_${questionId || index}.webm`;

    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        questionnaireId: req.params.id,
        sessionId: sessionId || null,
        questionId: questionId || null,
        index: typeof index !== 'undefined' ? Number(index) : null,
        mimeType: req.file.mimetype,
        createdAt: new Date().toISOString(),
      },
    });

    uploadStream.end(req.file.buffer, () => {
      return res.status(201).json({ success: true, fileId: uploadStream.id });
    });
  } catch (e) {
    console.error('Video upload error', e);
    res.status(500).json({ error: 'Upload failed' });
  }
};

// Get submission detail (public)
export const getSubmissionDetail = async (req, res) => {
  try {
    const doc = await Submission.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (err) {
    console.error('Get submission detail error:', err);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
};

// Get videos for a submission (public)
export const getSubmissionVideos = async (req, res) => {
  try {
    const submissionId = req.params.id;
    const videos = await mongoose.connection.db.collection('videos.files')
      .find({ 'metadata.submissionId': submissionId })
      .sort({ 'metadata.index': 1 })
      .toArray();

    res.json(videos.map(v => ({
      id: v._id,
      filename: v.filename,
      length: v.length,
      uploadDate: v.uploadDate,
      metadata: v.metadata
    })));
  } catch (err) {
    console.error('Get submission videos error:', err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};

// Get submission analysis (public)
export const getSubmissionAnalysis = async (req, res) => {
  try {
    const submissionId = req.params.id;
    const sub = await Submission.findById(submissionId);
    if (!sub) return res.status(404).json({ error: "Not found" });

    const analysis = await SubmissionAnalysis.findOne({ submissionId });
    res.json({
      submission: sub,
      analysis: analysis || null
    });
  } catch (err) {
    console.error('Get submission analysis error:', err);
    res.status(500).json({ error: "Failed to fetch analysis" });
  }
};

// Submit answers with videos and emotion analysis
export const submitAnswersWithVideos = async (req, res) => {
  try {
    // console.log("DEBUG using python exe:", PY_EXE_N);
    // console.log("DEBUG using python script:", PY_SCRIPT_N);

    const q = await Questionnaire.findById(req.params.id);
    if (!q) return res.status(404).json({ error: "Not found" });

    const sessionId = req.body.sessionId || Date.now().toString();
    const answers = JSON.parse(req.body.answers || "[]");

    // 计算分数（与你原来一致）
    let total = 0;
    const processedAnswers = q.items.map((item, i) => {
      const match = answers.find(a => a.questionId === item.id || a.index === i);
      const optionIndex = typeof match?.optionIndex === "number" ? match.optionIndex : -1;
      const optionText = item.options?.[optionIndex] ?? "Not answered";
      const score = optionIndex >= 0 ? Math.min(Math.max(optionIndex, 0), 3) : 0;
      total += score;
      return { questionId: item.id, prompt: item.prompt, optionIndex, optionText, score };
    });

    const sub = await Submission.create({
      questionnaireId: q._id, title: q.title, version: q.version,
      answers: processedAnswers, totalScore: total
    });

    let emotionResults = null;

    if (req.files && req.files.length > 0) {
      // 1) 保存到临时目录
      const tempDir = path.join(process.cwd(), "tmp", `session_${sessionId}`);
      fs.mkdirSync(tempDir, { recursive: true });
      console.log("DEBUG: temp dir has been created ->", tempDir);

      const mp4Files = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const webmPath = path.join(tempDir, `question_${String(i + 1).padStart(2, "0")}.webm`);
        const mp4Path = webmPath.replace(".webm", ".mp4");

        // 写入 webm
        fs.writeFileSync(webmPath, file.buffer);
        console.log(`DEBUG: video has been saved -> ${webmPath}, size: ${file.buffer.length} bytes`);

        // transcode to mp4
        await new Promise((resolve, reject) => {
          ffmpeg(webmPath)
              .output(mp4Path)
              .videoCodec("libx264")
              .audioCodec("aac")
              .on("end", () => {
                console.log("DEBUG: transcode successfully ->", mp4Path);
                mp4Files.push(mp4Path);
                resolve();
              })
              .on("error", (err) => {
                console.error("DEBUG: transcode failed ->", err);
                reject(err);
              })
              .run();
        });
      }
      // req.files.forEach((file, i) => {
      //   const fname = `question_${String(i + 1).padStart(2, "0")}.webm`;
      //   const savePath = path.join(tempDir, fname);
      //   fs.writeFileSync(path.join(tempDir, fname), file.buffer);
      //   console.log(`DEBUG: video has been saved -> ${savePath}, size: ${file.buffer.length} bytes`);
      // });

      // 2) 路径校验 + 设置 cwd = 脚本所在目录
      assertPathsOrThrow();
      const scriptDir = path.dirname(PY_SCRIPT_N);

             // 3) 选择 python 可执行文件
       const pythonCmd = PY_EXE_N;
       const rawScores = processedAnswers.map(a => a.score);
      // 4) 调用 Python
      //    注意：这里不用给脚本路径加引号，spawn 会正确处理；路径已规范化为 win32 格式
      const py = spawn(pythonCmd, [PY_SCRIPT_N, tempDir, JSON.stringify(rawScores)], {
        cwd: scriptDir,
        stdio: ["ignore", "pipe", "pipe"]
      });

      let out = "", err = "";
      py.stdout.on("data", d => (out += d.toString()));
      py.stderr.on("data", d => (err += d.toString()));

      await new Promise((resolve, reject) => {
        py.on("close", (code) => {
          console.log("DEBUG: Python exit code =", code);
          console.log("DEBUG: Python raw stdout =", out);
          if (err) console.error("DEBUG: Python stderr =", err);

          if (code === 0) {
            try {
              const raw = out.trim();
              try {
                emotionResults = JSON.parse(raw);
              } catch (e1) {
                // Sanitize non-JSON values like NaN/Infinity which Python might emit
                const sanitized = raw
                  .replace(/\bNaN\b/g, "null")
                  .replace(/\bInfinity\b/g, "null")
                  .replace(/\b-Infinity\b/g, "null");
                emotionResults = JSON.parse(sanitized);
              }
              resolve();
            } catch (e) {
              reject(new Error(`Parse Python JSON failed: ${e.message}\nRAW:\n${out}`));
            }
          } else {
            reject(new Error(`Python exit ${code}\n${err}`));
          }
        });
      });

      // 5) 清理临时目录（失败也不影响主流程）
      try {
        // fs.rmSync(tempDir, { recursive: true, force: true });
        console.log("DEBUG: The temporary directory has been recored ->", tempDir);
      } catch {}
    }
    let adjustedTotal = total;

    if (emotionResults) {
      try {
        const qs = emotionResults.normQuestionnaireScores || [];
        const es = emotionResults.normEmotionScores || [];
        const spearmanCorr = emotionResults.spearmanCorr;

        // 根据 spearmanCorr 判断是否修正
        let needsAdjustment = false;
        let adjustedScores = qs;
        let adjustedTotal = qs.reduce((a, b) => a + b, 0);

        if (spearmanCorr !== null && spearmanCorr < 0.6) {
          needsAdjustment = true;
          adjustedScores = qs.map((S, i) => {
            const E = es[i] ?? 0;
            const d = Math.abs(S - E);

            let alpha = 0;
            if (d >= 0.3) alpha = 0.5;
            else if (d >= 0.1) alpha = 0.3;
            else alpha = 0;

            const adjustedNorm = (1 - alpha) * S + alpha * E; //normalized score
            return adjustedNorm * 3;  // back to score between range 0 to 3
          });
          adjustedTotal = adjustedScores.reduce((a, b) => a + b, 0);
        }else {}

        // 存数据库
        await SubmissionAnalysis.create({
          submissionId: sub._id,
          questionnaireId: q._id,
          normQuestionnaireScores: qs,
          normEmotionScores: es,
          spearmanCorr,
          needsAdjustment,
          adjustedScores,
          adjustedTotal,
          algorithmVersion: "v1"
        });
      } catch (e) {
        console.error("Failed to save analysis result", e);
      }
    }

    res.status(201).json({ success: true, id: sub._id, totalScore: total, emotionResults, adjustedTotal,  resultUrl: `/result/${sub._id}`});
  } catch (err) {
    console.error("Submit answers with videos error:", err);
    res.status(500).json({ error: err.message || "Failed to submit answers" });
  }
};

export { upload };
