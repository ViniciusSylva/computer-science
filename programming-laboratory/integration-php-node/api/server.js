const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ==========================================
// ROTAS GET (Projetos)
// ==========================================

// GET /projetos - Listar todos os projetos
app.get('/projetos', async (req, res) => {
  try {
    // Usando prisma.projeto (referência idêntica ao modelo do schema)
    const projetos = await prisma.projeto.findMany();
    return res.status(200).json(projetos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar projetos no banco.' });
  }
});

// GET /projetos/:id - Buscar um projeto por ID
app.get('/projetos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projeto = await prisma.projeto.findUnique({
      where: { id: Number(id) },
    });

    if (!projeto) {
      return res.status(404).json({ error: 'Projeto não encontrado.' });
    }

    return res.status(200).json(projeto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar projeto.' });
  }
});

// ==========================================
// ROTAS POST (Projetos)
// ==========================================

// POST /projetos - Criar novo projeto
app.post('/projetos', async (req, res) => {
  try {
    const { nome, descricao, status } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'O nome do projeto é obrigatório.' });
    }

    const novoProjeto = await prisma.projeto.create({
      data: {
        nome,
        descricao, // Campo opcional (String?)
        status,    // Se não for enviado, o Prisma aplicará o default "Pendente"
      },
    });

    return res.status(201).json(novoProjeto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao salvar projeto no banco.' });
  }
});

app.listen(3000, () => {
  console.log('🚀 API rodando na porta 3000');
});