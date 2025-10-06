import { Router } from "express";
import { auth } from "../middleware/auth.js";
import * as v from "../controllers/vendorController.js";

const r = Router();

r.get("/", auth(), v.list);
r.get("/:id", auth(), v.getOne);
r.post("/", auth(), v.create);
r.put("/:id", auth(), v.update);
r.delete("/:id", auth(), v.remove);

export default r;
