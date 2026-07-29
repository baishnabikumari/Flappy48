const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.45;
const FLAP_POWER = -8;
const SCROLL_SPEED = 3;
const GATE_WIDTH = 70;
const GATE_GAP = 170;
const GATE_SPACING = 200;
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

function flap(){
    if(!running){
        resetGame();
        return;
    }
    bird.vy = FLAP_POWER;
}

function resetGame(){
    bird.y = canvas.height / 2;
    bird.vy = 0;
    bird.value = 2;
    gates = [];
    score = 0;
    running = true;
}

window.addEventListener('keydown', (e) => {
    if(e.code === 'Space') flap();
});
canvas.addEventListener('mousedown', flap);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    flap()
});

function spawnGate(){
    const margin = 60;
    const gapY = margin + Math.random() * (canvas.height - margin * 2 - GATE_GAP);
    gates.push({ x: canvas.width + GATE_WIDTH, gapY, passed: false });
}

function hitsGate(gate){
    const withinX = bird.x + bird.radius > gate.x && bird.x - bird.radius < gate.x + GATE_WIDTH;
    if(!withinX) return false;
    const withinGap = bird.y - bird.radius > gate.gapY && bird.y + bird.radius < gate.gapY + GATE_GAP;
    return !withinGap;
}

function update(){
    if(!running) return;

    bird.vy += GRAVITY;
    bird.y += bird.vy;

    bgOffset = (bgOffset + SCROLL_SPEED) % 40;

    if(gates.length === 0 || gates[gates.length - 1].x < canvas.width - GATE_SPACING){
        spawnGate();
    }

    for(const gate of gates){
        gate.x -= SCROLL_SPEED;

        if(!gate.passed && gate.x + GATE_WIDTH < bird.x){
            gate.passed = true;
            score++;
        }
        if(hitsGate(gate)){
            running = false;
        }
    }
    gates = gates.filter(g => g.x + GATE_WIDTH > 0);

    if(bird.y - bird.radius < 0 || bird.y + bird.radius > canvas.height){
        bird.y = Math.max(bird.radius, Math.min(canvas.height - bird.radius, bird.y));
        running = false;
    }
}

function drawBackground(){
    ctx.fillStyle = '#cdc1b4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(238, 228, 218, 0.4)';
    ctx.lineWidth = 1;
    for(let x = -bgOffset; x < canvas.width; x += 40){
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

function drawGates(){
    ctx.fillStyle = '#8f7a66';
    for(const gate of gates){
        ctx.fillRect(gate.x, 0, GATE_WIDTH, gate.gapY);
        ctx.fillRect(gate.x, gate.gapY + GATE_GAP, GATE_WIDTH, canvas.height - gate.gapY - GATE_GAP);
    }
}

function drawScore(){
    ctx.fillStyle = '#776e65';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(score, canvas.width / 2, 50);
}

function drawBird(){
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

function drawGameOver(){
    ctx.fillStyle = 'rgba(238, 228, 218, 0.85)';
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
    ctx.fillStyle = '#776e65';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('crashed - click to reply', canvas.width / 2, canvas.height / 2);
}

function draw(){
    drawBackground();
    drawGates();
    drawBird();
    drawScore();
    if(!running) drawGameOver();
}

function loop(){
    update();
    draw();
    requestAnimationFrame(loop)
}

loop();