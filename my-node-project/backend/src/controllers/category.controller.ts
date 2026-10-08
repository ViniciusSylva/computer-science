import { Request, Response } from "express";
import { prisma } from "../prisma";

export const CategoryController = {
  async list(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { orderIndex: "asc" },
        include: {
          items: {
            where: { isAvailable: true },
            include: {
              optionGroups: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      });
      return res.json(categories);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao buscar categorias", details: error.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, description, icon, orderIndex } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Nome da categoria é obrigatório." });
      }

      const category = await prisma.category.create({
        data: {
          name,
          description,
          icon,
          orderIndex: orderIndex ?? 0,
        },
      });

      return res.status(201).json(category);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao criar categoria", details: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { name, description, icon, orderIndex } = req.body;

      const category = await prisma.category.update({
        where: { id },
        data: { name, description, icon, orderIndex },
      });

      return res.json(category);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao atualizar categoria", details: error.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await prisma.category.delete({ where: { id } });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao remover categoria", details: error.message });
    }
  },
};

