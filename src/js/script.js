// --- 1. CONFIGURAÇÕES E SEQUÊNCIA ---
const STIMULUS_DURATION = 500; // Tempo de exibição (ms)
const ISI_DURATION = 1500;      // Intervalo entre estímulos (ms)

// Sequência oficial de 30 itens
const RAW_SEQUENCE = [
    "G","G","G","G","N","G","N","G","G","N",
    "G","G","G","G","G","G","N","G","G","G",
    "G","N","G","G","G","G","G","G","N","G"
];

// --- 2. SELEÇÃO DE ELEMENTOS ---
const introScreen = document.getElementById('intro-screen');
const testScreen = document.getElementById('test-screen');
const resultsScreen = document.getElementById('results-screen');
const stimulusDisplay = document.getElementById('stimulus-display');
const statsGrid = document.getElementById('stats-grid');
const errorDetails = document.getElementById('error-details');

const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');

// --- 3. ESTADO DO TESTE ---
let currentIndex = 0;
let canRespond = false;
let stimulusStartTime = 0;
let responseRegistered = false;
let userRecords = [];

// --- 4. LÓGICA DO TESTE ---

function startTest() {
    introScreen.classList.add('hidden-screen');
    testScreen.classList.remove('hidden-screen');
    testScreen.classList.add('active-screen');
    
    // Pequeno atraso inicial antes do primeiro estímulo
    setTimeout(nextStimulus, 1000);
}

function nextStimulus() {
    if (currentIndex >= RAW_SEQUENCE.length) {
        finishTest();
        return;
    }

    const currentType = RAW_SEQUENCE[currentIndex];
    responseRegistered = false;
    canRespond = true;
    stimulusStartTime = Date.now();

    // Exibe o estímulo visual
    stimulusDisplay.className = ''; 
    stimulusDisplay.classList.add(currentType === "G" ? 'go-circle' : 'nogo-circle');

    // Remove o estímulo após o tempo definido
    setTimeout(() => {
        stimulusDisplay.className = ''; 
        canRespond = false;

        // Se o tempo acabou e não houve resposta, registra como omissão ou acerto No-Go
        if (!responseRegistered) {
            registerResponse(null);
        }

        currentIndex++;
        // Intervalo fixo entre estímulos
        setTimeout(nextStimulus, ISI_DURATION);
    }, STIMULUS_DURATION);
}

// Captura da tecla Espaço
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        // Se estiver na tela inicial, começa o teste
        if (!introScreen.classList.contains('hidden-screen')) {
            startTest();
        } 
        // Se estiver no teste e puder responder
        else if (canRespond && !responseRegistered) {
            registerResponse(Date.now() - stimulusStartTime);
        }
    }
});

function registerResponse(responseTime) {
    responseRegistered = true;
    const type = RAW_SEQUENCE[currentIndex];
    
    // Lógica de acerto: Apertar no G ou NÃO apertar no N
    const isCorrect = responseTime !== null ? type === "G" : type === "N";

    userRecords.push({
        type: type,
        responseTime: responseTime,
        isCorrect: isCorrect
    });
}

// --- 5. RESULTADOS E RELATÓRIO ---

function finishTest() {
    testScreen.classList.add('hidden-screen');
    resultsScreen.classList.remove('hidden-screen');
    resultsScreen.classList.add('active-screen');

    // Cálculos para o relatório
    const goRecords = userRecords.filter(r => r.type === "G");
    const nogoRecords = userRecords.filter(r => r.type === "N");
    
    const hits = goRecords.filter(r => r.isCorrect).length;
    const omissionErrors = goRecords.length - hits;
    const commissionErrors = nogoRecords.filter(r => !r.isCorrect).length;
    
    const rtValues = goRecords.filter(r => r.isCorrect).map(r => r.responseTime);
    const avgRT = rtValues.length > 0 ? (rtValues.reduce((a, b) => a + b, 0) / rtValues.length).toFixed(0) : 0;

    // Renderiza os cards principais
    statsGrid.innerHTML = `
        <div class="stat-card">
            <span class="stat-value" style="color: #22c55e">${hits}/${goRecords.length}</span>
            <span class="stat-label">Acertos (Go)</span>
        </div>
        <div class="stat-card">
            <span class="stat-value" style="color: #ef4444">${commissionErrors + omissionErrors}</span>
            <span class="stat-label">Erros Totais</span>
        </div>
        <div class="stat-card">
            <span class="stat-value">${avgRT}ms</span>
            <span class="stat-label">Tempo Médio</span>
        </div>
    `;

    // Renderiza análise detalhada de erros
    errorDetails.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
            <span>Erros de Comissão (Impulsividade):</span>
            <span class="nogo-text" style="font-weight: 800">${commissionErrors}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
            <span>Erros de Omissão (Desatenção):</span>
            <span class="go-text" style="font-weight: 800">${omissionErrors}</span>
        </div>
    `;
}

// Event Listeners dos botões
startBtn.addEventListener('click', startTest);
resetBtn.addEventListener('click', () => window.location.reload());