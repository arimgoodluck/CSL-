let plan = [];
let finishedCount = 0;
let originalTotalCount = 0; // Fix for stars
let timerInterval = null;

function getIconUrl(word) {
    const term = word.toLowerCase().trim();
    const iconMap = {
        "art": "mdi:palette", "music": "mdi:music-circle", "snack": "mdi:food-apple",
        "study": "mdi:book-open-variant", "work": "mdi:pencil-box", "play": "mdi:controller-classic",
        "home": "mdi:home-circle", "toilet": "mdi:human-male-female", "shower": "mdi:shower"
    };
    const icon = iconMap[term] || "mdi:star-circle";
    return `https://api.iconify.design/${icon.replace(':','/')}.svg?color=%2300796b`;
}

function say(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

window.onload = () => {
    const saved = localStorage.getItem('asttRoutine');
    if (saved) {
        plan = JSON.parse(saved);
        updateStaging();
    }
};

function addTask() {
    const input = document.getElementById('task-input');
    const name = input.value.trim();
    if (!name) return;

    plan.push({ 
        name: name.toUpperCase(), 
        img: getIconUrl(name), 
        seconds: document.getElementById('task-time').value * 60, 
        id: Date.now() 
    });
    
    localStorage.setItem('asttRoutine', JSON.stringify(plan));
    updateStaging();
    input.value = "";
}

function updateStaging() {
    const stage = document.getElementById('staging-area');
    stage.innerHTML = plan.map(t => `
        <div style="display:inline-block; margin:8px; text-align:center;">
            <img src="${t.img}" style="width:40px;">
            <p style="font-size:10px; margin:0;">${t.name}</p>
        </div>`).join('');
    
    const hasItems = plan.length > 0;
    document.getElementById('lock-btn').classList.toggle('hidden', !hasItems);
    document.getElementById('clear-btn').classList.toggle('hidden', !hasItems);
}

function clearRoutine() {
    plan = [];
    finishedCount = 0;
    localStorage.removeItem('asttRoutine');
    updateStaging();
}

function goLive() {
    // Capture the count right when we start the day
    originalTotalCount = plan.length + finishedCount;
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('child-screen').classList.remove('hidden');
    renderChoices();
    renderStars();
}

function exitToSetup() {
    document.getElementById('child-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
}

function renderChoices() {
    const grid = document.getElementById('options-grid');
    grid.innerHTML = plan.map(t => `
        <div class="choice-card" onclick="selectTask(${t.id})" style="cursor:pointer; background:white; padding:15px; border-radius:20px; border:2px solid #eee; margin-bottom:10px; text-align:center;">
            <img src="${t.img}" style="width:50px;">
            <p style="font-weight:bold; font-size:0.8rem; margin:5px 0 0;">${t.name}</p>
        </div>`).join('');
}

function selectTask(taskId) {
    if (timerInterval) clearInterval(timerInterval);
    const taskIdx = plan.findIndex(t => t.id === taskId);
    const task = plan[taskIdx];
    
    say(`Now it is time for ${task.name}`);
    
    document.getElementById('active-content').innerHTML = `
        <img src="${task.img}" style="width:100px;">
        <h2 style="color:var(--teal);">${task.name}</h2>
    `;
    
    document.getElementById('manual-done').classList.remove('hidden');
    plan.splice(taskIdx, 1);
    localStorage.setItem('asttRoutine', JSON.stringify(plan));
    renderChoices();
    startTimer(task.seconds);
}

function startTimer(seconds) {
    let left = seconds;
    const disp = document.getElementById('timer-display');
    timerInterval = setInterval(() => {
        let m = Math.floor(left / 60);
        let s = left % 60;
        disp.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        if (left-- <= 0) {
            clearInterval(timerInterval);
            completeTask();
        }
    }, 1000);
}

function completeTask() {
    clearInterval(timerInterval);
    finishedCount++;
    renderStars(); // This will now light up the next star
    say("Great job!");
    document.getElementById('manual-done').classList.add('hidden');
    document.getElementById('timer-display').innerText = "00:00";
    document.getElementById('active-content').innerHTML = `<p>Well done! Pick next.</p>`;
    if (plan.length === 0) celebrate();
}

function renderStars() {
    const bar = document.getElementById('star-bar');
    bar.innerHTML = "";
    for (let i = 0; i < originalTotalCount; i++) {
        const star = document.createElement('span');
        star.innerText = "★";
        star.style.fontSize = "2rem";
        star.style.color = i < finishedCount ? "#ffd600" : "#eee";
        bar.appendChild(star);
    }
}

function celebrate() {
    document.getElementById('child-screen').innerHTML = `<div style="padding:60px; text-align:center;"><h1>🌟 ALL DONE! 🌟</h1><button class="main-btn" onclick="clearRoutine(); location.reload();">Reset Day</button></div>`;
}