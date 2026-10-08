import { Router } from "express";
import { OrderController } from "../controllers/order.controller";

const router = Router();

router.get("/", OrderController.list);
router.get("/:id", OrderController.getById);
router.post("/", OrderController.create);
router.patch("/:id/status", OrderController.updateStatus);
router.post("/:id/advance", OrderController.advanceStatus);

export default router;

