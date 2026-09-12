<?php
class ApiClient {
    public function testarConexao() {
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, 'http://localhost:3000/api/teste');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        
        curl_close($ch);

        // Retorna JSON como Array Associativo
        return json_decode($response, true);
    }
}
?>