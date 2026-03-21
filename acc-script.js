let sentence = [];

function add(word, icon) {
    sentence.push({ word, icon });
    render();
    say(word); // Speaks the single word immediately
}

function render() {
    const list = document.getElementById('sentence-display');
    list.innerHTML = sentence.map(item => `
        <div class="sentence-item">
            <img src="https://api.iconify.design/${item.icon.replace(':','/')}.svg" class="word-img">
            <div>${item.word.toUpperCase()}</div>
        </div>
    `).join('');
}

function speakSentence() {
    if (sentence.length === 0) return;
    const fullText = sentence.map(i => i.word).join(' ');
    say(fullText);
}

function clearSentence() {
    sentence = [];
    render();
}

function say(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 0.8; // Slower, clearer speed
    window.speechSynthesis.speak(msg);
}