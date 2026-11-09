import { Request, Response } from "express";
import { prisma } from "../prisma";
import { TableStatus } from "@prisma/client";

export const TableController = {
  async list(req: Request, res: Response) {
    try {
      const tables = await prisma.table.findMany({
        orderBy: { number: "asc" },
        include: {
          orders: {
            where: {
              status: {
                in: ["RECEIVED", "PREPARING", "READY"],
              },
            },
            select: {
              id: true,
              code: true,
              status: true,
              totalAmount: true,
              createdAt: true,
            },
          },
        },
      });
      return res.json(tables);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao buscar mesas", details: error.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const table = await prisma.table.findUnique({
        where: { id },
        include: {
          orders: {
            where: {
              status: {
                in: ["RECEIVED", "PREPARING", "READY"],
              },
            },
            include: {
              items: {
                include: {
                  menuItem: true,
                  selectedOptions: true,
                },
              },
            },
          },
        },
      });

      if (!table) {
        return res.status(404).json({ error: "Mesa não encontrada." });
      }

      return res.json(table);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao buscar mesa", details: error.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { number, capacity } = req.body;
      if (number === undefined || number === null || number === "") {
        return res.status(400).json({ error: "Número da mesa é obrigatório." });
      }
      const tableNumber = Number(number);
      const tableCapacity = capacity === undefined ? 4 : Number(capacity);
      if (!Number.isInteger(tableNumber) || tableNumber < 1) {
        return res.status(400).json({ error: "Número da mesa deve ser um inteiro positivo." });
      }
      if (!Number.isInteger(tableCapacity) || tableCapacity < 1) {
        return res.status(400).json({ error: "Capacidade deve ser um inteiro positivo." });
      }

      const table = await prisma.table.create({
        data: {
          number: tableNumber,
          capacity: tableCapacity,
          status: TableStatus.AVAILABLE,
        },
      });

      return res.status(201).json(table);
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(409).json({ error: "Já existe uma mesa com esse número." });
      }
      return res.status(500).json({ error: "Erro ao cadastrar mesa", details: error.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "Identificador da mesa inválido." });
      }

      const table = await prisma.table.findUnique({
        where: { id },
        include: {
          orders: {
            where: { status: { in: ["RECEIVED", "PREPARING", "READY"] } },
            select: { id: true },
          },
        },
      });

      if (!table) {
        return res.status(404).json({ error: "Mesa não encontrada." });
      }

      if (table.status !== TableStatus.AVAILABLE || table.orders.length > 0) {
        return res.status(409).json({ error: "Não é possível remover uma mesa que não esteja livre ou tenha pedidos ativos." });
      }

      await prisma.table.delete({ where: { id } });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao remover mesa", details: error.message });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "Identificador da mesa inválido." });
      }

      const { number, capacity, status } = req.body;
      const data: { number?: number; capacity?: number; status?: TableStatus } = {};
      if (number !== undefined) {
        const tableNumber = Number(number);
        if (!Number.isInteger(tableNumber) || tableNumber < 1) {
          return res.status(400).json({ error: "Número da mesa deve ser um inteiro positivo." });
        }
        data.number = tableNumber;
      }
      if (capacity !== undefined) {
        const tableCapacity = Number(capacity);
        if (!Number.isInteger(tableCapacity) || tableCapacity < 1) {
          return res.status(400).json({ error: "Capacidade deve ser um inteiro positivo." });
        }
        data.capacity = tableCapacity;
      }
      if (status !== undefined) {
        if (!Object.values(TableStatus).includes(status)) {
          return res.status(400).json({ error: "Status inválido." });
        }
        data.status = status;
      }
      if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: "Informe ao menos um campo para atualizar a mesa." });
      }

      const table = await prisma.table.update({
        where: { id },
        data,
      });

      return res.json(table);
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(409).json({ error: "Já existe uma mesa com esse número." });
      }
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Mesa não encontrada." });
      }
      return res.status(500).json({ error: "Erro ao atualizar status da mesa", details: error.message });
    }
  },
};
