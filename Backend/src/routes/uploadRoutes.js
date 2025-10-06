import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { auth } from "../middleware/auth.js";

const r = Router();

r.post("/", auth(), upload.single("file"), (req, res) => {
  res.json({ filename: req.file.filename, path: req.file.path });
});

export default r;
