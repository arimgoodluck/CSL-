// ==================== GLOBAL VARIABLES ====================
let currentScore = 0;
let currentSuitIndex = 0; // 0: hearts, 1: spades, 2: diamonds, 3: clubs
let currentQuestion = null; // { num1, num2, result, missingPos, correctAnswer, suit }
let selectedChoice = null; // { element, number, suit }
let choiceElements = [];
let canSelect = true;
let animationInProgress = false;

// Audio objects
const dealSound = new Audio('sounds/817578__silverdubloons__slidecard03.wav');
const snapSound = new Audio('sounds/361763__lafashion__real-snap-3.wav');
const correctSound = new Audio('sounds/131662__bertrof__game-sound-correct_v2.wav');
const levelUpSound = new Audio('sounds/442943__qubodup__level-up.wav');

// Preload sounds
[dealSound, snapSound, correctSound, levelUpSound].forEach(s => s.load());

// Suit order and colors
const suits = ['hearts', 'spades', 'diamonds', 'clubs'];
const suitColors = {
    hearts: '#D2202F',
    spades: 'black',
    diamonds: '#D2202F',
    clubs: 'black'
};

// Audio unlock flag
let audioUnlocked = false;

// ==================== INITIALIZATION ====================
window.onload = function() {
    // Load score from localStorage
    let saved = localStorage.getItem(operation + 'Score');
    if (saved) currentScore = parseInt(saved);
    updateScoreDisplay();

    // Set up event listeners
    document.getElementById('checkBtn').addEventListener('click', checkAnswer);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);

    // First level
    generateNewQuestion();

    // Unlock audio on first user interaction using Web Audio API
    document.body.addEventListener('click', unlockAudio, { once: true });
    document.body.addEventListener('touchstart', unlockAudio, { once: true });
};

// Reliable audio unlock using Web Audio API
function unlockAudio() {
    if (audioUnlocked) return;
    // Create a silent AudioContext and play a buffer
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        const audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
                // Create a short silent buffer
                const buffer = audioCtx.createBuffer(1, 1, 22050);
                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(audioCtx.destination);
                source.start(0);
                audioUnlocked = true;
                // Now play the deal sound three times
                playDealSoundThreeTimes();
            });
        } else {
            audioUnlocked = true;
            playDealSoundThreeTimes();
        }
    } else {
        // Fallback: try to play a silent audio element
        const silent = new Audio('data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVgAAABhbmFY');
        silent.play().then(() => {
            audioUnlocked = true;
            playDealSoundThreeTimes();
        }).catch(() => {});
    }
}

// ==================== SOUND HELPERS ====================
function playDealSoundThreeTimes() {
    if (!audioUnlocked) return;
    let count = 0;
    function play() {
        if (count < 4) {
            dealSound.currentTime = 0;
            dealSound.play().catch(e => console.log('Deal sound error:', e));
            count++;
            setTimeout(play, 300);
        }
    }
    play();
}

// ==================== SCORE ====================
function updateScoreDisplay() {
    document.getElementById('scoreDisplay').textContent = currentScore;
    localStorage.setItem(operation + 'Score', currentScore);
}

// ==================== QUESTION GENERATION ====================
function generateNewQuestion() {
    let suit = suits[currentSuitIndex % suits.length];
    currentSuitIndex++;

    let eq = generateEquation();
    currentQuestion = {
        num1: eq.num1,
        num2: eq.num2,
        result: eq.result,
        missingPos: eq.missingPos,
        correctAnswer: eq.missingValue,
        suit: suit
    };

    buildEquationDisplay();
    generateChoices(eq.missingValue, suit);

    selectedChoice = null;
    canSelect = true;
    document.getElementById('message').textContent = '';
    document.getElementById('checkBtn').disabled = false;
    document.getElementById('nextBtn').style.display = 'none';
    document.querySelectorAll('.choice-card').forEach(c => c.classList.remove('hidden'));
}

