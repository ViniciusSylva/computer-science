import { Router } from "express";
import { TableController } from "../controllers/table.controller";

const router = Router();

router.get("/", TableController.list);
router.get("/:id", TableController.getById);
router.post("/", TableController.create);
router.patch("/:id/status", TableController.updateStatus);

export default router;

