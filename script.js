const board = document.getElementById('core-board');
const scene = document.getElementById('main-scene');
const itemGrid = document.getElementById('item-grid');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level-num');
const character = document.getElementById('character');
const reviewBtn = document.getElementById('review-btn');

let score = 0;
let level = 1;
let isReviewMode = false;

const coreWords = [
    { word: "I", cat: "social", lvl: 1 }, { word: "WANT", cat: "verb", lvl: 1 }, { word: "GO", cat: "verb", lvl: 1 }, { word: "STOP", cat: "verb", lvl: 1 }, { word: "MORE", cat: "social", lvl: 1 },
    { word: "LIKE", cat: "verb", lvl: 2 }, { word: "IN", cat: "preposition", lvl: 2 }, { word: "OUT", cat: "preposition", lvl: 2 }, { word: "UP", cat: "preposition", lvl: 3 }, { word: "DOWN", cat: "preposition", lvl: 3 },
    { word: "BIG", cat: "adjective", lvl: 4 }, { word: "LITTLE", cat: "adjective", lvl: 4 }, { word: "ON", cat: "preposition", lvl: 3 }, { word: "OFF", cat: "preposition", lvl: 3 }, { word: "HELP", cat: "social", lvl: 5 }
];

const levelThemes = {
    1: { bg: 'var(--bg-lvl1)', items: [{e:'🎡', w:'GO'}, {e:'🛑', w:'STOP'}, {e:'🐦', w:'MORE'}] },
    2: { bg: 'var(--bg-lvl2)', items: [{e:'🍎', w:'LIKE'}, {e:'📦', w:'IN'}, {e:'🚪', w:'OUT'}] },
    3: { bg: 'var(--bg-lvl3)', items: [{e:'🎈', w:'UP'}, {e:'👟', w:'DOWN'}, {e:'💡', w:'ON'}, {e:'🌑', w:'OFF'}] },
    4: { bg: 'var(--bg-lvl4)', items: [{e:'🐘', w:'BIG'}, {e:'🐭', w:'LITTLE'}] },
    5: { bg: 'var(--bg-lvl5)', items: [{e:'🤝', w:'HELP'}] }
};

function speak(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 0.9; msg.pitch = 1.2;
    window.speechSynthesis.speak(msg);
}

function initScene() {
    scene.style.backgroundColor = levelThemes[level].bg;
    itemGrid.innerHTML = '';
    
    let itemsToShow = [];
    if (isReviewMode) {
        // Collect all items from Level 1 up to Current Level
        for (let i = 1; i <= level; i++) {
            itemsToShow = itemsToShow.concat(levelThemes[i].items);
        }
    } else {
        itemsToShow = levelThemes[level].items;
    }

    itemsToShow.forEach(obj => {
        const div = document.createElement('div');
        div.className = 'scene-item';
        div.innerHTML = obj.e;
        div.onclick = () => { 
            speak(obj.w); 
            highlightCell(obj.w);
        };
        itemGrid.appendChild(div);
    });
}

function highlightCell(word) {
    const cell = document.getElementById(`cell-${word}`);
    if (cell) {
        cell.classList.add('highlight');
        setTimeout(() => cell.classList.remove('highlight'), 800);
    }
}

function addPoints(pts) {
    score += pts;
    scoreDisplay.textContent = score;
    if (score >= level * 10 && level < 5) {
        level++;
        levelDisplay.textContent = level;
        levelUpAnimation();
    }
}

function levelUpAnimation() {
    character.classList.add('active');
    speak("Level Up!"); // Removed the "Arianna's new rule" phrase
    setTimeout(() => {
        character.classList.remove('active');
        initBoard();
        initScene();
    }, 2500);
}

function initBoard() {
    board.innerHTML = '';
    coreWords.forEach(item => {
        const div = document.createElement('div');
        const isLocked = item.lvl > level;
        div.className = `aac-cell ${item.cat} ${isLocked ? 'hidden-cell' : ''}`;
        div.id = `cell-${item.word}`;
        if (!isLocked) {
            div.innerHTML = `<span>${item.word}</span>`;
            div.onclick = () => { speak(item.word); highlightCell(item.word); };
        }
        board.appendChild(div);
    });
}

// Review Mode Toggle
reviewBtn.onclick = () => {
    isReviewMode = !isReviewMode;
    reviewBtn.innerText = `Review: ${isReviewMode ? 'ON' : 'OFF'}`;
    initScene();
};

document.getElementById('aide-btn').onclick = () => addPoints(10);
document.getElementById('reset-btn').onclick = () => { score=0; level=1; isReviewMode=false; reviewBtn.innerText="Review: OFF"; levelDisplay.textContent=1; scoreDisplay.textContent=0; initBoard(); initScene(); };

initBoard();
initScene();