function generateEquation() {
    let num1, num2, result, missingPos, missingValue;
    const max = 100;

    switch (operation) {
        case 'addition':
            num1 = Math.floor(Math.random() * (max + 1));
            num2 = Math.floor(Math.random() * (max + 1 - num1));
            result = num1 + num2;
            missingPos = Math.floor(Math.random() * 3);
            if (missingPos === 0) {
                missingValue = num1;
                num1 = '?';
            } else if (missingPos === 1) {
                missingValue = num2;
                num2 = '?';
            } else {
                missingValue = result;
                result = '?';
            }
            return { num1, num2, result, missingPos, missingValue };

        case 'subtraction':
            num1 = Math.floor(Math.random() * (max + 1));
            num2 = Math.floor(Math.random() * (num1 + 1));
            result = num1 - num2;
            missingPos = Math.floor(Math.random() * 3);
            if (missingPos === 0) {
                missingValue = num1;
                num1 = '?';
            } else if (missingPos === 1) {
                missingValue = num2;
                num2 = '?';
            } else {
                missingValue = result;
                result = '?';
            }
            return { num1, num2, result, missingPos, missingValue };

        case 'multiplication':
            num1 = Math.floor(Math.random() * 10) + 1;
            let maxFactor = Math.floor(100 / num1);
            num2 = Math.floor(Math.random() * (maxFactor + 1));
            result = num1 * num2;
            missingPos = Math.floor(Math.random() * 3);
            if (missingPos === 0) {
                missingValue = num1;
                num1 = '?';
            } else if (missingPos === 1) {
                missingValue = num2;
                num2 = '?';
            } else {
                missingValue = result;
                result = '?';
            }
            return { num1, num2, result, missingPos, missingValue };

        case 'division':
            let divisor = Math.floor(Math.random() * 9) + 1; // 1-9
            let quotient = Math.floor(Math.random() * (Math.floor(100 / divisor))) + 1;
            let dividend = divisor * quotient;
            missingPos = Math.floor(Math.random() * 3);
            if (missingPos === 0) {
                missingValue = dividend;
                return { num1: '?', num2: divisor, result: quotient, missingPos, missingValue };
            } else if (missingPos === 1) {
                missingValue = divisor;
                return { num1: dividend, num2: '?', result: quotient, missingPos, missingValue };
            } else {
                missingValue = quotient;
                return { num1: dividend, num2: divisor, result: '?', missingPos, missingValue };
            }
        default: return {};
    }
}

function buildEquationDisplay() {
    let q = currentQuestion;
    let area = document.getElementById('equationArea');
    area.innerHTML = '';

    // Create the three cards
    let leftCard = createCardElement(q.num1, q.suit);
    let rightCard = createCardElement(q.num2, q.suit);
    let resultCard = createCardElement(q.result, q.suit);

    // Mark the missing slot with id 'emptySlot'
    if (q.missingPos === 0) leftCard.id = 'emptySlot';
    else if (q.missingPos === 1) rightCard.id = 'emptySlot';
    else resultCard.id = 'emptySlot';

    area.appendChild(leftCard);
    area.appendChild(createOperator());
    area.appendChild(rightCard);
    area.appendChild(createEquals());
    area.appendChild(resultCard);
}

function createOperator() {
    let span = document.createElement('span');
    span.className = 'operator';
    span.textContent = operatorSymbol;
    return span;
}

function createEquals() {
    let span = document.createElement('span');
    span.className = 'operator';
    span.textContent = '=';
    return span;
}

function createCardElement(number, suit) {
    let div = document.createElement('div');
    div.className = `card ${suit}`;
    div.style.backgroundImage = `url('image sources/${suit.charAt(0).toUpperCase() + suit.slice(1)}.png')`;
    div.textContent = number;
    div.style.color = suitColors[suit];
    return div;
}

