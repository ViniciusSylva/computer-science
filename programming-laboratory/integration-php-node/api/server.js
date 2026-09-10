const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de Teste para o Checkpoint
app.get('/api/teste', (req, res) => {
 res.json({ mensagem: "Comunicação com Node.js estabelecida com sucesso!" });
});
app.listen(PORT, () => {
 console.log(`Servidor rodando na porta ${PORT}`);
});
