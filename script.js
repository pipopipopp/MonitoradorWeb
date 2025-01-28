let contador = 0;

// Função para atualizar o contador e exibir alertas
function atualizarContador(processo) {
    contador++;
    document.getElementById('contador').textContent = contador;

    const alertasDiv = document.getElementById('alertas');
    alertasDiv.innerHTML += `<p>Processo detectado: ${processo}</p>`;
}

// Função para receber alertas do serviço
async function receberAlertas() {
    try {
        const response = await fetch('https://seuusuario.github.io/MonitoradorWeb/alerta');
        const data = await response.json();
        atualizarContador(data.processo);
    } catch (error) {
        console.error('Erro ao receber alertas:', error);
    }
}

// Verificar alertas a cada 2 segundos
setInterval(receberAlertas, 2000);