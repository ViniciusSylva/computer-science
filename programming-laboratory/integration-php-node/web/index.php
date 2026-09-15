<?php
// web/index.php

$mensagem = "";
$tipoMensagem = "";

// Verifica se o formulário foi enviado via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = $_POST['nome'] ?? '';
    $descricao = $_POST['descricao'] ?? '';

    // Validação simples no PHP
    if (!empty($nome)) {
        // Dados a serem enviados em formato JSON para a API Node.js
        $dadosProjeto = [
            'nome' => $nome,
            'descricao' => $descricao
        ];

        $payload = json_encode($dadosProjeto);

        // Inicializa o cURL para consumir a rota POST da API Node.js
        $ch = curl_init('http://localhost:3000/projetos');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($payload)
        ]);

        $resposta = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // Verifica a resposta da API (201 Created)
        if ($httpCode === 201) {
            $mensagem = "Projeto enviado e salvo com sucesso no MySQL via Node.js!";
            $tipoMensagem = "sucesso";
        } else {
            $mensagem = "Erro ao enviar o projeto. Código de resposta: " . $httpCode;
            $tipoMensagem = "erro";
        }
    } else {
        $mensagem = "Por favor, preencha o nome do projeto.";
        $tipoMensagem = "erro";
    }
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastrar Projeto</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 500px;
            margin: 40px auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 8px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="text"], textarea {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        button {
            background-color: #007bff;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
            font-size: 16px;
        }
        button:hover {
            background-color: #0056b3;
        }
        .alerta {
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
        .sucesso {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .erro {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>

    <h2>Novo Projeto</h2>

    <?php if (!empty($mensagem)): ?>
        <div class="alerta <?= $tipoMensagem ?>">
            <?= htmlspecialchars($mensagem) ?>
        </div>
    <?php endif; ?>

    <form method="POST" action="index.php">
        <div class="form-group">
            <label for="nome">Nome do Projeto:*</label>
            <input type="text" id="nome" name="nome" required>
        </div>

        <div class="form-group">
            <label for="descricao">Descrição:</label>
            <textarea id="descricao" name="descricao" rows="4"></textarea>
        </div>

        <button type="submit">Salvar Projeto</button>
    </form>

</body>
</html>