const targetArea = document.getElementById('target-area');
const shapeArea = document.getElementById('shape-area');
const scoreDisplay = document.getElementById('score');
const character = document.getElementById('character');
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

let score = 0;
let level = 1;
let soundEnabled = true;
let matchesFound = 0;
let confettiActive = false;

const colors = ['#8da9c4', '#9db4ab', '#bfa89e', '#a3b18a', '#d4a373', '#ccd5ae'];

// Shape SVG Library - This ensures they drag perfectly
const shapeLibrary = {
    circle: '<circle cx="50" cy="50" r="45" />',
    square: '<rect x="10" y="10" width="80" height="80" rx="10" />',
    triangle: '<polygon points="50,10 90,90 10,90" />',
    star: '<polygon points="50,5 63,38 98,38 70,59 78,92 50,72 22,92 30,59 2,38 37,38" />',
    moon: '<path d="M50 20A30 30 0 1 1 50 80A35 35 0 1 0 50 20Z" />',
    rectangle: '<rect x="5" y="25" width="90" height="50" rx="8" />',
    pentagon: '<polygon points="50,5 95,38 78,92 22,92 5,38" />',
    hexagon: '<polygon points="25,5 75,5 100,50 75,95 25,95 0,50" />',
    octagon: '<polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" />',
    diamond: '<polygon points="50,5 95,50 50,95 5,50" />',
    oval: '<ellipse cx="50" cy="50" rx="45" ry="30" />',
    parallelogram: '<polygon points="25,20 100,20 75,80 0,80" />',
    trapezoid: '<polygon points="20,20 80,20 100,80 0,80" />'
};

function speak(text) {
    if (!soundEnabled) return;
    const msg = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Hunt for a clear, high-quality voice
    const naturalVoice = voices.find(v => v.name.includes('Natural') || v.name.includes('Samantha')) || voices[0];
    msg.voice = naturalVoice;
    msg.rate = 1.0; 
    msg.pitch = 1.2; 
    window.speechSynthesis.speak(msg);
}

function startConfetti() {
    confettiActive = true;
    character.classList.add('active');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({length: 40}, () => ({
        x: Math.random() * canvas.width,
        y: -20, r: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random()*colors.length)],
        speed: Math.random() * 2 + 2,
        drift: Math.random() * 2 - 1
    }));
    function render() {
        if (!confettiActive) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.y += p.speed; p.x += p.drift;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
            ctx.fillStyle = p.color; ctx.globalAlpha = 0.5; ctx.fill();
        });
        if (particles.some(p => p.y < canvas.height)) requestAnimationFrame(render);
    }
    render();
}

function createLevel() {
    confettiActive = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    character.classList.remove('active');
    targetArea.innerHTML = '';
    shapeArea.innerHTML = '';
    matchesFound = 0;

    let count = Math.min(level + 1, 5);
    let keys = Object.keys(shapeLibrary).sort(() => 0.5 - Math.random()).slice(0, count);

    keys.forEach(type => {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shapeId = `id-${Math.random()}`;

        // Create Slot
        const slot = document.createElement('div');
        slot.className = `slot`;
        slot.dataset.expected = type;
        slot.style.order = Math.floor(Math.random() * 10);
        
        // Add faint outline of shape to slot
        slot.innerHTML = `<svg viewBox="0 0 100 100" class="shape-svg"><g fill="none" stroke="#5d6d5d" stroke-width="2" opacity="0.2">${shapeLibrary[type]}</g></svg>`;
        targetArea.appendChild(slot);

        // Create Draggable Shape
        const shapeContainer = document.createElement('div');
        shapeContainer.className = 'shape-svg';
        shapeContainer.id = shapeId;
        shapeContainer.draggable = true;
        shapeContainer.dataset.type = type;
        shapeContainer.style.order = Math.floor(Math.random() * 10);
        shapeContainer.innerHTML = `<svg viewBox="0 0 100 100" style="width:100%; height:100%;"><g fill="${color}">${shapeLibrary[type]}</g></svg>`;

        shapeContainer.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text', e.target.id);
            // This is the secret to perfect dragging:
            e.dataTransfer.setDragImage(e.target, 55, 55);
        });
        
        shapeArea.appendChild(shapeContainer);
    });

    setupInteraction();
}

function setupInteraction() {
    const slots = document.querySelectorAll('.slot');
    slots.forEach(slot => {
        slot.addEventListener('dragover', (e) => e.preventDefault());
        slot.addEventListener('drop', (e) => {
            const id = e.dataTransfer.getData('text');
            const el = document.getElementById(id);
            if (el && el.dataset.type === slot.dataset.expected) {
                slot.innerHTML = ''; // Remove the ghost outline
                slot.appendChild(el);
                el.draggable = false;
                matchesFound++;
                score += 10;
                scoreDisplay.textContent = score;
                speak(el.dataset.type);
                if (matchesFound === targetArea.children.length) {
                    level++;
                    startConfetti();
                    setTimeout(createLevel, 4000);
                }
            }
        });
    });
}

document.getElementById('reset-btn').onclick = () => { level = 1; score = 0; scoreDisplay.textContent = '0'; createLevel(); };
document.getElementById('mute-btn').onclick = function() {
    soundEnabled = !soundEnabled;
    this.textContent = soundEnabled ? "Sound: ON" : "Sound: OFF";
};

// Start the game
createLevel();