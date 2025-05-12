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

        // Sound effects
        this.popSound = new Audio('sounds/pop.mp3');
        this.popSound.volume = 1.0; // Set volume to 100%

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

        // --- 20 Unique Ad style templates ---
        const adStyles = [
            // 1. Congratulations banner with checklist and starburst
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '350px';
                ad.style.height = '210px';
                const chrome = document.createElement('div');
                chrome.className = 'ad-browser-chrome';
                chrome.innerHTML = `
                    <span class='ad-browser-btn back'></span>
                    <span class='ad-browser-btn fwd'></span>
                    <span class='ad-browser-btn reload'></span>
                    <span class='ad-browser-url'><span class='ad-browser-lock'>🔒</span>http://ads1.revenue.net</span>
                `;
                ad.appendChild(chrome);
                const congrats = document.createElement('div');
                congrats.className = 'ad-congrats-banner';
                congrats.textContent = 'CONGRATULATIONS!';
                ad.appendChild(congrats);
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
                    <img class='ad-img-wide' src='https://upload.wikimedia.org/wikipedia/commons/4/4c/Gateway_2000_full_system.jpg' alt='Gateway Computer' onerror="this.style.display='none'">
                    <br><a href='#' class='ad-underline'>Click Here to Claim Your FREE* Desktop Computer!</a>
                `;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 2. Blue info bar with yellow button
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '270px';
                ad.style.height = '140px';
                const info = document.createElement('div');
                info.className = 'ad-info-bar';
                info.textContent = 'Before you go, did you know...';
                ad.appendChild(info);
                const content = document.createElement('div');
                content.className = 'ad-content blue';
                content.innerHTML = `You can add <b>AOL</b> for Broadband to any high-speed cable or DSL connection!<br><span class='ad-badge'>GET A FREE TRIAL!</span>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 3. Red sweepstakes with product image
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '260px';
                ad.style.height = '160px';
                const header = document.createElement('div');
                header.className = 'ad-red-header';
                header.textContent = 'Enter to WIN → XEROX';
                ad.appendChild(header);
                const content = document.createElement('div');
                content.className = 'ad-content';
                content.innerHTML = `WIN an $11,000 Business Upgrade Package!<br><img class='ad-img' src='https://upload.wikimedia.org/wikipedia/commons/2/2e/Xerox_Phaser_8400.jpg' alt='Xerox' onerror="this.style.display='none'"><br><span class='ad-fake-btn'>Enter Now</span>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 4. Green/yellow "What's New" browser window
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '300px';
                ad.style.height = '180px';
                const chrome = document.createElement('div');
                chrome.className = 'ad-browser-chrome';
                chrome.innerHTML = `<span class='ad-browser-url'>Netscape What's New</span>`;
                ad.appendChild(chrome);
                const header = document.createElement('div');
                header.className = 'ad-green-header';
                header.textContent = "What's New";
                ad.appendChild(header);
                const content = document.createElement('div');
                content.className = 'ad-content green';
                content.innerHTML = `<ul class='ad-checklist'><li>Science Proves: Drinking Causes...</li><li>Strange Deep Budget Mystery</li><li>Dog Saves Owner from Email</li></ul><span class='ad-fake-btn'>Read More</span>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 5. Orange "Are You Paying Too Much?" banner
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '270px';
                ad.style.height = '140px';
                const banner = document.createElement('div');
                banner.className = 'ad-orange-banner';
                banner.textContent = 'Are You Paying Too Much?';
                ad.appendChild(banner);
                const content = document.createElement('div');
                content.className = 'ad-content';
                content.innerHTML = `<img class='ad-img' src='https://upload.wikimedia.org/wikipedia/commons/6/6b/Dollar_bill_house_2.jpg' alt='Money House' onerror="this.style.display='none'"><br>Rates are at historic lows!<br><span class='ad-fake-btn'>Get Quote</span>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 6. Travel ad with blue header and newsletter signup
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '260px';
                ad.style.height = '150px';
                const info = document.createElement('div');
                info.className = 'ad-info-bar';
                info.textContent = 'Travelzoo Top 20';
                ad.appendChild(info);
                const content = document.createElement('div');
                content.className = 'ad-content yellow';
                content.innerHTML = `The Top 20 Travel Deals on the Web!<br><div class='ad-input-row'><input class='ad-fake-input' placeholder='Email'><span class='ad-fake-btn big'>Sign Up</span></div>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 7. Free test badge ad
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '200px';
                ad.style.height = '110px';
                const badge = document.createElement('div');
                badge.className = 'ad-badge';
                badge.textContent = 'Take this free test!';
                ad.appendChild(badge);
                const content = document.createElement('div');
                content.className = 'ad-content blue';
                content.innerHTML = `Find out your personality type.<br><span class='ad-fake-btn'>Start</span>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 8. Multi-column ad with icons
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '320px';
                ad.style.height = '140px';
                const content = document.createElement('div');
                content.className = 'ad-content';
                content.innerHTML = `<div class='ad-multicol'><div class='ad-col'><span class='ad-icon'>💡</span> Save on bills!<br><span class='ad-icon'>🚗</span> Car insurance</div><div class='ad-col'><span class='ad-icon'>🏠</span> Home loan<br><span class='ad-icon'>💳</span> Credit cards</div></div><span class='ad-fake-btn'>Compare</span>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 9. Red warning with exclamation and fake link
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '220px';
                ad.style.height = '110px';
                const header = document.createElement('div');
                header.className = 'ad-red-header';
                header.textContent = 'WARNING!';
                ad.appendChild(header);
                const content = document.createElement('div');
                content.className = 'ad-content';
                content.innerHTML = `<span class='ad-underline'>Your PC is at risk!</span><br><span class='ad-fake-btn'>Scan Now</span>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 10. Blue info bar with checkmarks
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '250px';
                ad.style.height = '120px';
                const info = document.createElement('div');
                info.className = 'ad-info-bar';
                info.textContent = 'Get 15 Free Guides!';
                ad.appendChild(info);
                const content = document.createElement('div');
                content.className = 'ad-content blue';
                content.innerHTML = `<ul class='ad-checklist'><li>Tax Tips</li><li>Investing</li><li>Retirement</li></ul><span class='ad-fake-btn'>Download</span>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 11. Newsletter pop-up with green header
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '240px';
                ad.style.height = '120px';
                const header = document.createElement('div');
                header.className = 'ad-green-header';
                header.textContent = 'Newsletter Signup';
                ad.appendChild(header);
                const content = document.createElement('div');
                content.className = 'ad-content green';
                content.innerHTML = `Get weekly deals and tips!<br><div class='ad-input-row'><input class='ad-fake-input' placeholder='Email'><span class='ad-fake-btn'>Subscribe</span></div>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 12. Browser window with fake search bar
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '260px';
                ad.style.height = '120px';
                const chrome = document.createElement('div');
                chrome.className = 'ad-browser-chrome';
                chrome.innerHTML = `<span class='ad-browser-url'>http://search.example.com</span>`;
                ad.appendChild(chrome);
                const content = document.createElement('div');
                content.className = 'ad-content';
                content.innerHTML = `<div class='ad-input-row'><input class='ad-fake-input' placeholder='Search'><span class='ad-fake-btn'>Go</span></div><span class='ad-small'>Sponsored Results</span>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 13. Big "FREE!" badge and product image
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '220px';
                ad.style.height = '130px';
                const badge = document.createElement('div');
                badge.className = 'ad-starburst';
                badge.textContent = 'FREE!';
                ad.appendChild(badge);
                const content = document.createElement('div');
                content.className = 'ad-content yellow';
                content.innerHTML = `<img class='ad-img' src='https://upload.wikimedia.org/wikipedia/commons/3/3a/Old_computer_icon.png' alt='Old Computer' onerror="this.style.display='none'"><br>Get your free screensaver!<br><span class='ad-fake-btn'>Download</span>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 14. "Special Offer" with orange banner and two buttons
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '230px';
                ad.style.height = '120px';
                const banner = document.createElement('div');
                banner.className = 'ad-orange-banner';
                banner.textContent = 'Special Offer!';
                ad.appendChild(banner);
                const content = document.createElement('div');
                content.className = 'ad-content';
                content.innerHTML = `Upgrade now and save 70%!<br><span class='ad-fake-btn'>Upgrade</span><span class='ad-fake-btn'>No Thanks</span>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 15. "You've Won!" with big red header and input
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '250px';
                ad.style.height = '120px';
                const header = document.createElement('div');
                header.className = 'ad-red-header';
                header.textContent = "YOU'VE WON!";
                ad.appendChild(header);
                const content = document.createElement('div');
                content.className = 'ad-content yellow';
                content.innerHTML = `Enter your email to claim your prize!<br><div class='ad-input-row'><input class='ad-fake-input' placeholder='Email'><span class='ad-fake-btn'>Claim</span></div>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 16. "Risk-Free" blue info bar with badge
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '220px';
                ad.style.height = '110px';
                const info = document.createElement('div');
                info.className = 'ad-info-bar';
                info.textContent = 'Try 2 Risk-Free Issues!';
                ad.appendChild(info);
                const content = document.createElement('div');
                content.className = 'ad-content blue';
                content.innerHTML = `<span class='ad-badge'>15 Free Guides</span><br>Get your free trial today!`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 17. "Special Internet Offer" with green header and checkmarks
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '250px';
                ad.style.height = '120px';
                const header = document.createElement('div');
                header.className = 'ad-green-header';
                header.textContent = 'Special Internet Offer';
                ad.appendChild(header);
                const content = document.createElement('div');
                content.className = 'ad-content green';
                content.innerHTML = `<ul class='ad-checklist'><li>Unlimited Access</li><li>No Contracts</li><li>24/7 Support</li></ul><span class='ad-fake-btn'>Sign Up</span>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 18. "Newsletter" with multi-column layout
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '320px';
                ad.style.height = '130px';
                const content = document.createElement('div');
                content.className = 'ad-content';
                content.innerHTML = `<div class='ad-multicol'><div class='ad-col'><b>Newsletter</b><br>Get deals weekly!</div><div class='ad-col'><div class='ad-input-row'><input class='ad-fake-input' placeholder='Email'><span class='ad-fake-btn'>Subscribe</span></div></div></div>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 19. "Free Quote" with orange banner and image
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '240px';
                ad.style.height = '120px';
                const banner = document.createElement('div');
                banner.className = 'ad-orange-banner';
                banner.textContent = 'Get a Free Quote!';
                ad.appendChild(banner);
                const content = document.createElement('div');
                content.className = 'ad-content';
                content.innerHTML = `<img class='ad-img' src='https://upload.wikimedia.org/wikipedia/commons/6/6b/Dollar_bill_house_2.jpg' alt='Money House' onerror="this.style.display='none'"><br>See how much you could save!<br><span class='ad-fake-btn'>Get Quote</span>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            },
            // 20. "Special Bonus" with starburst and two buttons
            () => {
                const ad = document.createElement('div');
                ad.className = 'ad-popup';
                ad.style.width = '220px';
                ad.style.height = '110px';
                const badge = document.createElement('div');
                badge.className = 'ad-starburst';
                badge.textContent = 'BONUS!';
                ad.appendChild(badge);
                const content = document.createElement('div');
                content.className = 'ad-content yellow';
                content.innerHTML = `Get a special bonus with your order!<br><span class='ad-fake-btn'>Claim</span><span class='ad-fake-btn'>No Thanks</span>`;
                ad.appendChild(content);
                // Add close button directly to ad
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-button';
                closeBtn.textContent = 'X';
                closeBtn.onclick = (e) => { e.stopPropagation(); this.closeAd(ad); };
                ad.appendChild(closeBtn);
                return ad;
            }
        ];

        // Pick a random ad style
        const ad = adStyles[Math.floor(Math.random() * adStyles.length)]();

        // Random position within game area
        const maxX = Math.max(0, this.gameArea.clientWidth - ad.offsetWidth);
        const maxY = Math.max(0, this.gameArea.clientHeight - ad.offsetHeight);
        const left = Math.floor(Math.random() * (maxX + 1));
        const top = Math.floor(Math.random() * (maxY + 1));
        ad.style.left = `${left}px`;
        ad.style.top = `${top}px`;

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
            // Play pop sound
            this.popSound.currentTime = 0; // Reset sound to start
            this.popSound.play().catch(e => console.log('Sound play failed:', e));
            
            // Use disappearAd for animation, then remove
            this.disappearAd(ad);
            // Score logic only if user closed (not auto-disappear)
            this.streak++;
            let points = 1;
            if (this.streak >= 10) {
                points += 1;
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