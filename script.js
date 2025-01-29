// Função para salvar dados no localStorage
function salvarDados(data) {
    localStorage.setItem('dadosMonitorador', JSON.stringify(data));
}

// Função para carregar dados do localStorage
function carregarDadosSalvos() {
    const dados = localStorage.getItem('dadosMonitorador');
    return dados ? JSON.parse(dados) : { abertosNoMomento: [], abertosNaSemana: {} };
}

// Função para carregar dados da API
async function carregarDados() {
    try {
        const response = await fetch('https://monitoradorweb-api.onrender.com/dados');
        const data = await response.json();

        // Salva os dados no localStorage
        salvarDados(data);

        // Atualiza a interface
        atualizarInterface(data);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);

        // Carrega dados salvos localmente em caso de erro
        const dadosSalvos = carregarDadosSalvos();
        atualizarInterface(dadosSalvos);
    }
}

// Função para atualizar a interface
function atualizarInterface(data) {
    // Atualiza a lista de processos abertos
    const processosAbertos = document.getElementById('processosAbertos');
    processosAbertos.innerHTML = data.abertosNoMomento.map(p => `<li>${p}</li>`).join('');

    // Atualiza a tabela de processos da semana
    const processosSemana = document.getElementById('processosSemana').getElementsByTagName('tbody')[0];
    processosSemana.innerHTML = Object.entries(data.abertosNaSemana)
        .map(([processo, contagem]) => `<tr><td>${processo}</td><td>${contagem}</td></tr>`)
        .join('');
}

// Carrega os dados a cada 2 segundos
setInterval(carregarDados, 2000);

// Carrega os dados ao abrir a página
carregarDados();