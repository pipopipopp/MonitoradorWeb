document.addEventListener("DOMContentLoaded", () => {
    function salvarDados(data) {
        localStorage.setItem('dadosMonitorador', JSON.stringify(data));
    }

    function carregarDadosSalvos() {
        const dados = localStorage.getItem('dadosMonitorador');
        return dados ? JSON.parse(dados) : { abertosNoMomento: [], abertosNaSemana: {} };
    }

    async function carregarDados() {
        try {
            const response = await fetch('https://c99d-2804-30c-404c-4500-f8e0-5bb9-2fdd-7689.ngrok-free.app/dados'); // URL do ngrok
            if (!response.ok) throw new Error("API offline");
            const data = await response.json();
            atualizarInterface(data);
            document.getElementById("conteudo").style.display = "block";
            document.getElementById("statusOff").style.display = "none";
        } catch (error) {
            document.getElementById("conteudo").style.display = "none";
            document.getElementById("statusOff").style.display = "flex";
        }
    }

    function atualizarInterface(data) {
        const processosAbertos = document.getElementById('processosAbertos');
        processosAbertos.innerHTML = "";

        const processosPredefinidos = ["League of Legends", "osu!", "Roblox"];
        
        processosPredefinidos.forEach(processo => {
            const li = document.createElement('li');
            li.classList.add("processo");
            
            const status = document.createElement("span");
            status.classList.add("status", data.abertosNoMomento.includes(processo) ? "verde" : "cinza");
            
            li.appendChild(status);
            li.append(` ${processo}`);
            processosAbertos.appendChild(li);
        });

        const processosSemana = document.getElementById('processosSemana').getElementsByTagName('tbody')[0];
        processosSemana.innerHTML = Object.entries(data.abertosNaSemana)
            .map(([processo, contagem]) => `<tr><td>${processo}</td><td>${contagem}</td></tr>`)
            .join('');
    }

    function atualizarContadorReset() {
        const agora = new Date();
        const proximoReset = new Date(agora);
        proximoReset.setDate(proximoReset.getDate() + (7 - proximoReset.getDay())); // próximo domingo
        proximoReset.setHours(0, 0, 0, 0);

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

    setInterval(carregarDados, 2000);
    carregarDados();

    // Ajustando posicionamento do título e legenda
    const tituloSecao = document.querySelector(".secao h2");
    const legenda = document.querySelector(".legenda");
    if (tituloSecao && legenda) {
        tituloSecao.style.display = "flex";
        tituloSecao.style.alignItems = "center";
        tituloSecao.style.justifyContent = "space-between";
        tituloSecao.appendChild(legenda);
    }
});