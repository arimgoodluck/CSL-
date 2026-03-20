// ==================== GLOBAL VARIABLES ====================
let matched = 0;
let cardOne, cardTwo;
let disableDeck = false;
let cards = [];
let gameActive = false; // true when cards are interactable
let animationInProgress = false;
let totalPairs;

// State for intro sequence
let introStep = 0; // 0: initial (blank), 1: face down shown, 2: cards placed

// Audio objects
const coinSound = new Audio('sounds/135936__bradwesson__collectcoin.wav');
const shuffleSound = new Audio('sounds/423767__someonecool15__card-shuffling.mp3');
const correctSound = new Audio('sounds/131662__bertrof__game-sound-correct_v2.wav');
const levelUpSound = new Audio('sounds/442943__qubodup__level-up.wav');

// Preload sounds
[coinSound, shuffleSound, correctSound, levelUpSound].forEach(s => s.load());

// Suit color mapping
const suitColors = {
    spades: 'black',
    clubs: 'black',
    hearts: '#D2202F',
    diamonds: '#D2202F'
};

// ==================== INITIALIZATION ====================
window.onload = function() {
    // UPDATED: Dynamically generate the storage key based on the current level
    const storageKey = 'memoryLevel' + levelConfig.level + 'Score';
    
    // Load specific memory score from localStorage
    let saved = localStorage.getItem(storageKey);
    if (saved) document.getElementById('memoryScore').textContent = saved;
    else document.getElementById('memoryScore').textContent = '0';

    // Set up rematch button
    document.getElementById('rematchBtn').addEventListener('click', rematch);

    // Attach the global click handler for intro
    document.addEventListener('click', handleGlobalClick);
};

// ==================== AUDIO UNLOCK ====================
let audioUnlocked = false;
function unlockAudio() {
    if (audioUnlocked) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        const audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
                const buffer = audioCtx.createBuffer(1, 1, 22050);
                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(audioCtx.destination);
                source.start(0);
                audioUnlocked = true;
            });
        } else {
            audioUnlocked = true;
        }
    } else {
        const silent = new Audio('data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVgAAABhbmFY');
        silent.play().then(() => audioUnlocked = true).catch(() => {});
    }
}

// ==================== GLOBAL CLICK HANDLER FOR INTRO ====================
function handleGlobalClick(e) {
    // Ignore clicks if game is already active or animation in progress
    if (gameActive || animationInProgress) return;

    // Ignore clicks on the rematch button (it has its own handler)
    if (e.target.closest('#rematchBtn')) return;

    // Step 0: first click anywhere -> show face down
    if (introStep === 0) {
        unlockAudio(); // unlock audio on first interaction
        document.getElementById('faceDownCenter').classList.add('show');
        introStep = 1;
        console.log('Step 1: Face down shown');
    }
    // Step 1: second click -> start card animation
    else if (introStep === 1) {
        introStep = 2;
        console.log('Step 2: Starting card placement');
        // Play shuffle sound twice
        if (audioUnlocked) {
            shuffleSound.currentTime = 0;
            shuffleSound.play().catch(e => console.log('Shuffle sound error:', e));
            setTimeout(() => {
                shuffleSound.currentTime = 0;
                shuffleSound.play().catch(e => {});
            }, 500);
        }
        // Create cards and animate
        createCards();
        animateCardsFromCenter();

        // Remove global click handler after intro completes
        document.removeEventListener('click', handleGlobalClick);
    }
}

// ==================== CREATE CARDS ====================
function createCards() {
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';
    cards = [];
    matched = 0;
    totalPairs = levelConfig.totalCards / 2;

    // Generate pairs of numbers
    let numbers = [];
    for (let i = 1; i <= levelConfig.maxNumber; i++) {
        numbers.push(i, i);
    }
    // Shuffle
    numbers = shuffleArray(numbers);

    for (let i = 0; i < levelConfig.totalCards; i++) {
        const card = document.createElement('div');
        card.className = `card memory-card ${levelConfig.suit}`;
        card.dataset.value = numbers[i];

        // Front face
        const front = document.createElement('div');
        front.className = 'front';
        front.style.backgroundImage = `url('image sources/${levelConfig.suit.charAt(0).toUpperCase() + levelConfig.suit.slice(1)}.png')`;
        front.style.color = suitColors[levelConfig.suit];
        front.textContent = numbers[i];

        // Back face
        const back = document.createElement('div');
        back.className = 'back';

        card.appendChild(front);
        card.appendChild(back);
        card.addEventListener('click', flipCard);

        // Initially hide cards (they will be positioned at center)
        card.style.opacity = '0';
        grid.appendChild(card);
        cards.push(card);
    }
}

