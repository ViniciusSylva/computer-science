const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'sucesso',
        message: 'API is running'
    });
});

app.get('/consulta-cep/:cep', async (req, res) => {
    try {
        const resposta = await axios.get(`https://viacep.com.br/ws/${req.params.cep}/json/`);
        
        if (resposta.data.erro) {
            return res.status(404).json({ mensagem: 'CEP não encontrado!' });
        }

        res.json(resposta.data);
    } catch (erro) {
        res.status(500).json({ mensagem: 'Erro ao consultar CEP!' });
    }
});

app.get('/consulta-cpf/:cpf', async (req, res) => {
    try {
        const resposta = await axios.get(`https://brasilapi.com.br/api/cpf/v1/${req.params.cpf}`);
        res.json(resposta.data);
    } catch (erro) {
        res.status(500).json({ mensagem: 'Erro ao consultar CPF!' });
    }
});

app.get('/consulta-clima/:cidade', async (req, res) => {
    try {
        const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${req.params.cidade}&count=1`);
        const { latitude, longitude, name } = geo.data.results[0];
        
        const clima = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        
        res.json({
            cidade: name,
            temperatura: clima.data.current_weather.temperature,
            vento: clima.data.current_weather.windspeed
        });
    } catch (erro) {
        res.status(500).json({ mensagem: 'Erro ao consultar clima!' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}!`);
});