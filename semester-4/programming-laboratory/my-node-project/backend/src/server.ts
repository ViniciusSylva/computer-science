import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 API do restaurante iniciada com sucesso!`);
  console.log(`📡 URL do servidor: http://localhost:${PORT}`);
  console.log(`🩺 Health check:    http://localhost:${PORT}/api/health`);
  console.log(`📋 Pedidos (KDS):   http://localhost:${PORT}/api/orders`);
  console.log(`🍔 Cardápio:        http://localhost:${PORT}/api/categories`);
  console.log(`🪑 Mesas:           http://localhost:${PORT}/api/tables`);
  console.log(`===============================================`);
});
