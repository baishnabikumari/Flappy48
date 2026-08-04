const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.45;
const FLAP_POWER = -8;

const BASE_SCROLL_SPEED = 3;
const MAX_SCROLL_SPEED = 6;
const GATE_WIDTH = 70;
const BASE_GATE_GAP = 170;
const MIN_GATE_GAP = 115;
const GATE_SPACING = 200;
const DIFFICULTY_RAMP_SCORE = 40;

const TILE_RADIUS = 16;
const TRAIL_SPACING = 40;
const PARTICLE_COUNT = 90;
const PARTICLE_FIELD_RADIUS = 90;
const LED_COUNT = 60;
const LED_SIZE = 5;
const bird = {
    x: 120,
    y: canvas.height / 2,
    vy: 0,
    radius: 18,
    value: 2
};

let bgOffset = 0;
let running = true;
let gates = [];
let score = 0;
let trail = [];

let scrollSpeed = BASE_SCROLL_SPEED;
let gateGap = BASE_GATE_GAP;

let particles = [];
let hueOffset = 0;
let flashTimer = 0;
let flashColor = '255,255,255';
let wasRunning = true;

function updateDifficulty(){
    const t = Math.min(score / DIFFICULTY_RAMP_SCORE, 1);
    scrollSpeed = BASE_SCROLL_SPEED + (MAX_SCROLL_SPEED - BASE_SCROLL_SPEED) * t;
    gateGap = BASE_GATE_GAP - (BASE_GATE_GAP - MIN_GATE_GAP) * t;
}

function ledPosition(t){
    const w = canvas.width;
    const h = canvas.height;
    const perimeter = 2 * (w + h);
    let d = t * perimeter;

    if (d < w) return { x: d, y: 0 };
    d -= w;
    if (d < h) return { x: w, y: d };
    d -= h;
    if (d < w) return { x: w - d, y: h};
    d -= w;
    return { x: 0, y: h - d };
}

function triggerFlash(color){
    flashTimer = 1;
    flashColor = color;
}

function updateEffects(){
    hueOffset = (hueOffset + 0.6 + scrollSpeed * 0.3) % 360;
    if (flashTimer > 0) flashTimer = Math.max(0, flashTimer - 0.04);
}

function initParticles(){
    particles = [];
    for(let i = 0; i < PARTICLE_COUNT; i++){
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: 1 + Math.random() * 2,
            drift: Math.random() * Math.PI * 2
        });
    }
}

function updateParticles(){
    for ( const p of particles){
        p.drift += 0.01;
        p.x += p.vx + Math.sin(p.drift) * 0.15;
        p.y += p.vy + Math.cos(p.drift) * 0.15;

        const dx = bird.x - p.x;
        const dy = bird.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < PARTICLE_FIELD_RADIUS && dist > 0.01){
            const pull = (PARTICLE_FIELD_RADIUS - dist) / PARTICLE_FIELD_RADIUS;
            p.x += (dx / dist) * pull * 1.2;
            p.y += (dy / dist) * pull * 1.2;
        }
        if(p.x < 0) p.x = canvas.width;
        if(p.x > canvas.width) p.x = 0;
        if(p.y < 0) p.y = canvas.height;
        if(p.y > canvas.height) p.y = 0;
    }
}

function flap() {
    if (!running) {
        resetGame();
        return;
    }
    bird.vy = FLAP_POWER;
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.vy = 0;
    bird.value = 2;
    gates = [];
    score = 0;
    trail = [];
    running = true;
    flashTimer = 0;
    scrollSpeed = BASE_SCROLL_SPEED;
    gateGap = BASE_GATE_GAP;
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') flap();
});
canvas.addEventListener('mousedown', flap);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    flap()
});

const TILE_COLORS = {
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b'
};

function tileColor(value) {
    return TILE_COLORS[value] || '#3c3a32';
}

function randomTileValue() {
    if (Math.random() < 0.4) return bird.value;
    const low = Math.max(2, bird.value / 2);
    const options = [low, bird.value, bird.value * 2];
    return options[Math.floor(Math.random() * options.length)];
}

function spawnGate() {
    const margin = 60;
    const gap = gateGap;
    const gapY = margin + Math.random() * (canvas.height - margin * 2 - gap);
    const tileY = gapY + gap / 2 + (Math.random() - 0.5) * (gap - 60);
    gates.push({
        x: canvas.width + GATE_WIDTH,
        gapY,
        gap,
        passed: false,
        tile: { value: randomTileValue(), y: tileY, collected: false }
    });
}

function hitsGate(gate) {
    const withinX = bird.x + bird.radius > gate.x && bird.x - bird.radius < gate.x + GATE_WIDTH;
    if (!withinX) return false;
    const withinGap = bird.y - bird.radius > gate.gapY && bird.y + bird.radius < gate.gapY + gate.gap;
    return !withinGap;
}

function pointHitsGate(gate, x, y){
    const withinX = x + TILE_RADIUS > gate.x && x - TILE_RADIUS < gate.x + GATE_WIDTH;
    if(!withinX) return false;
    const withinGap = y - TILE_RADIUS > gate.gapY && y + TILE_RADIUS < gate.gapY + gate.gap;
    return !withinGap;
}

