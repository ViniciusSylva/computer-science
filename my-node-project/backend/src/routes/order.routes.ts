import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { OrderEventsService } from "../services/order-events.service";

const router = Router();

router.get("/", OrderController.list);
router.get("/stream", (req, res) => OrderEventsService.addClient(res));
router.get("/:id", OrderController.getById);
router.post("/", OrderController.create);
router.patch("/:id/status", OrderController.updateStatus);
router.post("/:id/advance", OrderController.advanceStatus);

export default router;

