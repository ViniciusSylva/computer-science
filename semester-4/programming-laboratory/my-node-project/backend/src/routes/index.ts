import { Router } from "express";
import categoryRoutes from "./category.routes";
import menuItemRoutes from "./menu-item.routes";
import tableRoutes from "./table.routes";
import orderRoutes from "./order.routes";

const routes = Router();

routes.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "restaurant-saas-api",
  });
});

routes.use("/categories", categoryRoutes);
routes.use("/menu-items", menuItemRoutes);
routes.use("/tables", tableRoutes);
routes.use("/orders", orderRoutes);

export default routes;

