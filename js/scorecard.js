window.onload = function() {
    document.getElementById('additionScore').textContent = localStorage.getItem('additionScore') || 0;
    document.getElementById('subtractionScore').textContent = localStorage.getItem('subtractionScore') || 0;
    document.getElementById('multiplicationScore').textContent = localStorage.getItem('multiplicationScore') || 0;
    document.getElementById('divisionScore').textContent = localStorage.getItem('divisionScore') || 0;
    
    // Fetch individual scores for Memory levels
    document.getElementById('memoryLevel1Score').textContent = localStorage.getItem('memoryLevel1Score') || 0;
    document.getElementById('memoryLevel2Score').textContent = localStorage.getItem('memoryLevel2Score') || 0;
    document.getElementById('memoryLevel3Score').textContent = localStorage.getItem('memoryLevel3Score') || 0;
};

// Function to handle the individual score resets
function resetScore(scoreKey) {
    // Add a confirmation popup to prevent accidental resets
    if (confirm("Are you sure you want to reset this score to 0?")) {
        
        // 1. Set the score back to 0 in the browser's local storage
        localStorage.setItem(scoreKey, 0);
        
        // 2. Update the HTML display on the screen immediately
        document.getElementById(scoreKey).textContent = 0;
    }
}