function generateChoices(correct, suit) {
    let choices = [correct];
    while (choices.length < 4) {
        let offset = Math.floor(Math.random() * 9) - 4;
        let candidate = correct + offset;
        if (candidate >= 0 && candidate <= 100 && !choices.includes(candidate)) {
            choices.push(candidate);
        }
    }
    choices = shuffleArray(choices);

    let area = document.getElementById('choicesArea');
    area.innerHTML = '';
    choiceElements = [];
    choices.forEach(num => {
        let card = document.createElement('div');
        card.className = `choice-card ${suit}`;
        card.style.backgroundImage = `url('image sources/${suit.charAt(0).toUpperCase() + suit.slice(1)}.png')`;
        card.textContent = num;
        card.dataset.number = num;
        card.dataset.suit = suit;
        card.style.color = suitColors[suit];
        card.addEventListener('click', onChoiceClick);
        area.appendChild(card);
        choiceElements.push(card);
    });
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ==================== CHOICE CLICK HANDLER ====================
function onChoiceClick(e) {
    if (!canSelect || animationInProgress || selectedChoice) return;

    let choice = e.currentTarget;
    let number = choice.dataset.number;
    let suit = choice.dataset.suit;

    // Play snap sound immediately (within user gesture)
    if (audioUnlocked) {
        snapSound.currentTime = 0;
        snapSound.play().catch(e => console.log('Snap sound error:', e));
    }

    animateChoiceToEmptySlot(choice, number, suit);
}

function animateChoiceToEmptySlot(choice, number, suit) {
    animationInProgress = true;
    canSelect = false;

    let emptySlot = document.getElementById('emptySlot');
    if (!emptySlot) return;

    let choiceRect = choice.getBoundingClientRect();
    let emptyRect = emptySlot.getBoundingClientRect();
    let gameRect = document.querySelector('.game-container').getBoundingClientRect();

    // Create clone
    let clone = document.createElement('div');
    clone.className = `clone-card ${suit}`;
    clone.style.backgroundImage = choice.style.backgroundImage;
    clone.textContent = number;
    clone.style.color = suitColors[suit];
    clone.style.top = (choiceRect.top - gameRect.top) + 'px';
    clone.style.left = (choiceRect.left - gameRect.left) + 'px';
    clone.style.width = choiceRect.width + 'px';
    clone.style.height = choiceRect.height + 'px';
    document.querySelector('.game-container').appendChild(clone);

    let dx = emptyRect.left - choiceRect.left;
    let dy = emptyRect.top - choiceRect.top;

    setTimeout(() => {
        clone.style.transform = `translate(${dx}px, ${dy}px)`;
    }, 10);

    clone.addEventListener('transitionend', function onEnd() {
        clone.removeEventListener('transitionend', onEnd);
        clone.remove();

        // Update empty slot
        emptySlot.textContent = number;
        emptySlot.style.color = suitColors[suit];
        choice.classList.add('hidden');

        selectedChoice = {
            element: choice,
            number: parseInt(number),
            suit: suit
        };

        animationInProgress = false;
        document.getElementById('checkBtn').disabled = false;
    });
}

// ==================== CHECK ANSWER ====================
function checkAnswer() {
    if (!selectedChoice) {
        document.getElementById('message').textContent = 'Please select a card first.';
        return;
    }

    let correct = currentQuestion.correctAnswer;
    if (selectedChoice.number === correct) {
        // Play correct sound (button click is a user gesture)
        if (audioUnlocked) {
            correctSound.currentTime = 0;
            correctSound.play().catch(e => console.log('Correct sound error:', e));
        }
        currentScore += points;
        updateScoreDisplay();

        document.getElementById('nextBtn').style.display = 'block';
        document.getElementById('checkBtn').disabled = true;
        document.getElementById('message').textContent = 'Correct!';
        canSelect = false;
    } else {
        // Wrong answer
        document.getElementById('message').textContent = 'Sorry, try another one';
        selectedChoice.element.classList.remove('hidden');
        let emptySlot = document.getElementById('emptySlot');
        emptySlot.textContent = '?';
        emptySlot.style.color = suitColors[currentQuestion.suit];
        selectedChoice = null;
        canSelect = true;
    }
}

// ==================== NEXT QUESTION ====================
function nextQuestion() {
    // Play level up sound (button click is a user gesture)
    if (audioUnlocked) {
        levelUpSound.currentTime = 0;
        levelUpSound.play().catch(e => console.log('Level up sound error:', e));
    }

    generateNewQuestion();
    playDealSoundThreeTimes(); // will only play if audioUnlocked
}