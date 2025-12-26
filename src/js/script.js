// 1. Configurações Oficiais do Protocolo
const STIMULUS_DURATION = 500; // Tempo que o círculo fica na tela (ms)
const ISI_DURATION = 1500;      // Intervalo entre estímulos (ms)

// 2. Sequência Científica Completa (300 itens)
const FULL_SEQUENCE = [
  "G","G","G","G","N","G","N","G","G","N", // 1-10
  "G","G","G","G","G","G","N","G","G","G", // 11-20
  "G","N","G","G","G","G","G","G","N","G", // 21-30
  "G","G","G","G","N","G","G","G","N","G", // 31-40
  "G","G","N","G","N","N","G","N","G","G", // 41-50
  "G","G","G","N","G","G","G","G","G","G", // 51-60
  "G","G","G","N","G","G","N","N","N","G", // 61-70
  "G","G","N","G","G","G","N","G","G","G", // 71-80
  "N","G","G","N","G","G","G","G","G","N", // 81-90
  "G","G","G","G","N","N","G","N","G","G", // 91-100
  "N","N","G","G","G","G","G","G","N","G", // 101-110
  "G","G","N","G","G","G","G","G","N","G", // 111-120
  "N","G","N","G","G","N","N","G","G","G", // 121-130
  "G","G","G","G","G","N","G","G","N","G", // 131-140
  "G","N","G","N","N","G","G","G","G","G", // 141-150
  "N","G","G","G","G","G","N","G","G","G", // 151-160
  "N","G","G","G","N","G","G","G","G","N", // 161-170
  "G","G","G","G","G","G","N","G","N","N", // 171-180
  "G","G","N","G","N","G","G","N","G","G", // 181-190
  "G","G","G","G","N","N","N","G","G","G", // 191-200
  "G","G","N","G","N","G","G","N","G","G", // 201-210
  "G","G","N","N","G","G","G","G","G","G", // 211-220
  "N","G","G","G","G","G","N","G","G","G", // 221-230
  "G","G","N","G","G","N","G","G","G","G", // 231-240
  "G","G","N","G","G","N","G","G","G","G", // 241-250
  "G","N","G","G","G","G","G","G","N","G", // 251-260
  "N","N","G","G","G","G","G","N","N","G", // 261-270
  "G","N","G","G","G","G","G","N","G","G", // 271-280
  "G","G","G","N","N","G","G","G","G","G", // 281-290
  "G","G","G","G","N","G","G","G","G","G"  // 291-300
];

// Versão reduzida para demonstração (30 itens)
const RAW_SEQUENCE = FULL_SEQUENCE.slice(0, 30); 

// 3. Seleção de Elementos do DOM
const introScreen = document.getElementById('intro-screen');
const testScreen = document.getElementById('test-screen');
const resultsScreen = document.getElementById('results-screen');
const stimulusDisplay = document.getElementById('stimulus-display');
const startBtn = document.getElementById('start-btn');
const statsContainer = document.getElementById('stats-container');

// 4. Variáveis de Estado do Teste
let currentIndex = 0;
let canRespond = false;
let responseTimer = null;
let userRecords = [];

// --- LÓGICA DE EXECUÇÃO ---

// Iniciar o Teste
function startTest() {
    introScreen.classList.add('hidden');
    testScreen.classList.remove('hidden');
    setTimeout(nextStimulus, 1000); // Pequena pausa antes do primeiro
}

// Ciclo de cada Estímulo
function nextStimulus() {
    if (currentIndex >= RAW_SEQUENCE.length) {
        finishTest();
        return;
    }

    const currentType = RAW_SEQUENCE[currentIndex];
    canRespond = true;
    responseTimer = Date.now();

    // Mostrar Círculo
    stimulusDisplay.className = ''; 
    if (currentType === "G") {
        stimulusDisplay.classList.add('go-circle');
    } else {
        stimulusDisplay.classList.add('no-go-circle');
    }

    // Tempo de exibição (500ms)
    setTimeout(() => {
        stimulusDisplay.className = ''; 
        canRespond = false;

        // Verifica se o usuário NÃO apertou (omissão)
        checkOmission(currentType);

        currentIndex++;
        // Intervalo entre estímulos (1500ms)
        setTimeout(nextStimulus, ISI_DURATION);
    }, STIMULUS_DURATION);
}

// Captura de Tecla
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && canRespond) {
        handleResponse();
    }
});

function handleResponse() {
    canRespond = false; // Impede múltiplos cliques no mesmo círculo
    const reactionTime = Date.now() - responseTimer;
    
    userRecords.push({
        index: currentIndex,
        type: RAW_SEQUENCE[currentIndex],
        correct: RAW_SEQUENCE[currentIndex] === "G",
        reactionTime: reactionTime
    });
}

function checkOmission(type) {
    const alreadyResponded = userRecords.find(r => r.index === currentIndex);
    if (!alreadyResponded) {
        userRecords.push({
            index: currentIndex,
            type: type,
            correct: type === "N", // Correto se for No-Go e não apertou
            reactionTime: null
        });
    }
}

// Finalização e Resultados
function finishTest() {
    testScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    renderResults();
}

function renderResults() {
    const totalGo = RAW_SEQUENCE.filter(t => t === "G").length;
    const hits = userRecords.filter(r => r.type === "G" && r.correct).length;
    const errors = userRecords.filter(r => !r.correct).length;
    
    const validTimes = userRecords
        .filter(r => r.correct && r.reactionTime !== null)
        .map(r => r.reactionTime);
        
    const avgTime = validTimes.length > 0 
        ? (validTimes.reduce((a, b) => a + b, 0) / validTimes.length).toFixed(0) 
        : 0;

    statsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 15px; font-size: 1.1rem;">
            <p>✅ <strong>Acertos (Verdes):</strong> ${hits} de ${totalGo}</p>
            <p>❌ <strong>Erros Totais:</strong> ${errors}</p>
            <p>⏱️ <strong>Tempo Médio:</strong> ${avgTime}ms</p>
        </div>
    `;
}

// Event Listeners
startBtn.addEventListener('click', startTest);

// 3. Seleção de Elementos (Adicione esta linha junto com as outras seleções)
const resetBtn = document.getElementById('reset-btn'); 

// ... (mantenha suas funções iguais)

// --- EVENT LISTENERS (Final do arquivo) ---

// Iniciar o teste
startBtn.addEventListener('click', startTest);

// Finalizar Atendimento (Reseta a página para uma nova avaliação)
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        window.location.reload();
    });
}