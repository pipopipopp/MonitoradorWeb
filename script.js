let contador = 0;

// Função para atualizar o contador e exibir alertas
function atualizarContador(processo) {
    contador++;
    document.getElementById('contador').textContent = contador;

    const alertasDiv = document.getElementById('alertas');
    alertasDiv.innerHTML += `<p>Processo detectado: ${processo}</p>`;
}

// Função para obter alertas da API
async function obterAlertas() {
    try {
        const response = await fetch('https://monitoradorweb-api.onrender.com/alertas');
        const data = await response.json();
        data.forEach(processo => atualizarContador(processo));
    } catch (error) {
        console.error('Erro ao obter alertas:', error);
    }
}

// Verificar alertas a cada 2 segundos
setInterval(obterAlertas, 2000);