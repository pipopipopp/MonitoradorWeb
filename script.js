// Função para salvar dados no localStorage
function salvarDados(data) {
    localStorage.setItem('dadosMonitorador', JSON.stringify(data));
}

// Função para carregar dados do localStorage
function carregarDadosSalvos() {
    const dados = localStorage.getItem('dadosMonitorador');
    return dados ? JSON.parse(dados) : { abertosNoMomento: [], abertosNaSemana: {} };
}

// Função para carregar dados da API ou do cache
async function carregarDados() {
    const cacheKey = 'dadosMonitorador';
    const cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 dias

    // Verifica se há dados no cache e se ainda são válidos
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    const agora = new Date().getTime();

    if (cachedData && cacheTimestamp && agora - cacheTimestamp < cacheExpiry) {
        // Usa os dados do cache
        const dados = JSON.parse(cachedData);
        atualizarInterface(dados);
    } else {
        // Busca dados da API
        try {
            const response = await fetch('https://monitoradorweb-api.onrender.com/dados');
            const data = await response.json();

            // Atualiza o cache
            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(`${cacheKey}_timestamp`, agora);

            // Atualiza a interface
            atualizarInterface(data);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);

            // Tenta usar o cache mesmo que expirado
            if (cachedData) {
                const dados = JSON.parse(cachedData);
                atualizarInterface(dados);
            }
        }
    }
}

function limparLocalStorage() {
    const agora = new Date().getTime();
    const ultimaLimpeza = localStorage.getItem('ultimaLimpeza') || 0;

    // Limpa o localStorage a cada 7 dias
    if (agora - ultimaLimpeza > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem('dadosMonitorador');
        localStorage.setItem('ultimaLimpeza', agora);
    }
}

// Função para atualizar a interface
function atualizarInterface(data) {
    // Atualiza a lista de processos abertos
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

    // Atualiza a tabela de processos da semana
    const processosSemana = document.getElementById('processosSemana').getElementsByTagName('tbody')[0];
    processosSemana.innerHTML = Object.entries(data.abertosNaSemana)
        .map(([processo, contagem]) => `<tr><td>${processo}</td><td>${contagem}</td></tr>`)
        .join('');
}

function atualizarContadorReset() {
    const agora = new Date();
    const proximoReset = new Date(agora);
    proximoReset.setDate(proximoReset.getDate() + (7 - proximoReset.getDay())); // Próximo domingo
    proximoReset.setHours(0, 0, 0, 0); // Meia-noite

    const diff = proximoReset - agora;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const contador = document.getElementById('contadorReset');
    if (contador) {
        contador.textContent = `${dias}d ${horas}h ${minutos}m`;
    }
}

// Atualiza o contador de reset a cada minuto
setInterval(atualizarContadorReset, 60000);

// Atualiza o contador ao carregar a página
atualizarContadorReset();

// Carrega os dados a cada 2 segundos
setInterval(() => {
    fetch('https://monitoradorweb-api.onrender.com/dados')
        .then(response => response.json())
        .then(data => atualizarInterface(data))
        .catch(error => console.error('Erro ao carregar dados:', error));
}, 2000);

// Atualiza o contador de reset a cada minuto
setInterval(atualizarContadorReset, 60000);

// Atualiza o contador ao carregar a página
atualizarContadorReset();

// Carrega os dados ao abrir a página
carregarDados();