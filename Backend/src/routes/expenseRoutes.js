import { Router } from "express";
import { auth } from "../middleware/auth.js";
import * as c from "../controllers/expenseController.js";
import upload from "../middleware/upload.js";

const r = Router();

// Routes
r.get("/", auth(), c.list);
r.get("/:id", auth(), c.getOne);
r.post("/", auth(), upload.single("attachment"), c.create);
r.put("/:id", auth(), upload.single("attachment"), c.update);
r.patch("/:id", auth(), upload.single("attachment"), c.update);
r.delete("/:id", auth(), c.remove);

export default r;
