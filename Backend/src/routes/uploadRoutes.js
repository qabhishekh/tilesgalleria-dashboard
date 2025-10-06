import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { auth } from "../middleware/auth.js";

const r = Router();
const uploadDir = process.env.UPLOAD_DIR || "uploads";
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const s = Date.now()+"-"+Math.round(Math.random()*1e9)+path.extname(file.originalname);
    cb(null, s);
  }
});
const upload = multer({ storage });

r.post("/", auth(), upload.single("file"), (req, res) => {
  res.json({ filename: req.file.filename, path: `/${uploadDir}/${req.file.filename}` });
});

export default r;
