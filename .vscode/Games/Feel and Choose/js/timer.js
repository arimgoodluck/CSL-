/**
 * Star Timer - Simplified version with just stars
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== STATE =====
    let timerState = {
        totalStars: 5,
        earnedStars: 0,
        currentColor: '#FFD700',
        completionMessage: 'Great job! Task complete! ✨'
    };

    // ===== DOM ELEMENTS =====
    const elements = {
        settingsBtn: document.getElementById('settingsToggle'),
        settingsPanel: document.getElementById('settingsPanel'),
        starsContainer: document.getElementById('starsContainer'),
        flyingStarsContainer: document.getElementById('flyingStarsContainer'),
        nextStarBtn: document.getElementById('nextStarBtn'),
        starsEarned: document.getElementById('starsEarned'),
        totalStars: document.getElementById('totalStars'),
        totalStarsSelect: document.getElementById('totalStarsSelect'),
        colorBtns: document.querySelectorAll('.color-btn'),
        completionMessage: document.getElementById('completionMessage'),
        closeSettings: document.getElementById('closeSettings'),
        popupOverlay: document.getElementById('popupOverlay'),
        popupMessage: document.getElementById('popupMessage'),
        popupStars: document.getElementById('popupStars'),
        popupResetBtn: document.getElementById('popupResetBtn')
    };

    // ===== INIT =====
    function init() {
        updateStarsDisplay();
        attachEventListeners();
        updateButtonState();
    }

    // ===== STAR DISPLAY =====
    function updateStarsDisplay() {
        elements.starsContainer.innerHTML = '';
        
        for (let i = 0; i < timerState.totalStars; i++) {
            if (i < timerState.earnedStars) {
                const starDiv = document.createElement('div');
                starDiv.className = 'star-earned';
                starDiv.style.backgroundColor = timerState.currentColor;
                starDiv.textContent = '⭐';
                elements.starsContainer.appendChild(starDiv);
            } else {
                const placeholderDiv = document.createElement('div');
                placeholderDiv.className = 'star-placeholder';
                elements.starsContainer.appendChild(placeholderDiv);
            }
        }
        
        elements.starsEarned.textContent = timerState.earnedStars;
        elements.totalStars.textContent = timerState.totalStars;
    }

    // ===== FLYING STAR =====
    function flyStarToPosition() {
        const flyingStar = document.createElement('div');
        flyingStar.className = 'flying-star';
        flyingStar.textContent = '⭐';
        flyingStar.style.color = timerState.currentColor;
        flyingStar.style.left = '50%';
        flyingStar.style.bottom = '100px';
        
        // Find next empty slot
        const starSlots = elements.starsContainer.children;
        let targetSlot = null;
        
        for (let i = 0; i < starSlots.length; i++) {
            if (starSlots[i].classList.contains('star-placeholder')) {
                targetSlot = starSlots[i];
                break;
            }
        }
        
        if (targetSlot) {
            const targetRect = targetSlot.getBoundingClientRect();
            const startX = window.innerWidth / 2;
            const startY = window.innerHeight - 150;
            
            flyingStar.style.setProperty('--target-position', 
                `translate(${targetRect.left - startX}px, ${targetRect.top - startY}px)`);
            
            elements.flyingStarsContainer.appendChild(flyingStar);
            
            setTimeout(() => flyingStar.remove(), 800);
        }
    }

    // ===== EARN STAR =====
    function earnStar() {
        if (timerState.earnedStars < timerState.totalStars) {
            flyStarToPosition();
            
            timerState.earnedStars++;
            
            setTimeout(() => {
                updateStarsDisplay();
                updateButtonState();
                
                if (timerState.earnedStars === timerState.totalStars) {
                    showPopup();
                }
            }, 400);
        }
    }

    // ===== BUTTON STATE =====
    function updateButtonState() {
        elements.nextStarBtn.disabled = timerState.earnedStars >= timerState.totalStars;
    }

    // ===== POPUP =====
    function showPopup() {
        elements.popupMessage.textContent = timerState.completionMessage;
        elements.popupStars.textContent = '⭐'.repeat(timerState.totalStars);
        elements.popupOverlay.style.display = 'flex';
    }

    function hidePopup() {
        elements.popupOverlay.style.display = 'none';
    }

    // ===== RESET =====
    function resetTimer() {
        timerState.earnedStars = 0;
        updateStarsDisplay();
        updateButtonState();
        hidePopup();
    }

    // ===== SETTINGS =====
    function toggleSettings() {
        if (elements.settingsPanel.style.display === 'none') {
            elements.settingsPanel.style.display = 'block';
        } else {
            elements.settingsPanel.style.display = 'none';
        }
    }

    function applySettings() {
        // Update total stars
        timerState.totalStars = parseInt(elements.totalStarsSelect.value);
        
        // Update color
        const selectedColor = document.querySelector('.color-btn.selected');
        if (selectedColor) {
            timerState.currentColor = selectedColor.dataset.color;
        }
        
        // Update message
        timerState.completionMessage = elements.completionMessage.value || 'Great job! Task complete! ✨';
        
        // Reset and close settings
        resetTimer();
        elements.settingsPanel.style.display = 'none';
        
        showTempMessage('Settings updated!');
    }

    function selectColor(btn, color) {
        elements.colorBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    }

    // ===== TEMP MESSAGE =====
    function showTempMessage(message) {
        const msg = document.createElement('div');
        msg.textContent = message;
        msg.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--text-color);
            color: white;
            padding: 10px 20px;
            border-radius: 40px;
            z-index: 3000;
        `;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);
    }

    // ===== EVENT LISTENERS =====
    function attachEventListeners() {
        // Main star button
        elements.nextStarBtn.addEventListener('click', earnStar);
        
        // Settings toggle
        elements.settingsBtn.addEventListener('click', toggleSettings);
        elements.closeSettings.addEventListener('click', applySettings);
        
        // Color selection
        elements.colorBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                selectColor(this, this.dataset.color);
            });
        });
        
        // Popup reset
        elements.popupResetBtn.addEventListener('click', () => {
            hidePopup();
            resetTimer();
        });
        
        // Keyboard shortcut (spacebar)
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && !elements.nextStarBtn.disabled) {
                e.preventDefault();
                earnStar();
            }
        });
        
        // Set default selected color
        document.querySelector('.color-btn[data-color="#FFD700"]').classList.add('selected');
    }

    // Start
    init();
});