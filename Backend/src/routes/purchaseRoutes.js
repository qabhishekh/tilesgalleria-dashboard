import { Router } from "express";
import { auth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";  
import * as c from "../controllers/purchaseController.js";

const r = Router();

r.get("/", auth(), c.list);
r.get("/:id", auth(), c.getOne);
r.post("/", auth(), upload.single("attachFile"), c.create);
r.put("/:id", auth(), upload.single("attachFile"), c.update);
r.delete("/:id", auth(), c.deletePurchase);  

export default r;
