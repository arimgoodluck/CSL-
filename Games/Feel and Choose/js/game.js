/**
 * Enhanced Feel & Choose - Emotional Regulation Game
 * With deselection, confirmation, and "why" options
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== STATE MANAGEMENT =====
    let gameState = {
        currentPhase: 'feel',           // feel, confirm, why, complete
        selectedEmotion: null,
        selectedReasons: [],             // Array to store multiple reasons
        customReasons: [],                // Array for custom text inputs
        sessionData: [],                  // Store all responses for this session
        pointsEarned: 0,
        gameActive: true
    };

    // ===== PRE-DEFINED WHY OPTIONS =====
    // You can easily edit these - add, remove, or modify as needed
    const whyOptions = {
        happy: [
            { text: "I played a game", category: "positive" },
            { text: "I saw a friend", category: "positive" },
            { text: "I got a treat", category: "positive" },
            { text: "It's a sunny day", category: "positive" },
            { text: "I made something", category: "positive" },
            { text: "Someone was nice", category: "positive" },
            { text: "I don't know why", category: "neutral" }
        ],
        sad: [
            { text: "I miss someone", category: "negative" },
            { text: "Something ended", category: "negative" },
            { text: "I feel lonely", category: "negative" },
            { text: "It's raining", category: "neutral" },
            { text: "Someone was mean", category: "negative" },
            { text: "I lost something", category: "negative" },
            { text: "I don't know why", category: "neutral" }
        ],
        mad: [
            { text: "I couldn't do something", category: "negative" },
            { text: "Someone took my turn", category: "negative" },
            { text: "It was too loud", category: "negative" },
            { text: "I had to wait", category: "negative" },
            { text: "I didn't understand", category: "neutral" },
            { text: "It's not fair", category: "negative" },
            { text: "I don't know why", category: "neutral" }
        ],
        tired: [
            { text: "I woke up early", category: "physical" },
            { text: "I played a lot", category: "physical" },
            { text: "I didn't sleep well", category: "physical" },
            { text: "It was a long day", category: "physical" },
            { text: "I'm hungry", category: "physical" },
            { text: "Too much noise", category: "negative" },
            { text: "I don't know why", category: "neutral" }
        ],
        calm: [
            { text: "I had quiet time", category: "positive" },
            { text: "I took deep breaths", category: "positive" },
            { text: "Someone helped me", category: "positive" },
            { text: "I had my space", category: "positive" },
            { text: "Everything is okay", category: "positive" },
            { text: "I'm comfortable", category: "positive" },
            { text: "I don't know why", category: "neutral" }
        ],
        worried: [
            { text: "Something new", category: "neutral" },
            { text: "I don't know what's next", category: "negative" },
            { text: "Too many people", category: "negative" },
            { text: "Loud noises", category: "negative" },
            { text: "Change in routine", category: "neutral" },
            { text: "I feel unsure", category: "negative" },
            { text: "I don't know why", category: "neutral" }
        ]
    };

    // ===== DOM ELEMENTS =====
    const elements = {
        // Phase elements
        //phaseSteps: document.querySelectorAll('.phase-step'),
        emotionCards: document.querySelectorAll('.emotion-card'),
        
        // Confirmation phase
        confirmationPhase: document.querySelector('.confirmation-phase'),
        selectedEmotionIcon: document.querySelector('.selected-emotion-icon'),
        selectedEmotionName: document.querySelector('.selected-emotion-name'),
        confirmBtn: document.querySelector('.confirm-btn'),

        // Why phase
        whyPhase: document.querySelector('.why-phase'),
        whyOptionsGrid: document.querySelector('.why-options-grid'),
        customReasonInput: document.getElementById('custom-reason'),
        addReasonBtn: document.querySelector('.add-reason-btn'),
        backToConfirmBtn: document.querySelector('.back-to-confirm-btn'),
        completeBtn: document.querySelector('.complete-btn'),
        
        // Summary phase
        summaryPhase: document.querySelector('.summary-phase'),
        summaryEmotion: document.querySelector('.summary-emotion'),
        summaryReasons: document.querySelector('.summary-reasons'),
        newCheckinBtn: document.querySelector('.new-checkin-btn'),
        storeBtn: document.querySelector('.store-btn'),
        
        // Core words
        wordBtns: document.querySelectorAll('.word-btn'),
        
        // Storage status
        storageStatus: document.querySelector('.storage-status')
    };

    // ===== INITIALIZATION =====
    function initGame() {
        console.log('Enhanced Feel & Choose game initialized');
        attachEventListeners();
        resetToFeelPhase();
    }

    // ===== EVENT LISTENERS =====
    function attachEventListeners() {
        // Emotion card clicks (with deselection)
        elements.emotionCards.forEach(card => {
            card.addEventListener('click', function(e) {
                handleEmotionClick(this);
            });
            
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleEmotionClick(this);
                }
            });
        });

        // Confirmation buttons 
        if (elements.confirmBtn) {
            elements.confirmBtn.addEventListener('click', () => moveToPhase('why'));
        }
        
        // Why phase navigation
        if (elements.backToConfirmBtn) {
            elements.backToConfirmBtn.addEventListener('click', () => moveToPhase('confirm'));
        }
        
        if (elements.completeBtn) {
            elements.completeBtn.addEventListener('click', completeCheckin);
        }

        // Custom reason input
        if (elements.addReasonBtn) {
            elements.addReasonBtn.addEventListener('click', addCustomReason);
        }
        
        if (elements.customReasonInput) {
            elements.customReasonInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addCustomReason();
                }
            });
        }

        // Summary actions
        if (elements.newCheckinBtn) {
            elements.newCheckinBtn.addEventListener('click', resetToFeelPhase);
        }
        
        if (elements.storeBtn) {
            elements.storeBtn.addEventListener('click', goToStore);
        }

        // Skip/Exit buttons (existing)
        const skipBtn = document.querySelector('.skip-btn');
        const exitBtn = document.querySelector('.exit-btn');
        
        if (skipBtn) skipBtn.addEventListener('click', handleSkip);
        if (exitBtn) exitBtn.addEventListener('click', handleExit);
        
        // Core word buttons (existing)
        elements.wordBtns.forEach(btn => {
            btn.addEventListener('click', () => handleWordClick(btn));
        });
    }

    // ===== EMOTION HANDLING WITH DESELECTION =====
    function handleEmotionClick(card) {
        if (!gameState.gameActive) return;
        
        const emotion = card.dataset.emotion;
        
        // Check if this card is already selected
        if (card.classList.contains('selected')) {
            // DESELECT: If clicking the same emotion, just deselect it
            deselectEmotion();
            
            // Stay in feel phase
            moveToPhase('feel');
        } else {
            // Remove selected class from all cards
            elements.emotionCards.forEach(c => c.classList.remove('selected'));
            
            // Add selected class to clicked card
            card.classList.add('selected');
            
            // Update state
            gameState.selectedEmotion = emotion;
            
            // Visual feedback
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 200);
            
            // Instead of automatically moving to confirm, show the confirm buttons
            // but keep the emotion visible
            showConfirmOptions(emotion);
        }
    }

    function deselectEmotion() {
        // Remove selected class from all cards
        elements.emotionCards.forEach(c => c.classList.remove('selected'));
        
        // Clear state
        gameState.selectedEmotion = null;
        
        // Hide confirmation phase
        if (elements.confirmationPhase) {
            elements.confirmationPhase.style.display = 'none';
        }
        
        // Reset phase indicator to feel
        updatePhaseIndicator('feel');
        
        // Show feedback
        showTempMessage('Emotion deselected', 2000);
    }

    function showConfirmOptions(emotion) {
        // Update the confirmation display
        updateConfirmationDisplay(emotion);
        
        // Show the confirmation phase
        if (elements.confirmationPhase) {
            elements.confirmationPhase.style.display = 'block';
        }
        
    }

    // ===== PHASE MANAGEMENT =====
    function moveToPhase(phase) {
        gameState.currentPhase = phase;
        
        // Hide all phases
        if (elements.confirmationPhase) elements.confirmationPhase.style.display = 'none';
        if (elements.whyPhase) elements.whyPhase.style.display = 'none';
        if (elements.summaryPhase) elements.summaryPhase.style.display = 'none';
        
        // Show relevant phase
        switch(phase) {
            case 'feel':
                // Just show the emotion grid (already visible)
                break;
            case 'confirm':
                if (elements.confirmationPhase) {
                    elements.confirmationPhase.style.display = 'block';
                }
                break;
            case 'why':
                if (elements.whyPhase) {
                    elements.whyPhase.style.display = 'block';
                    populateWhyOptions();

                    if (elements.customReasonInput) {
                    elements.customReasonInput.value = '';
                    }
                }
                break;
            case 'complete':
                if (elements.summaryPhase) {
                    elements.summaryPhase.style.display = 'block';
                }
                break;
        }
    }

    // ===== CONFIRMATION DISPLAY =====
    function updateConfirmationDisplay(emotion) {
        if (!elements.selectedEmotionIcon || !elements.selectedEmotionName) return;
        
        // Get the icon from the selected card
        const selectedCard = document.querySelector(`.emotion-card[data-emotion="${emotion}"]`);
        const icon = selectedCard ? selectedCard.querySelector('.emotion-icon').textContent : '😊';
        
        elements.selectedEmotionIcon.textContent = icon;
        elements.selectedEmotionName.textContent = emotion.charAt(0).toUpperCase() + emotion.slice(1);
    }

    // ===== WHY OPTIONS =====
    function populateWhyOptions() {
        if (!elements.whyOptionsGrid || !gameState.selectedEmotion) return;
        
        const options = whyOptions[gameState.selectedEmotion] || whyOptions.happy;
        
        // Clear existing options
        elements.whyOptionsGrid.innerHTML = '';
        
        // Create new options
        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'why-option';
            optionDiv.setAttribute('data-category', option.category);
            optionDiv.setAttribute('data-reason', option.text);
            optionDiv.textContent = option.text;
            
            // Check if already selected
            if (gameState.selectedReasons.includes(option.text)) {
                optionDiv.classList.add('selected');
            }
            
            // Add click handler for multiple selection
            optionDiv.addEventListener('click', () => toggleReason(option.text, optionDiv));
            
            elements.whyOptionsGrid.appendChild(optionDiv);
        });
        
        // Update complete button state
        updateCompleteButton();
    }

    function toggleReason(reason, element) {
        const index = gameState.selectedReasons.indexOf(reason);
        
        if (index === -1) {
            // Add reason
            gameState.selectedReasons.push(reason);
            element.classList.add('selected');
            showTempMessage(`Added: ${reason}`, 1500);
        } else {
            // Remove reason
            gameState.selectedReasons.splice(index, 1);
            element.classList.remove('selected');
            showTempMessage(`Removed: ${reason}`, 1500);
        }
        
        // Award points for each reason (but not too many!)
        if (index === -1) {
            awardPoints(2); // 2 points per reason identified
        }
        
        // Update complete button
        updateCompleteButton();
    }

    function addCustomReason() {
        const customText = elements.customReasonInput.value.trim();
        
        if (customText) {
            // Add to selected reasons
            gameState.selectedReasons.push(customText);
            
            // Add to custom reasons array
            gameState.customReasons.push(customText);
            
            // Create a visual tag for custom reason
            const customTag = document.createElement('div');
            customTag.className = 'why-option selected custom-reason';
            customTag.setAttribute('data-reason', customText);
            customTag.textContent = `✏️ ${customText}`;
            
            // Add click handler to remove
            customTag.addEventListener('click', () => {
                const index = gameState.selectedReasons.indexOf(customText);
                if (index > -1) {
                    gameState.selectedReasons.splice(index, 1);
                    customTag.remove();
                    updateCompleteButton();
                }
            });
            
            elements.whyOptionsGrid.appendChild(customTag);
            
            // Clear input
            elements.customReasonInput.value = '';
            
            // Award points for custom reason
            awardPoints(3); // Extra points for expressing in own words
            
            showTempMessage('Thanks for sharing!', 2000);
            updateCompleteButton();
        }
    }

    function updateCompleteButton() {
        if (elements.completeBtn) {
            // Enable if at least one reason selected
            const hasReasons = gameState.selectedReasons.length > 0;
            elements.completeBtn.disabled = !hasReasons;
            
            if (hasReasons) {
                elements.completeBtn.classList.add('ready');
            } else {
                elements.completeBtn.classList.remove('ready');
            }
        }
    }

    // ===== COMPLETE CHECK-IN =====
    function completeCheckin() {
        // Save the session data
        const sessionRecord = {
            timestamp: new Date().toISOString(),
            emotion: gameState.selectedEmotion,
            reasons: [...gameState.selectedReasons],
            customReasons: [...gameState.customReasons],
            pointsEarned: gameState.pointsEarned
        };
        
        // Add to session data
        gameState.sessionData.push(sessionRecord);
        
        // Save to localStorage (persists even after browser close)
        saveToLocalStorage(sessionRecord);
        
        // Update summary display
        updateSummaryDisplay(sessionRecord);
        
        // Move to complete phase
        moveToPhase('complete');
        
        // Show storage confirmation
        showStorageStatus();
        
        console.log('Check-in completed:', sessionRecord);
    }

    // ===== LOCAL STORAGE =====
    function saveToLocalStorage(record) {
        // Get existing data
        let allData = JSON.parse(localStorage.getItem('feelAndChooseData') || '[]');
        
        // Add new record
        allData.push(record);
        
        // Save back to localStorage
        localStorage.setItem('feelAndChooseData', JSON.stringify(allData));
        
        // Also save to session storage (cleared when browser closes)
        sessionStorage.setItem('lastCheckin', JSON.stringify(record));
    }

    function loadFromLocalStorage() {
        const data = localStorage.getItem('feelAndChooseData');
        return data ? JSON.parse(data) : [];
    }

    // ===== SUMMARY DISPLAY =====
    function updateSummaryDisplay(record) {
        if (!elements.summaryEmotion || !elements.summaryReasons) return;
        
        // Display emotion
        elements.summaryEmotion.textContent = record.emotion;
        
        // Display reasons
        const reasonList = record.reasons.map(r => `• ${r}`).join('<br>');
        elements.summaryReasons.innerHTML = reasonList;
        
        // Award completion points
        awardPoints(10, false); // 10 points for completing check-in, don't show individual notification
    }

    // ===== POINT SYSTEM =====
    function awardPoints(points, showNotification = true) {
        gameState.pointsEarned += points;
        
        // Dispatch event for parent website
        const pointEvent = new CustomEvent('gamePointsEarned', {
            detail: {
                game: 'feel-and-choose',
                points: points,
                total: gameState.pointsEarned,
                emotion: gameState.selectedEmotion
            }
        });
        document.dispatchEvent(pointEvent);
        
        if (showNotification) {
            showPointFeedback(points);
        }
    }

    function showPointFeedback(points) {
        const feedback = document.createElement('div');
        feedback.className = 'point-feedback';
        feedback.textContent = `+${points}`;
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: var(--color-calm);
            color: var(--color-text);
            padding: 20px 40px;
            border-radius: 60px;
            font-size: 2rem;
            font-weight: bold;
            animation: pop-in 0.5s ease-out forwards;
            z-index: 1000;
        `;
        document.body.appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 2000);
    }

    // ===== HELPER FUNCTIONS =====
    function showTempMessage(message, duration) {
        const msgDiv = document.createElement('div');
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--color-text);
            color: white;
            padding: 10px 20px;
            border-radius: 40px;
            font-size: 1.1rem;
            animation: slide-up 0.3s ease-out;
            z-index: 1000;
        `;
        document.body.appendChild(msgDiv);
        
        setTimeout(() => msgDiv.remove(), duration);
    }

    function showStorageStatus() {
        if (!elements.storageStatus) return;
        
        elements.storageStatus.style.display = 'block';
        
        setTimeout(() => {
            elements.storageStatus.style.display = 'none';
        }, 3000);
    }

    function resetToFeelPhase() {
        // Reset game state
        gameState = {
            currentPhase: 'feel',
            selectedEmotion: null,
            selectedReasons: [],
            customReasons: [],
            sessionData: gameState.sessionData, // Keep session history
            pointsEarned: gameState.pointsEarned, // Keep points total
            gameActive: true
        };
        
        // Deselect all emotion cards
        elements.emotionCards.forEach(c => c.classList.remove('selected'));
        
        // Move to feel phase
        moveToPhase('feel');
        
        // Clear why options
        if (elements.whyOptionsGrid) {
            elements.whyOptionsGrid.innerHTML = '';
        }
        
        // Clear custom input
        if (elements.customReasonInput) {
            elements.customReasonInput.value = '';
        }
        
        showTempMessage('Ready for a new check-in!', 2000);
    }

    function handleSkip() {
        showTempMessage("That's okay! You can try again anytime.", 3000);
        resetToFeelPhase();
    }

    function handleExit() {
        // Save session data before exiting
        const finalData = {
            sessionEnd: new Date().toISOString(),
            totalPoints: gameState.pointsEarned,
            totalCheckins: gameState.sessionData.length
        };
        
        localStorage.setItem('lastSession', JSON.stringify(finalData));
        
        // Dispatch exit event
        const exitEvent = new CustomEvent('gameExited', {
            detail: finalData
        });
        document.dispatchEvent(exitEvent);
        
        showTempMessage('Saving your progress...', 2000);
        
        // In real implementation, redirect to main menu
        setTimeout(() => {
            console.log('Would redirect to main menu here');
            // window.location.href = '/main-menu';
        }, 2000);
    }

    function goToStore() {
        // Dispatch event to go to store
        const storeEvent = new CustomEvent('goToStore', {
            detail: {
                points: gameState.pointsEarned
            }
        });
        document.dispatchEvent(storeEvent);
        
        showTempMessage('Going to the store!', 2000);
        
        // In real implementation, redirect to store
        // window.location.href = '/store';
    }

    function handleWordClick(btn) {
    const word = btn.textContent;
    showTempMessage(`You said: "${word}"`, 2000);
    
    // If in why phase, add to custom reasons
    if (gameState.currentPhase === 'why' && elements.customReasonInput) {
        // Don't add if the word is "confirm" (prevents accidental adds)
        if (word.toLowerCase() === 'confirm') {
            return; // Do nothing
        }
        
        const currentValue = elements.customReasonInput.value;
        
        // If there's already text, add a space and the new word
        if (currentValue) {
            elements.customReasonInput.value = currentValue + ' ' + word;
        } else {
            // If empty, just add the word (no leading space)
            elements.customReasonInput.value = word;
        }
        
        // Focus the input so user can continue typing
        elements.customReasonInput.focus();
    }
}

    // ===== DATA EXPORT FUNCTION (for admins) =====
    window.exportFeelingsData = function() {
        const data = loadFromLocalStorage();
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `feelings-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        showTempMessage('Data exported!', 3000);
    };

    // Start the game
    initGame();
});