// ==================== ANIMATE CARDS FROM CENTER ====================
function animateCardsFromCenter() {
    animationInProgress = true;
    const faceDown = document.getElementById('faceDownCenter');
    const faceDownRect = faceDown.getBoundingClientRect();
    const gameArea = document.getElementById('gameArea');
    const gameAreaRect = gameArea.getBoundingClientRect();

    // Set each card to absolute position at center
    cards.forEach(card => {
        card.style.position = 'absolute';
        card.style.left = (faceDownRect.left - gameAreaRect.left) + 'px';
        card.style.top = (faceDownRect.top - gameAreaRect.top) + 'px';
        card.style.width = faceDownRect.width + 'px';
        card.style.height = faceDownRect.height + 'px';
        card.style.opacity = '1';
        card.style.transition = 'all 0.5s ease';
    });

    // After a tiny delay, start moving to grid positions
    setTimeout(() => {
        const grid = document.getElementById('memoryGrid');
        const gridRect = grid.getBoundingClientRect();
        const cellWidth = 100;
        const cellHeight = 140;
        const gap = 10;

        cards.forEach((card, index) => {
            const col = index % levelConfig.gridCols;
            const row = Math.floor(index / levelConfig.gridCols);
            const targetLeft = gridRect.left + col * (cellWidth + gap) - gameAreaRect.left;
            const targetTop = gridRect.top + row * (cellHeight + gap) - gameAreaRect.top;

            card.style.left = targetLeft + 'px';
            card.style.top = targetTop + 'px';
            card.style.width = cellWidth + 'px';
            card.style.height = cellHeight + 'px';
        });

        // After animation ends, remove absolute positioning
        setTimeout(() => {
            cards.forEach(card => {
                card.style.position = '';
                card.style.left = '';
                card.style.top = '';
                card.style.width = '';
                card.style.height = '';
                card.style.transition = '';
            });
            faceDown.classList.remove('show');
            animationInProgress = false;
            gameActive = true; // Now cards can be flipped
            console.log('Game active');
        }, 500); // match transition duration
    }, 50);
}

// ==================== FLIP CARD ====================
function flipCard(e) {
    if (!gameActive || animationInProgress || disableDeck) return;
    const clickedCard = e.currentTarget;
    if (clickedCard === cardOne) return;

    clickedCard.classList.add('flip');
    if (audioUnlocked) {
        coinSound.currentTime = 0;
        coinSound.play().catch(e => {});
    }

    if (!cardOne) {
        cardOne = clickedCard;
        return;
    }

    cardTwo = clickedCard;
    disableDeck = true;

    const val1 = cardOne.dataset.value;
    const val2 = cardTwo.dataset.value;

    if (val1 === val2) {
        // Match
        if (audioUnlocked) {
            correctSound.currentTime = 0;
            correctSound.play().catch(e => {});
        }
        matched++;
        cardOne.removeEventListener('click', flipCard);
        cardTwo.removeEventListener('click', flipCard);
        cardOne = cardTwo = null;
        disableDeck = false;

        if (matched === totalPairs) {
            if (audioUnlocked) {
                levelUpSound.currentTime = 0;
                levelUpSound.play().catch(e => {});
            }
            
            // UPDATED: Dynamically generate the storage key based on the current level
            const storageKey = 'memoryLevel' + levelConfig.level + 'Score';
            
            // Fetch current score for this specific level, add points, and save
            let currentScore = parseInt(localStorage.getItem(storageKey) || '0');
            currentScore += levelConfig.points;
            localStorage.setItem(storageKey, currentScore);
            
            // Update the score displayed on the page
            document.getElementById('memoryScore').textContent = currentScore;
            
            // Use a slight timeout so the final card flip animation can finish before the alert
            setTimeout(() => {
                alert('Level Complete!');
            }, 100);
        }
    } else {
        // No match: wait 800ms then flip both cards back
        setTimeout(() => {
            cardOne.classList.remove('flip');
            cardTwo.classList.remove('flip');
            cardOne = cardTwo = null;
            disableDeck = false;
        }, 800);
    }
}

// ==================== REMATCH ====================
function rematch() {
    if (animationInProgress) return;
    // Fade out cards
    cards.forEach(card => {
        card.style.transition = 'opacity 0.5s';
        card.style.opacity = '0';
    });
    setTimeout(() => {
        document.getElementById('faceDownCenter').classList.add('show');
        document.getElementById('memoryGrid').innerHTML = '';
        cards = [];
        matched = 0;
        cardOne = cardTwo = null;
        disableDeck = false;
        gameActive = false;
        introStep = 1; // face down is shown, next click will start animation
        // Re-attach global click handler for intro
        document.addEventListener('click', handleGlobalClick);
    }, 500);
}

// ==================== UTILITY ====================
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}