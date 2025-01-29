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

function atualizarInterface(data) {
    // Atualiza a lista de processos abertos
    const processosAbertos = document.getElementById('processosAbertos');
    processosAbertos.innerHTML = data.abertosNoMomento.map(p => {
        const nomeProcesso = p.replace('.exe', ''); // Remove a extensão .exe
        const cliquesRestantes = 10 - (contagemCliques[p] || 0);
        return `
            <li>
                ${nomeProcesso}
                <button class="encerrar" onclick="solicitarEncerramento('${p}')">Encerrar (${cliquesRestantes})</button>
            </li>
        `;
    }).join('');

    // Atualiza a tabela de processos da semana
    const processosSemana = document.getElementById('processosSemana').getElementsByTagName('tbody')[0];
    processosSemana.innerHTML = Object.entries(data.abertosNaSemana)
        .map(([processo, contagem]) => {
            const nomeProcesso = processo.replace('.exe', ''); // Remove a extensão .exe
            return `<tr><td>${nomeProcesso}</td><td>${contagem}</td></tr>`;
        })
        .join('');
}


let contagemCliques = {};

async function solicitarEncerramento(processo) {
    if (!contagemCliques[processo]) {
        contagemCliques[processo] = 0;
    }

    contagemCliques[processo]++;

    // Atualiza o texto do botão com os cliques restantes
    const botao = document.querySelector(`button[onclick="solicitarEncerramento('${processo}')"]`);
    if (botao) {
        botao.textContent = `Encerrar (${10 - contagemCliques[processo]})`;
    }

    if (contagemCliques[processo] >= 10) {
        try {
            const response = await fetch('https://monitoradorweb-api.onrender.com/encerrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ processo })
            });

            if (response.ok) {
                alert(`Processo ${processo.replace('.exe', '')} será encerrado.`);
                contagemCliques[processo] = 0; // Reseta o contador
                carregarDados(); // Recarrega os dados para atualizar a interface
            } else {
                alert('Erro ao solicitar encerramento do processo.');
            }
        } catch (error) {
            console.error('Erro ao solicitar encerramento:', error);
        }
    }
}

// Carrega os dados a cada 2 segundos
setInterval(carregarDados, 2000);

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
        contador.textContent = `Próximo reset em: ${dias}d ${horas}h ${minutos}m`;
    }
}

// Atualiza o contador a cada minuto
setInterval(atualizarContadorReset, 60000);

// Atualiza o contador ao carregar a página
atualizarContadorReset();

// Carrega os dados ao abrir a página
carregarDados();