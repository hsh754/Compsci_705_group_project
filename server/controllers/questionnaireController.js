import Questionnaire from "../models/questionnaire.js";
import XLSX from "xlsx";

// List all questionnaires (admin)
export const listQuestionnaires = async (req, res) => {
  try {
    const docs = await Questionnaire.find({}).select("title version createdAt");
    res.json(docs);
  } catch (err) {
    console.error('List questionnaires error:', err);
    res.status(500).json({ error: "Failed to fetch questionnaires" });
  }
};

// Upload questionnaire from Excel (admin)
export const uploadQuestionnaire = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    if (!workbook || !workbook.SheetNames.length) {
      return res.status(400).json({ error: "Invalid Excel file" });
    }
    
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet || !sheet['!ref']) return res.status(400).json({ error: "Empty worksheet" });

    const range = XLSX.utils.decode_range(sheet['!ref']);
    const headerRow = range.s.r;
    
    // Collect header options from columns B..end
    const headerOptions = [];
    for (let c = range.s.c + 1; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: headerRow, c })];
      const v = cell && (cell.w || cell.v);
      const text = (v ?? "").toString().trim();
      if (text) headerOptions.push(text);
    }

    const items = [];
    for (let r = headerRow + 1; r <= range.e.r; r++) {
      const questionCell = sheet[XLSX.utils.encode_cell({ r, c: range.s.c })];
      const prompt = (questionCell && (questionCell.w || questionCell.v) || "").toString().trim();
      if (!prompt) continue;

      // Try row-level options, fallback to header options
      const rowOptions = [];
      for (let c = range.s.c + 1; c <= range.e.c; c++) {
        const cell = sheet[XLSX.utils.encode_cell({ r, c })];
        const v = cell && (cell.w || cell.v);
        const text = (v ?? "").toString().trim();
        if (text) rowOptions.push(text);
      }
      const options = rowOptions.length > 0 ? rowOptions : headerOptions;
      items.push({ id: `q${items.length + 1}`, type: "choice", prompt, options });
    }

    const title = req.body.title || workbook.Props?.Title || "Untitled Questionnaire";
    const version = req.body.version || "1.0";
    
    const doc = await Questionnaire.create({ title, version, items });
    res.status(201).json({ success: true, id: doc._id });
  } catch (err) {
    console.error('Upload questionnaire error:', err);
    res.status(400).json({ error: "Invalid Excel format" });
  }
};

// Get questionnaire detail (admin)
export const getQuestionnaireDetail = async (req, res) => {
  try {
    const doc = await Questionnaire.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (err) {
    console.error('Get questionnaire detail error:', err);
    res.status(500).json({ error: "Failed to fetch questionnaire" });
  }
};

// Update questionnaire (admin)
export const updateQuestionnaire = async (req, res) => {
  try {
    const { title, version } = req.body || {};
    const update = {};
    if (typeof title === 'string' && title.trim()) update.title = title.trim();
    if (typeof version === 'string' && version.trim()) update.version = version.trim();
    if (Object.keys(update).length === 0) return res.status(400).json({ error: "No changes" });
    
    const doc = await Questionnaire.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, questionnaire: doc });
  } catch (err) {
    console.error('Update questionnaire error:', err);
    res.status(500).json({ error: "Failed to update questionnaire" });
  }
};

// Delete questionnaire (admin)
export const deleteQuestionnaire = async (req, res) => {
  try {
    const doc = await Questionnaire.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete questionnaire error:', err);
    res.status(500).json({ error: "Failed to delete questionnaire" });
  }
};

// List questionnaires for users (public)
export const listPublicQuestionnaires = async (req, res) => {
  try {
    const docs = await Questionnaire.find({}).select("title version items");
    res.json(docs.map(d => ({ id: d._id, title: d.title, version: d.version, items: d.items.length })));
  } catch (err) {
    console.error('List public questionnaires error:', err);
    res.status(500).json({ error: "Failed to fetch questionnaires" });
  }
};

// Get questionnaire for answering (public)
export const getQuestionnaireForAnswering = async (req, res) => {
  try {
    const doc = await Questionnaire.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ id: doc._id, title: doc.title, version: doc.version, items: doc.items });
  } catch (err) {
    console.error('Get questionnaire for answering error:', err);
    res.status(500).json({ error: "Failed to fetch questionnaire" });
  }
};
