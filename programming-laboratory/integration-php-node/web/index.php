<?php
require_once 'ApiClient.php';
$api = new ApiClient();
$resultado = $api->testarConexao();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Integração PHP e Node.js</title>
</head>
<body style="font-family: sans-serif; padding: 20px;">
    <h1>Painel de Projetos (MVP)</h1>

    <div style="background: #e2e8f0; padding: 15px; border-radius: 8px;">
        <h3>Status da API Node.js:</h3>
        <?php if($resultado): ?>
            <p style="color: green; font-weight: bold;"><?=
$resultado['mensagem'] ?></p>
        <?php else: ?>
            <p style="color: red;">Falha. O servidor Node está rodando?</p>
        <?php endif; ?>
    </div>

    <hr>
    <h2>Fim da Fase Assistida!</h2>
    <p>Consulte o documento <strong>plano_implementacao.pdf</strong> para verificar os requisitos do que você deve construir agora na Fase 2.</p>
</body>
</html>
