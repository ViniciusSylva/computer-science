import { Request, Response } from "express";
import { prisma } from "../prisma";

export const MenuItemController = {
  async list(req: Request, res: Response) {
    try {
      const { categoryId, availableOnly } = req.query;

      const whereClause: any = {};
      if (categoryId) {
        whereClause.categoryId = Number(categoryId);
      }
      if (availableOnly === "true") {
        whereClause.isAvailable = true;
      }

      const items = await prisma.menuItem.findMany({
        where: whereClause,
        include: {
          category: true,
          optionGroups: {
            include: {
              options: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return res.json(items);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao buscar itens do cardápio", details: error.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const item = await prisma.menuItem.findUnique({
        where: { id },
        include: {
          category: true,
          optionGroups: {
            include: {
              options: true,
            },
          },
        },
      });

      if (!item) {
        return res.status(404).json({ error: "Item não encontrado." });
      }

      return res.json(item);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao buscar item", details: error.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { categoryId, name, description, price, imageUrl, isAvailable, optionGroups } = req.body;

      if (!name || price === undefined || !categoryId) {
        return res.status(400).json({ error: "Nome, preço e categoria são obrigatórios." });
      }

      const item = await prisma.menuItem.create({
        data: {
          categoryId: Number(categoryId),
          name,
          description,
          price: Number(price),
          imageUrl,
          isAvailable: isAvailable ?? true,
          optionGroups: optionGroups && optionGroups.length > 0 ? {
            create: optionGroups.map((group: any) => ({
              title: group.title,
              minSelect: group.minSelect ?? 0,
              maxSelect: group.maxSelect ?? 1,
              isRequired: group.isRequired ?? false,
              options: group.options ? {
                create: group.options.map((opt: any) => ({
                  name: opt.name,
                  additionalPrice: Number(opt.additionalPrice || 0),
                })),
              } : undefined,
            })),
          } : undefined,
        },
        include: {
          category: true,
          optionGroups: {
            include: {
              options: true,
            },
          },
        },
      });

      return res.status(201).json(item);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao criar item do cardápio", details: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { categoryId, name, description, price, imageUrl, isAvailable } = req.body;

      const item = await prisma.menuItem.update({
        where: { id },
        data: {
          categoryId: categoryId !== undefined ? Number(categoryId) : undefined,
          name,
          description,
          price: price !== undefined ? Number(price) : undefined,
          imageUrl,
          isAvailable,
        },
      });

      return res.json(item);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao atualizar item", details: error.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await prisma.menuItem.delete({ where: { id } });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao remover item", details: error.message });
    }
  },
};

