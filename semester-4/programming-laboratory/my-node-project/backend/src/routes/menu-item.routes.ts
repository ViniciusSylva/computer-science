import { Router } from "express";
import { MenuItemController } from "../controllers/menu-item.controller";

const router = Router();

router.get("/", MenuItemController.list);
router.get("/:id", MenuItemController.getById);
router.post("/", MenuItemController.create);
router.put("/:id", MenuItemController.update);
router.delete("/:id", MenuItemController.delete);

export default router;

