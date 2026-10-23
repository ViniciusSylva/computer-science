import express from "express";
import cors from "cors";
import routes from "./routes";
import { requestLogger, errorHandler } from "./middlewares/error-logger.middleware";

export const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(express.json());

// Logger de requisições em tempo de desenvolvimento
if (process.env.NODE_ENV !== "test") {
  app.use(requestLogger);
}

// API Routes
app.use("/api", routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

// Middleware Global de Tratamento de Erros
app.use(errorHandler);


