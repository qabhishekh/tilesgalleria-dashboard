import express from "express";
import { create, list, getOne, update, remove, bulkImport, bulkExport } from "../controllers/productController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", list);
router.get("/:id", getOne);
router.post("/", upload.single("image"), create);  
router.put("/:id", upload.single("image"), update); 
router.patch("/:id", upload.single("image"), update);
router.delete("/:id", remove);

router.post("/bulk/import", upload.single("file"), bulkImport);
router.get("/bulk/export", bulkExport);

export default router;
