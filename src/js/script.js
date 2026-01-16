const CONFIG = { 
    DURACAO_ESTIMULO: 500, 
    ISI: 1500, 
    SEQUENCIA: ["G","G","G","G","N","G","N","G","G","N","G","G","G","G","G","G","N","G","G","G","G","N","G","G","G","G","G","G","N","G"] 
};

let game = { idx: 0, logs: [], active: false, start: 0, reacted: false };

const show = id => {
    document.querySelectorAll('.screen').forEach(s => s.classList.replace('active', 'hidden'));
    document.getElementById(id).classList.replace('hidden', 'active');
};

document.getElementById('btn-start').onclick = () => {
    game.idx = 0; 
    game.logs = []; 
    show('screen-test'); 
    setTimeout(runCycle, 1500);
};

function runCycle() {
    if (game.idx >= CONFIG.SEQUENCIA.length) return finish();
    
    game.reacted = false; 
    game.active = true; 
    game.start = Date.now();
    
    const type = CONFIG.SEQUENCIA[game.idx];
    const area = document.getElementById('stimulus-area');
    const cruz = document.getElementById('fixation-cross');
    
    // Esconde cruz e mostra círculo
    cruz.classList.add('hidden');
    area.className = type === 'G' ? 'stimulus-go' : 'stimulus-nogo';

    setTimeout(() => {
        area.className = ''; 
        cruz.classList.remove('hidden'); 
        game.active = false;
        
        if (!game.reacted) recordResponse(type, null);
        
        game.idx++; 
        setTimeout(runCycle, CONFIG.ISI);
    }, CONFIG.DURACAO_ESTIMULO);
}

window.onkeydown = e => {
    if (e.code === 'Space' && game.active && !game.reacted) {
        e.preventDefault(); 
        game.reacted = true;
        const rt = Date.now() - game.start;
        recordResponse(CONFIG.SEQUENCIA[game.idx], rt);
        document.getElementById('stimulus-area').className = '';
        document.getElementById('fixation-cross').classList.remove('hidden');
    }
};

function recordResponse(t, rt) {
    game.logs.push({ t, rt, ok: rt ? t === 'G' : t === 'N' });
}

function finish() {
    show('screen-results');
    const goItems = game.logs.filter(l => l.t === 'G');
    const hits = goItems.filter(l => l.rt);
    const avg = hits.length ? (hits.reduce((a,b) => a + b.rt, 0) / hits.length).toFixed(0) : 0;
    
    document.getElementById('res-accuracy').innerText = Math.round((hits.length / goItems.length) * 100) + '%';
    document.getElementById('res-avg-time').innerText = avg + 'ms';
    document.getElementById('res-total-errors').innerText = game.logs.filter(l => !l.ok).length;

    renderChart();
    
    document.getElementById('table-body').innerHTML = game.logs.map((l, i) => `
        <tr>
            <td>${i+1}</td>
            <td>${l.t==='G'?'🟢 Verde':'🔴 Vermelho'}</td>
            <td class="${l.ok?'status-ok':'status-error'}">
                ${l.ok ? (l.rt ? 'Acerto' : 'OK') : (l.rt ? 'Impulso' : 'Omissão')}
            </td>
            <td class="text-right">${l.rt ? l.rt + 'ms' : '-'}</td>
        </tr>`).join('');
}

function renderChart() {
    const dotsArea = document.getElementById('chart-dots-area');
    const svg = document.getElementById('chart-line-svg');
    dotsArea.innerHTML = '';
    svg.innerHTML = '';
    
    const reactionLogs = game.logs.filter(l => l.rt !== null);
    if (reactionLogs.length === 0) return;

    const rect = svg.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const maxRT = Math.max(...reactionLogs.map(l => l.rt), 600); 
    const points = [];

    reactionLogs.forEach((l, i) => {
        const x = (i / (reactionLogs.length - 1)) * (w * 0.94) + (w * 0.03);
        const y = h - ((l.rt / maxRT) * (h * 0.75) + (h * 0.12));

        const dot = document.createElement('div');
        dot.className = 'chart-dot';
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        dot.style.background = l.t === 'G' ? 'var(--blue)' : 'var(--red)';
        dotsArea.appendChild(dot);
        
        points.push({x, y});
    });

    if (points.length > 1) {
        const pathData = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "rgba(59, 130, 246, 0.4)");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("stroke-linecap", "round");
        svg.appendChild(path);
    }
}

document.getElementById('btn-copy').onclick = function() {
    const txt = game.logs.map((l,i) => `${i+1}:${l.ok?'V':'X'}(${l.rt||0}ms)`).join(' | ');
    navigator.clipboard.writeText("NEUROGO REPORT:\n" + txt);
    this.innerText = "✓ Copiado!";
    setTimeout(() => this.innerText = "📋 Copiar Relatório", 2000);
};