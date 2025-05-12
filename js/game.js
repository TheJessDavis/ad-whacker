document.addEventListener('DOMContentLoaded', function() {
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
        this.streak = 0;  // Track consecutive ad whacks

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
        this.scoreElement.textContent = this.score;
        this.timerElement.textContent = this.timeLeft;
        console.log('Game started!');

        // Always clear intervals before setting new ones
        if (this.adInterval) clearInterval(this.adInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        // Start spawning ads more frequently (every 500ms instead of 1000ms)
        this.adInterval = setInterval(() => this.spawnAd(), 500);
        
        // Start timer
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    resetGame() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameActive = false;
        this.streak = 0;
        this.scoreElement.textContent = '0';
        this.timerElement.textContent = '30';
        this.gameArea.innerHTML = '';
        this.activeAds.clear();
        
        if (this.adInterval) clearInterval(this.adInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);
        console.log('Game reset!');
    }

    spawnAd() {
        if (!this.gameActive) return;
        console.log('Spawning ad!');

        // --- Ad style templates ---
        const adStyles = [
            // Classic blue title bar, white content, fake button
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = `${180 + Math.random() * 120}px`;
                ad.style.height = `${100 + Math.random() * 80}px`;

                // Title bar
                const titlebar = document.createElement('div');
                titlebar.className = 'ad-titlebar';
                titlebar.innerHTML = `<span class='ad-icon'>🖥️</span><span class='ad-title'>Advertisement</span>`;
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                titlebar.appendChild(closeBtn);
                ad.appendChild(titlebar);

                // Content
                const content = document.createElement('div');
                content.className = 'ad-content';
                content.innerHTML = `<b>WIN a FREE PRIZE!</b><br>Click below to claim.<br><span class='ad-fake-btn'>Click Here!</span>`;
                ad.appendChild(content);
                return ad;
            },
            // Yellow info bar, blue content, left close button
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = `${200 + Math.random() * 100}px`;
                ad.style.height = `${110 + Math.random() * 60}px`;

                // Title bar
                const titlebar = document.createElement('div');
                titlebar.className = 'ad-titlebar gray';
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                titlebar.appendChild(closeBtn);
                const title = document.createElement('span');
                title.className = 'ad-title';
                title.textContent = 'Special Offer!';
                titlebar.appendChild(title);
                ad.appendChild(titlebar);

                // Content
                const content = document.createElement('div');
                content.className = 'ad-content yellow';
                content.innerHTML = `Upgrade now and save 70%!<br><span class='ad-fake-btn'>Upgrade</span>`;
                ad.appendChild(content);
                return ad;
            },
            // Green info bar, blue content, emoji icon
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = `${170 + Math.random() * 120}px`;
                ad.style.height = `${100 + Math.random() * 70}px`;

                // Title bar
                const titlebar = document.createElement('div');
                titlebar.className = 'ad-titlebar';
                titlebar.innerHTML = `<span class='ad-icon'>💾</span><span class='ad-title'>Internet Explorer</span>`;
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                titlebar.appendChild(closeBtn);
                ad.appendChild(titlebar);

                // Content
                const content = document.createElement('div');
                content.className = 'ad-content blue';
                content.innerHTML = `You are the <b>1,000,000th</b> visitor!<br><span class='ad-fake-btn'>Claim Prize</span>`;
                ad.appendChild(content);
                return ad;
            },
            // Simple white with green border, big text
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = `${160 + Math.random() * 100}px`;
                ad.style.height = `${90 + Math.random() * 60}px`;

                // Title bar
                const titlebar = document.createElement('div');
                titlebar.className = 'ad-titlebar gray';
                titlebar.innerHTML = `<span class='ad-title'>System Alert</span>`;
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                titlebar.appendChild(closeBtn);
                ad.appendChild(titlebar);

                // Content
                const content = document.createElement('div');
                content.className = 'ad-content green';
                content.innerHTML = `<b>Virus Detected!</b><br>Scan now.<br><span class='ad-fake-btn'>Scan</span>`;
                ad.appendChild(content);
                return ad;
            }
        ];

        // Pick a random ad style
        const ad = adStyles[Math.floor(Math.random() * adStyles.length)]();

        // Random position within game area
        const maxX = this.gameArea.clientWidth - ad.offsetWidth;
        const maxY = this.gameArea.clientHeight - ad.offsetHeight;
        ad.style.left = `${Math.random() * maxX}px`;
        ad.style.top = `${Math.random() * maxY}px`;

        // Make the entire ad clickable (except the close button)
        ad.addEventListener('click', (e) => {
            if (e.target === ad || e.target.classList.contains('ad-content') || e.target.classList.contains('ad-fake-btn')) {
                this.closeAd(ad);
            }
        });

        this.gameArea.appendChild(ad);
        this.activeAds.add(ad);

        // Random disappearance time between 1 and 4 seconds
        const disappearTime = Math.random() * 3000 + 1000; // Random time between 1-4 seconds
        setTimeout(() => {
            if (this.activeAds.has(ad)) {
                this.disappearAd(ad);
            }
        }, disappearTime);
    }

    disappearAd(ad) {
        if (this.activeAds.has(ad)) {
            ad.classList.add('disappearing');
            // Reset streak when ad disappears without being clicked
            this.streak = 0;
            // Remove the ad after the animation completes
            setTimeout(() => {
                if (this.activeAds.has(ad)) {
                    this.activeAds.delete(ad);
                    ad.remove();
                }
            }, 500); // Match this with the CSS animation duration
        }
    }

    closeAd(ad) {
        if (this.activeAds.has(ad)) {
            this.activeAds.delete(ad);
            ad.remove();
            
            // Update streak and score
            this.streak++;
            let points = 1; // Base point for whacking an ad
            
            // Check for streak bonus
            if (this.streak >= 10) {
                points += 1; // Extra point for 10+ streak
                this.showStreakBonus();
            }
            
            this.score += points;
            this.scoreElement.textContent = this.score;
            console.log('Ad closed! Score:', this.score, 'Streak:', this.streak);
        }
    }

    showStreakBonus() {
        const bonus = document.createElement('div');
        bonus.className = 'streak-bonus';
        bonus.textContent = '+1 STREAK BONUS!';
        bonus.style.position = 'absolute';
        bonus.style.top = '50%';
        bonus.style.left = '50%';
        bonus.style.transform = 'translate(-50%, -50%)';
        bonus.style.color = '#ff0';
        bonus.style.fontSize = '24px';
        bonus.style.textShadow = '2px 2px #f00';
        bonus.style.animation = 'bonus-pop 0.5s ease-out forwards';
        this.gameArea.appendChild(bonus);
        
        // Remove the bonus message after animation
        setTimeout(() => bonus.remove(), 500);
    }

    updateTimer() {
        this.timeLeft--;
        this.timerElement.textContent = this.timeLeft;
        console.log('Timer:', this.timeLeft);

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
        console.log('Game over! Final Score:', this.score);
    }
}

// Initialize the game
const game = new AdWhacker();
}); 