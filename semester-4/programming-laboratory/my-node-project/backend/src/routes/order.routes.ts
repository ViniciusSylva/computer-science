import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { OrderChatController } from "../controllers/order-chat.controller";
import { OrderEventsService } from "../services/order-events.service";

const router = Router();

router.get("/", OrderController.list);
router.get("/stream", (req, res) => OrderEventsService.addClient(res));
router.get("/:id/messages/stream", OrderChatController.stream);
router.get("/:id/messages", OrderChatController.list);
router.post("/:id/messages", OrderChatController.send);
router.get("/:id", OrderController.getById);
router.post("/", OrderController.create);
router.patch("/:id/status", OrderController.updateStatus);
router.post("/:id/advance", OrderController.advanceStatus);
router.post("/:id/revert", OrderController.revertStatus);

export default router;
