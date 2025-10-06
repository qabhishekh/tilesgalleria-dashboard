import { Router } from "express";
import { auth } from "../middleware/auth.js";
import * as c from "../controllers/leadController.js";
import upload from "../middleware/upload.js";

const r = Router();

r.get("/", auth(), c.list);
r.get("/:id", auth(), c.getOne);
r.post("/", auth(), upload.single("attachment"), c.create);  // ✅ file middleware
r.put("/:id", auth(), upload.single("attachment"), c.update);
// 👇 यहाँ PATCH होना चाहिए
r.patch("/:id", auth(), c.update);
r.delete("/:id", auth(), c.remove);

export default r;
