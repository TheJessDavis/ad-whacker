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
            // 1. Congratulations banner with checklist and starburst
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '350px';
                ad.style.height = '210px';

                // Browser chrome
                const chrome = document.createElement('div');
                chrome.className = 'ad-browser-chrome';
                chrome.innerHTML = `
                    <span class='ad-browser-btn back'></span>
                    <span class='ad-browser-btn fwd'></span>
                    <span class='ad-browser-btn reload'></span>
                    <span class='ad-browser-url'><span class='ad-browser-lock'>🔒</span>http://ads1.revenue.net</span>
                `;
                ad.appendChild(chrome);

                // Big banner
                const congrats = document.createElement('div');
                congrats.className = 'ad-congrats-banner';
                congrats.textContent = 'CONGRATULATIONS!';
                ad.appendChild(congrats);

                // Content
                const content = document.createElement('div');
                content.className = 'ad-content yellow';
                content.innerHTML = `
                    <span style='color:#d60000;font-weight:bold;'>You've been chosen to receive a <span style='color:#222;'>FREE <b>Gateway Desktop Computer!</b></span></span><br>
                    <ul class='ad-checklist'>
                        <li>Intel Pentium 4 Processor 2.66 GHz</li>
                        <li>256MB DDR-SDRAM, 80GB HD, 48x CD-RW</li>
                        <li>19-inch Color CRT Monitor (18-inch viewable)</li>
                    </ul>
                    <span class='ad-starburst'>FREE!</span>
                    <img class='ad-img-wide' src='https://upload.wikimedia.org/wikipedia/commons/4/4c/Gateway_2000_full_system.jpg' alt='Gateway Computer'>
                    <br><a href='#' class='ad-underline'>Click Here to Claim Your FREE* Desktop Computer!</a>
                `;
                ad.appendChild(content);
                return ad;
            },
            // 2. Classic browser window with address bar, banner, and input
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = `${260 + Math.random() * 60}px`;
                ad.style.height = `${180 + Math.random() * 40}px`;

                // Browser chrome
                const chrome = document.createElement('div');
                chrome.className = 'ad-browser-chrome';
                chrome.innerHTML = `
                    <span class='ad-browser-btn back'></span>
                    <span class='ad-browser-btn fwd'></span>
                    <span class='ad-browser-btn reload'></span>
                    <span class='ad-browser-url'><span class='ad-browser-lock'>🔒</span>http://www.travelzoo.com</span>
                `;
                ad.appendChild(chrome);

                // Title bar
                const titlebar = document.createElement('div');
                titlebar.className = 'ad-titlebar';
                titlebar.innerHTML = `<span class='ad-icon'>🌐</span><span class='ad-title'>Travelzoo Top 20</span>`;
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                titlebar.appendChild(closeBtn);
                ad.appendChild(titlebar);

                // Banner
                const banner = document.createElement('div');
                banner.className = 'ad-banner';
                banner.textContent = 'The Top 20 Travel Deals on the Web!';
                ad.appendChild(banner);

                // Content
                const content = document.createElement('div');
                content.className = 'ad-content yellow';
                content.innerHTML = `
                    Specials <span class='ad-bold'>handpicked every week</span> from over 200 sites.<br>
                    <span class='ad-underline'>Interested in Deals Like These?</span><br>
                    <span class='ad-small'>• Europe Sale Round Trip<br>• Count $100s off Hotels</span>
                    <div class='ad-input-row'><input class='ad-fake-input' placeholder='Email'><span class='ad-fake-btn big'>Sign Up</span></div>
                `;
                ad.appendChild(content);
                return ad;
            },
            // 3. Ad with image, blue content, and fake button
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = `${220 + Math.random() * 60}px`;
                ad.style.height = `${150 + Math.random() * 40}px`;

                // Title bar
                const titlebar = document.createElement('div');
                titlebar.className = 'ad-titlebar';
                titlebar.innerHTML = `<span class='ad-icon'>🖼️</span><span class='ad-title'>Surveillance Alert</span>`;
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                titlebar.appendChild(closeBtn);
                ad.appendChild(titlebar);

                // Banner
                const banner = document.createElement('div');
                banner.className = 'ad-banner';
                banner.textContent = 'Make Your Home Safe And Secure';
                ad.appendChild(banner);

                // Image
                const img = document.createElement('img');
                img.className = 'ad-img';
                img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Surveillance_camera.svg/120px-Surveillance_camera.svg.png';
                img.alt = 'Surveillance';
                ad.appendChild(img);

                // Content
                const content = document.createElement('div');
                content.className = 'ad-content blue';
                content.innerHTML = `Broadcasts Live Color Video Directly To Your TV, VCR or PC<br><span class='ad-fake-btn'>Click Here</span>`;
                ad.appendChild(content);
                return ad;
            },
            // 4. System alert with input and two buttons
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = `${200 + Math.random() * 60}px`;
                ad.style.height = `${120 + Math.random() * 40}px`;

                // Title bar
                const titlebar = document.createElement('div');
                titlebar.className = 'ad-titlebar gray';
                titlebar.innerHTML = `<span class='ad-title'>Message Alert</span>`;
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                titlebar.appendChild(closeBtn);
                ad.appendChild(titlebar);

                // Content
                const content = document.createElement('div');
                content.className = 'ad-content';
                content.innerHTML = `You have <span class='ad-bold'>1 message</span> waiting for you.<br><div class='ad-input-row'><input class='ad-fake-input' placeholder='Username'><span class='ad-fake-btn'>OK</span><span class='ad-fake-btn'>Cancel</span></div>`;
                ad.appendChild(content);
                return ad;
            },
            // 5. Classic pop-up with big red text and underline
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = `${180 + Math.random() * 80}px`;
                ad.style.height = `${100 + Math.random() * 60}px`;

                // Title bar
                const titlebar = document.createElement('div');
                titlebar.className = 'ad-titlebar';
                titlebar.innerHTML = `<span class='ad-icon'>⚠️</span><span class='ad-title'>Warning!</span>`;
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                titlebar.appendChild(closeBtn);
                ad.appendChild(titlebar);

                // Content
                const content = document.createElement('div');
                content.className = 'ad-content';
                content.innerHTML = `<span class='ad-underline' style='font-size:16px;'>Are You Paying Too Much?</span><br><span class='ad-small'>Rates are at historic lows!</span><br><span class='ad-fake-btn'>Get Quote</span>`;
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