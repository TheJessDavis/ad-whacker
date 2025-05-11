// Game logic will go here
console.log('Ad Whacker game initialized');

class AdWhacker {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameActive = false;
        this.adInterval = null;
        this.timerInterval = null;
        this.activeAds = new Set();

        // DOM elements
        this.gameArea = document.getElementById('gameArea');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.startButton = document.getElementById('startButton');

        // Bind event listeners
        this.startButton.addEventListener('click', () => this.startGame());
    }

    startGame() {
        this.resetGame();
        this.gameActive = true;
        this.startButton.style.display = 'none';
        
        // Start spawning ads
        this.adInterval = setInterval(() => this.spawnAd(), 1000);
        
        // Start timer
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    resetGame() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameActive = false;
        this.scoreElement.textContent = '0';
        this.timerElement.textContent = '30';
        this.gameArea.innerHTML = '';
        this.activeAds.clear();
        
        if (this.adInterval) clearInterval(this.adInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    spawnAd() {
        if (!this.gameActive) return;

        const ad = document.createElement('div');
        ad.className = 'ad-popup';
        
        // Random position within game area
        const maxX = this.gameArea.clientWidth - 200;
        const maxY = this.gameArea.clientHeight - 150;
        ad.style.left = `${Math.random() * maxX}px`;
        ad.style.top = `${Math.random() * maxY}px`;

        // Random 90s-style ad content
        const adTemplates = [
            'FREE DIAL-UP INTERNET!',
            'YOU\'VE WON A PRIZE!',
            'CLICK HERE TO WIN!',
            'FREE VIRUS SCAN!',
            'DOWNLOAD NOW!',
            'CONGRATULATIONS!',
            'SPECIAL OFFER!',
            'CLICK FOR FREE GAMES!'
        ];

        const closeButton = document.createElement('div');
        closeButton.className = 'close-button';
        closeButton.textContent = 'X';
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeAd(ad);
        });

        const adContent = document.createElement('div');
        adContent.className = 'ad-content';
        adContent.textContent = adTemplates[Math.floor(Math.random() * adTemplates.length)];

        ad.appendChild(closeButton);
        ad.appendChild(adContent);
        this.gameArea.appendChild(ad);
        this.activeAds.add(ad);

        // Auto-remove ad after 3 seconds if not closed
        setTimeout(() => {
            if (this.activeAds.has(ad)) {
                this.closeAd(ad);
            }
        }, 3000);
    }

    closeAd(ad) {
        if (this.activeAds.has(ad)) {
            this.activeAds.delete(ad);
            ad.remove();
            this.score += 10;
            this.scoreElement.textContent = this.score;
        }
    }

    updateTimer() {
        this.timeLeft--;
        this.timerElement.textContent = this.timeLeft;

        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }

    endGame() {
        this.gameActive = false;
        clearInterval(this.adInterval);
        clearInterval(this.timerInterval);
        
        // Remove all active ads
        this.activeAds.forEach(ad => ad.remove());
        this.activeAds.clear();

        // Show game over message
        const gameOver = document.createElement('div');
        gameOver.style.position = 'absolute';
        gameOver.style.top = '50%';
        gameOver.style.left = '50%';
        gameOver.style.transform = 'translate(-50%, -50%)';
        gameOver.style.color = '#0f0';
        gameOver.style.fontSize = '24px';
        gameOver.style.textAlign = 'center';
        gameOver.innerHTML = `GAME OVER!<br>Final Score: ${this.score}`;
        this.gameArea.appendChild(gameOver);

        // Show start button again
        this.startButton.style.display = 'block';
    }
}

// Initialize the game
const game = new AdWhacker(); 