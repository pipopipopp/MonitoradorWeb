// Variável para armazenar o contador de processos detectados
let contador = 0;

// Função para atualizar o contador e exibir alertas
function atualizarContador(processo) {
    contador++;
    document.getElementById('contador').textContent = contador;

    // Exibir o alerta
    const alertasDiv = document.getElementById('alertas');
    alertasDiv.innerHTML += `<p>Processo detectado: ${processo}</p>`;
}

// Simular recebimento de alertas do serviço (para teste)
async function receberAlertas() {
    const response = await fetch('http://127.0.0.1:5500/alerta');
    const data = await response.json();
    atualizarContador(data.processo);
}

// Verificar alertas a cada 2 segundos
setInterval(receberAlertas, 2000);