function hitsTile(gate) {
    const tile = gate.tile;
    const tx = gate.x + GATE_WIDTH / 2;
    const dx = bird.x - tx;
    const dy = bird.y - tile.y;
    return Math.sqrt(dx * dx + dy * dy) < bird.radius + TILE_RADIUS;
}

function collectTile(tile) {
    if (tile.value === bird.value) {
        bird.value *= 2;
        score += bird.value;
        triggerFlash('255,214,120');
    } else {
        trail.push({ value: tile.value, x: bird.x, y: bird.y });
    }
}

function updateTrail() {
    let targetX = bird.x - TRAIL_SPACING;
    let targetY = bird.y;
    for (const t of trail) {
        t.x += (targetX - t.x) * 0.2;
        t.y += (targetY - t.y) * 0.2;
        targetX = t.x - TRAIL_SPACING;
        targetY = t.y;
    }
}

function update() {
    updateDifficulty();
    updateParticles();
    updateEffects();
    if (!running) return;

    bird.vy += GRAVITY;
    bird.y += bird.vy;

    bgOffset = (bgOffset + scrollSpeed) % 40;

    if (gates.length === 0 || gates[gates.length - 1].x < canvas.width - GATE_SPACING) {
        spawnGate();
    }

    for (const gate of gates) {
        gate.x -= scrollSpeed;

        if (!gate.passed && gate.x + GATE_WIDTH < bird.x) {
            gate.passed = true;
            score++;
        }
        if (hitsGate(gate)) {
            running = false;
        }
        if (!gate.tile.collected && hitsTile(gate)) {
            gate.tile.collected = true;
            collectTile(gate.tile);
        }
        for (const t of trail){
            if(pointHitsGate(gate, t.x, t.y)){
                running = false;
            }
        }
    }
    gates = gates.filter(g => g.x + GATE_WIDTH > 0);
    updateTrail();

    if (bird.y - bird.radius < 0 || bird.y + bird.radius > canvas.height) {
        bird.y = Math.max(bird.radius, Math.min(canvas.height - bird.radius, bird.y));
        running = false;
    }
    if(wasRunning && !running){
        triggerFlash('255,70,70');
    }
    wasRunning = running;
}

function drawBackground() {
    ctx.fillStyle = 'rgba(18, 20, 16, 0.35)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(120, 140, 100, 0.08)';
    ctx.lineWidth = 1;
    for (let x = -bgOffset; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (const p of particles){
        ctx.fillStyle = p.size > 2 ? 'rgba(196, 164, 86, 0.55)' : 'rgba(94, 138, 102, 0.45)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGates() {
    ctx.fillStyle = '#8f7a66';
    for (const gate of gates) {
        ctx.fillRect(gate.x, 0, GATE_WIDTH, gate.gapY);
        ctx.fillRect(gate.x, gate.gapY + gate.gap, GATE_WIDTH, canvas.height - gate.gapY - gate.gap);
    }
}

function drawScore() {
    ctx.fillStyle = '#776e65';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(score, canvas.width / 2, 50);
}

function drawTiles() {
    for (const gate of gates) {
        if (gate.tile.collected) continue;
        const tx = gate.x + GATE_WIDTH / 2;
        ctx.fillStyle = tileColor(gate.tile.value);
        ctx.beginPath();
        ctx.arc(tx, gate.tile.y, TILE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#776e65';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(gate.tile.value, tx, gate.tile.y + 1);
    }
}

function drawTrail() {
    for (const t of trail) {
        ctx.fillStyle = tileColor(t.value);
        ctx.beginPath();
        ctx.arc(t.x, t.y, TILE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#776e65';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.value, t.x, t.y + 1);
    }
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    const angle = Math.max(-0.5, Math.min(0.9, bird.vy * 0.05));
    ctx.rotate(angle);

    ctx.fillStyle = '#eee4da';
    ctx.strokeStyle = '#bbada0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#776e65';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bird.value, 0, 1);

    ctx.restore();
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(238, 228, 218, 0.85)';
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
    ctx.fillStyle = '#776e65';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('crashed - click to reply', canvas.width / 2, canvas.height / 2);
}

function drawLEDStrip(){
    for(let i = 0; i < LED_COUNT; i++){
        const t = i / LED_COUNT;
        const pos = ledPosition(t);
        const hue = (hueOffset + t * 360) % 360;

        ctx.fillStyle = `hsl(${hue}, 70%, 55%)`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, LED_SIZE, 0, Math.PI * 2);
        ctx.fill();

        if(flashTimer > 0){
            ctx.fillStyle = `rgba(${flashColor}, ${flashTimer})`;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, LED_SIZE, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function draw() {
    drawBackground();
    drawGates();
    drawTiles();
    drawTrail();
    drawBird();
    drawScore();
    if (!running) drawGameOver();
    drawLEDStrip();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop)
}

initParticles();
loop();