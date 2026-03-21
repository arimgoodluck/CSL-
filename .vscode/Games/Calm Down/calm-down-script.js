let timeLeft = 30;
let timerInterval = null;
let currentMode = ""; // Tracks if we are in squeeze or rub mode to avoid repeating speech

function startApp() {
    playSound('start-sound');
    document.getElementById('start-btn').classList.add('hidden');
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateUI();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showFinish();
        }
    }, 1000);
}

function updateUI() {
    document.getElementById('countdown-text').innerText = timeLeft;
    
    // Update Timer Ring
    const ring = document.getElementById('progress-ring');
    const offset = 339.29 - ((timeLeft / 30) * 339.29);
    ring.style.strokeDashoffset = offset;

    // Logic to switch modes and speak
    if (timeLeft % 10 > 5) {
        if (currentMode !== "squeeze") {
            currentMode = "squeeze";
            setMode('squeeze-svg', "Squeeze your hands!");
            speak("Squeeze your hands tight!");
        }
    } else {
        if (currentMode !== "rub") {
            currentMode = "rub";
            setMode('rub-svg', "Rub your legs...");
            speak("Now, rub your legs gently.");
        }
    }
}

// THE SPEECH ENGINE
function speak(text) {
    // Cancel any current speech so it doesn't overlap
    window.speechSynthesis.cancel(); 
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.1; // A slightly friendlier, higher pitch
    window.speechSynthesis.speak(utterance);
}

function setMode(svgId, text) {
    document.getElementById('instruction').innerText = text;
    document.getElementById('squeeze-svg').classList.add('hidden');
    document.getElementById('rub-svg').classList.add('hidden');
    document.getElementById(svgId).classList.remove('hidden');
}

function playSound(id) {
    const audio = document.getElementById(id);
    if(audio) audio.play().catch(() => console.log("User interaction needed for audio"));
}

function showFinish() {
    playSound('finish-sound');
    speak("All done! High five! You are calm and ready.");
    
    document.getElementById('squeeze-svg').classList.add('hidden');
    document.getElementById('rub-svg').classList.add('hidden');
    document.getElementById('done-view').classList.remove('hidden');
    document.getElementById('instruction').innerText = "All Done!";
    document.getElementById('countdown-text').innerText = "🌟";
}