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
      if (!number) {
        return res.status(400).json({ error: "Número da mesa é obrigatório." });
      }

      const table = await prisma.table.create({
        data: {
          number: Number(number),
          capacity: capacity ? Number(capacity) : 4,
          status: TableStatus.AVAILABLE,
        },
      });

      return res.status(201).json(table);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao cadastrar mesa", details: error.message });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      if (!Object.values(TableStatus).includes(status)) {
        return res.status(400).json({ error: "Status inválido." });
      }

      const table = await prisma.table.update({
        where: { id },
        data: { status },
      });

      return res.json(table);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao atualizar status da mesa", details: error.message });
    }
  },
};

