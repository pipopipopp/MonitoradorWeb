function salvarDados(data) {
    localStorage.setItem('dadosMonitorador', JSON.stringify(data));
}

function carregarDadosSalvos() {
    const dados = localStorage.getItem('dadosMonitorador');
    return dados ? JSON.parse(dados) : { abertosNoMomento: [], abertosNaSemana: {} };
}

async function carregarDados() {
    try {
        const response = await fetch('http://localhost:3000/dados');
        const data = await response.json();
        atualizarInterface(data);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados. Tente novamente mais tarde.');
    }
}

function limparLocalStorage() {
    const agora = new Date().getTime();
    const ultimaLimpeza = localStorage.getItem('ultimaLimpeza') || 0;

    if (agora - ultimaLimpeza > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem('dadosMonitorador');
        localStorage.setItem('ultimaLimpeza', agora);
    }
}

function atualizarInterface(data) {
    const processosAbertos = document.getElementById('processosAbertos');
    const processos = processosAbertos.querySelectorAll('.processo');

    processos.forEach(processo => {
        const nomeProcesso = processo.textContent.trim();
        if (data.abertosNoMomento.includes(nomeProcesso)) {
            processo.classList.remove('fechado');
            processo.classList.add('aberto');
        } else {
            processo.classList.remove('aberto');
            processo.classList.add('fechado');
        }
    });

    const processosSemana = document.getElementById('processosSemana').getElementsByTagName('tbody')[0];
    processosSemana.innerHTML = Object.entries(data.abertosNaSemana)
        .map(([processo, contagem]) => `<tr><td>${processo}</td><td>${contagem}</td></tr>`)
        .join('');
}

function atualizarContadorReset() {
    const agora = new Date();
    const proximoReset = new Date(agora);
    proximoReset.setDate(proximoReset.getDate() + (7 - proximoReset.getDay())); // proximo domingo
    proximoReset.setHours(0, 0, 0, 0); // Meia noite

    const diff = proximoReset - agora;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const contador = document.getElementById('contadorReset');
    if (contador) {
        contador.textContent = `${dias}d ${horas}h ${minutos}m`;
    }
}

setInterval(atualizarContadorReset, 60000);

atualizarContadorReset();

setInterval(() => {
    fetch('http://localhost:3000/dados')
        .then(response => response.json())
        .then(data => atualizarInterface(data))
        .catch(error => console.error('Erro ao carregar dados:', error));
}, 2000);

setInterval(atualizarContadorReset, 60000);

atualizarContadorReset();

carregarDados();