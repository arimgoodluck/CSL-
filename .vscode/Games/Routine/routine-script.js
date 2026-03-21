const routines = {
    bathroom: [
        { name: "PANTS DOWN", icon: "mdi:arrow-down-bold" },
        { name: "USE TOILET", icon: "mdi:toilet" },
        { name: "WIPE", icon: "mdi:paper-roll" },
        { name: "PANTS UP", icon: "mdi:arrow-up-bold" },
        { name: "FLUSH", icon: "mdi:water-pump" }
    ],
    hands: [
        { name: "WET HANDS", icon: "mdi:water" },
        { name: "USE SOAP", icon: "mdi:soap" },
        { name: "SCRUB", icon: "mdi:hand-wash" },
        { name: "RINSE", icon: "mdi:faucet" },
        { name: "DRY", icon: "mdi:towel" }
    ],
    teeth: [
        { name: "PASTE ON", icon: "mdi:toothbrush-paste" },
        { name: "BRUSH", icon: "mdi:toothbrush" },
        { name: "SPIT", icon: "mdi:mouth" },
        { name: "RINSE", icon: "mdi:cup-water" }
    ],
    shoes: [
        { name: "SOCKS ON", icon: "mdi:socks" },
        { name: "FEET IN", icon: "mdi:shoe-print" },
        { name: "TIE / VELCRO", icon: "mdi:shoe-sneaker" }
    ],
    dressing: [
        { name: "UNDERSHIRT", icon: "mdi:tshirt-crew-outline" },
        { name: "SHIRT", icon: "mdi:tshirt-crew" },
        { name: "PANTS", icon: "mdi:human-male" },
        { name: "SOCKS", icon: "mdi:socks" }
    ],
    mealtime: [
        { name: "SET TABLE", icon: "mdi:table-chair" },
        { name: "SIT DOWN", icon: "mdi:chair-rolling" },
        { name: "EAT", icon: "mdi:silverware-fork-knife" },
        { name: "CLEAR PLATE", icon: "mdi:shimmer" }
    ],
    bag: [
        { name: "FOLDERS", icon: "mdi:folder-outline" },
        { name: "LUNCHBOX", icon: "mdi:food-apple" },
        { name: "WATER", icon: "mdi:water-outline" },
        { name: "ZIP UP", icon: "mdi:bag-personal" }
    ],
    shower: [
        { name: "WATER ON", icon: "mdi:shower-head" },
        { name: "SOAP BODY", icon: "mdi:soap" },
        { name: "WASH HAIR", icon: "mdi:bottle-tonic-plus" },
        { name: "RINSE", icon: "mdi:water-sync" },
        { name: "DRY", icon: "mdi:towel" }
    ],
    greeting: [
        { name: "LOOK", icon: "mdi:eye-check" },
        { name: "WAVE", icon: "mdi:hand-wave" },
        { name: "SAY HI", icon: "mdi:comment-account" }
    ],
    bedtime: [
        { name: "PAJAMAS", icon: "mdi:pajamas" },
        { name: "BRUSH TEETH", icon: "mdi:toothbrush" },
        { name: "STORY", icon: "mdi:book-open-page-variant" },
        { name: "LIGHTS OUT", icon: "mdi:lightbulb-off" }
    ]
};

let currentRoutine = [];
let currentIdx = 0;

function getIcon(name) {
    return `https://api.iconify.design/${name.replace(':','/')}.svg?color=%230277bd`;
}

function say(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 0.85;
    window.speechSynthesis.speak(msg);
}

function startRoutine(key) {
    currentRoutine = routines[key];
    currentIdx = 0;
    document.getElementById('routine-title').innerText = key.toUpperCase();
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('task-screen').classList.remove('hidden');
    document.getElementById('sticker-overlay').classList.add('hidden');
    renderSteps();
    announceStep();
}

function renderSteps() {
    const track = document.getElementById('task-track');
    track.innerHTML = currentRoutine.map((step, i) => `
        <div class="step-card ${i === currentIdx ? 'active' : ''} ${i < currentIdx ? 'completed' : ''}" 
             onclick="clickStep(${i})">
            <img src="${getIcon(step.icon)}">
            <p>${step.name}</p>
        </div>
    `).join('');
}

function clickStep(index) {
    if (index === currentIdx) {
        currentIdx++;
        if (currentIdx < currentRoutine.length) {
            renderSteps();
            announceStep();
        } else {
            // Final step finished
            renderSteps(); // Show all green
            setTimeout(() => {
                document.getElementById('sticker-overlay').classList.remove('hidden');
                say("Fantastic job! You finished the whole routine!");
            }, 500);
        }
    }
}

function announceStep() {
    const step = currentRoutine[currentIdx];
    say("Now, " + step.name.toLowerCase());
}

function showMenu() {
    document.getElementById('task-screen').classList.add('hidden');
    document.getElementById('sticker-overlay').classList.add('hidden');
    document.getElementById('menu-screen').classList.remove('hidden');
}