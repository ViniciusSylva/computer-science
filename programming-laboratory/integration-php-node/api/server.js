const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

app.get('/projetos', async (req, res) => {
  try {
    const projetos = await prisma.projeto.findMany({
      orderBy: { id: 'desc' } // Mostra os novos primeiro
    });
    return res.status(200).json(projetos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar projetos.' });
  }
});

app.post('/projetos', async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório.' });

    const novoProjeto = await prisma.projeto.create({
      data: { nome, descricao }
    });
    return res.status(201).json(novoProjeto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar projeto.' });
  }
});

app.post('/projetos', async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    // Validação: Bloqueia nome ausente ou preenchido apenas com espaços
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ error: 'O nome do projeto é obrigatório.' });
    }

    const novoProjeto = await prisma.projeto.create({
      data: {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : null
      }
    });

    return res.status(201).json(novoProjeto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno ao salvar o projeto.' });
  }
});

app.delete('/projetos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.projeto.delete({
      where: { id: Number(id) }
    });

    return res.status(200).json({ message: 'Projeto excluído com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao excluir projeto.' });
  }
});

app.listen(3000, () => {
  console.log('🚀 API rodando na porta 3000');
});