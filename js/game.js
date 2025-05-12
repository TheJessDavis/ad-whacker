document.addEventListener('DOMContentLoaded', function() {
// Game logic will go here
console.log('Ad Whacker game initialized');

// Leaderboard config
const LEADERBOARD_BIN_URL = 'https://api.jsonbin.io/v3/b/665e2e3dacd3cb34a84e7b2d'; // <-- Replace with your own bin later
const LEADERBOARD_BIN_KEY = ''; // If you create a private bin, add your X-Master-Key here

class AdWhacker {
    constructor() {
        console.log('Initializing AdWhacker...');
        this.score = 0;
        this.timeLeft = 30;
        this.gameActive = false;
        this.adInterval = null;
        this.timerInterval = null;
        this.activeAds = new Set();
        this.comboCount = 0;
        this.lastBlockTimestamp = 0;
        this.comboActive = false;
        this.lastBlockedAd = null;
        this.streakCount = 0;
        this.currentSpawnRate = 500; // Base spawn rate in ms
        // Sound effects
        this.popSound = new Audio('sounds/imrcv.wav');
        this.popSound.volume = 1.0;
        // DOM elements
        this.gameArea = document.getElementById('gameArea');
        if (!this.gameArea) {
            console.error('Game area element not found!');
            return;
        }
        this.scoreElement = document.getElementById('score');
        if (!this.scoreElement) {
            console.error('Score element not found by ID!');
            // fallback: try querySelector
            this.scoreElement = document.querySelector('#score');
            console.log('Fallback: scoreElement found?', !!this.scoreElement);
            if (!this.scoreElement) {
                console.error('Score element not found by querySelector either!');
                return;
            }
        }
        console.log('Score element found successfully:', this.scoreElement);
        this.timerElement = document.getElementById('timer');
        if (!this.timerElement) {
            console.error('Timer element not found!');
            return;
        }
        this.startButton = document.getElementById('startButton');
        if (!this.startButton) {
            console.error('Start button not found!');
            return;
        }
        // Bind event listeners
        this.startButton.addEventListener('click', () => this.startGame());
        this.frameBuffer = [];
        this.frameInterval = null;
        
        // Create streak counter
        this.streakCounter = document.createElement('div');
        this.streakCounter.className = 'streak-counter';
        this.streakCounter.style.position = 'absolute';
        this.streakCounter.style.top = '10px';
        this.streakCounter.style.right = '10px';
        this.streakCounter.style.color = '#ffe066';
        this.streakCounter.style.fontSize = '24px';
        this.streakCounter.style.textShadow = '2px 2px #ff00de';
        this.streakCounter.style.display = 'none';
        this.gameArea.appendChild(this.streakCounter);
        
        // Create floppy disc
        this.floppyDisc = document.createElement('div');
        this.floppyDisc.className = 'floppy-disc';
        this.floppyDisc.style.position = 'absolute';
        this.floppyDisc.style.bottom = '10px';
        this.floppyDisc.style.right = '10px';
        this.floppyDisc.style.width = '40px';
        this.floppyDisc.style.height = '40px';
        this.floppyDisc.style.background = '#333';
        this.floppyDisc.style.border = '2px solid #666';
        this.floppyDisc.style.borderRadius = '4px';
        this.floppyDisc.style.display = 'none';
        this.gameArea.appendChild(this.floppyDisc);
        
        // Initialize score display
        this.updateScoreDisplay(0);
        console.log('AdWhacker initialization complete');
    }

    updateScoreDisplay(newScore) {
        if (!this.scoreElement) {
            console.error('Score element not found during score update!');
            return;
        }
        const oldText = this.scoreElement.textContent;
        this.scoreElement.textContent = newScore.toString();
        console.log('Score display updated:', {
            oldText,
            newText: this.scoreElement.textContent,
            newScore,
            element: this.scoreElement,
            elementId: this.scoreElement.id,
            elementParent: this.scoreElement.parentElement
        });
        
        // Force a DOM update
        this.scoreElement.style.display = 'none';
        this.scoreElement.offsetHeight; // Force reflow
        this.scoreElement.style.display = '';
    }

    startGame() {
        console.log('Starting game...');
        if (this.gameActive) {
            console.log('Game already active, resetting first');
            this.resetGame();
        }
        this.gameActive = true;
        console.log('Game state set to active:', this.gameActive);
        this.startButton.style.display = 'none';
        this.updateScoreDisplay(0);
        this.timerElement.textContent = this.timeLeft;
        this.lastBlockTimestamp = 0;
        this.streakCount = 0;
        this.comboActive = false;
        // Start capturing frames for GIF preview
        this.frameBuffer = [];
        if (this.frameInterval) clearInterval(this.frameInterval);
        this.frameInterval = setInterval(() => this.captureFrame(), 200);
        // Always clear intervals before setting new ones
        if (this.adInterval) clearInterval(this.adInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.adInterval = setInterval(() => this.spawnAd(), 500);
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        console.log('Game started successfully, intervals set:', {
            adInterval: !!this.adInterval,
            timerInterval: !!this.timerInterval
        });
    }

    resetGame() {
        console.log('Resetting game...');
        this.score = 0;
        this.timeLeft = 30;
        this.gameActive = false;
        this.comboCount = 0;
        this.comboActive = false;
        this.updateScoreDisplay(0);
        this.timerElement.textContent = '30';
        this.gameArea.innerHTML = '';
        this.activeAds.clear();
        if (this.adInterval) clearInterval(this.adInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);
        console.log('Game reset complete, state:', {
            score: this.score,
            gameActive: this.gameActive,
            activeAds: this.activeAds.size
        });
    }

    spawnAd() {
        if (!this.gameActive) {
            console.log('Game not active, skipping ad spawn');
            return;
        }
        console.log('Spawning ad! Game state:', {
            gameActive: this.gameActive,
            score: this.score,
            activeAds: this.activeAds.size,
            streakCount: this.streakCount
        });

        // Calculate spawn rate based on streak
        let spawnRate = 500; // Base spawn rate in ms
        if (this.streakCount >= 10) {
            // Gradually decrease spawn rate as streak increases
            spawnRate = Math.max(200, 500 - (this.streakCount - 10) * 20);
        }

        // Update the spawn interval if it's different
        if (this.currentSpawnRate !== spawnRate) {
            this.currentSpawnRate = spawnRate;
            clearInterval(this.adInterval);
            this.adInterval = setInterval(() => this.spawnAd(), spawnRate);
            console.log('Updated spawn rate:', spawnRate);
        }

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
        // Temporarily add ad to DOM (hidden) to measure size
        ad.style.visibility = 'hidden';
        this.gameArea.appendChild(ad);
        const adWidth = ad.offsetWidth;
        const adHeight = ad.offsetHeight;
        this.gameArea.removeChild(ad);
        ad.style.visibility = '';
        // Random position within game area, clamped to fit
        const maxX = Math.max(0, this.gameArea.clientWidth - adWidth);
        const maxY = Math.max(0, this.gameArea.clientHeight - adHeight);
        const left = Math.floor(Math.random() * (maxX + 1));
        const top = Math.floor(Math.random() * (maxY + 1));
        ad.style.left = `${left}px`;
        ad.style.top = `${top}px`;
        
        // Bind click handler to the ad
        const clickHandler = (e) => {
            if (!e.target.classList.contains('close-button')) {
                console.log('Ad clicked, calling closeAd');
                this.closeAd(ad);
            }
        };
        ad.addEventListener('click', clickHandler);
        
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
            // Combo break if missed
            this.comboActive = false;
            this.comboCount = 0;
            setTimeout(() => {
                if (this.activeAds.has(ad)) {
                    this.activeAds.delete(ad);
                    ad.remove();
                }
            }, 500);
        }
    }

    closeAd(ad) {
        if (!this.gameActive) {
            console.log('Game not active, ignoring ad close');
            return;
        }
        if (!this.activeAds.has(ad)) {
            console.log('Ad not in active ads set, ignoring close');
            return;
        }
        
        console.log('Closing ad...');
        // Play pop sound
        this.popSound.currentTime = 0;
        this.popSound.play().catch(e => console.log('Sound play failed:', e));
        
        // Get ad position for star trail
        const adRect = ad.getBoundingClientRect();
        const gameRect = this.gameArea.getBoundingClientRect();
        const adCenterX = adRect.left + adRect.width / 2 - gameRect.left;
        const adCenterY = adRect.top + adRect.height / 2 - gameRect.top;
        
        // Remove ad first
        this.disappearAd(ad);
        
        // Combo logic
        const now = performance.now();
        const elapsed = this.lastBlockTimestamp ? now - this.lastBlockTimestamp : 0;
        const window = 1500; // fixed window
        
        // Prevent double-clicks - only if clicking the same ad
        if (elapsed < 50 && this.lastBlockedAd === ad) {
            console.log('Double click prevented on same ad');
            return;
        }
        this.lastBlockedAd = ad;
        
        // Update streak state
        if (!this.comboActive || elapsed > window) {
            this.streakCount = 1;
            this.comboActive = true;
            console.log('New streak started');
        } else {
            this.streakCount++;
            console.log('Streak continued:', this.streakCount);
        }
        this.lastBlockTimestamp = now;
        
        // Update streak counter display
        if (this.streakCount >= 10) {
            this.streakCounter.innerHTML = `${this.streakCount} 🔥`;
            this.streakCounter.style.display = 'block';
            // Show and spin the floppy disc
            this.floppyDisc.style.display = 'block';
            this.floppyDisc.style.animation = 'none';
            this.floppyDisc.offsetHeight; // Force reflow
            this.floppyDisc.style.animation = 'floppy-spin 0.5s ease-out';
        } else {
            this.streakCounter.style.display = 'none';
            this.floppyDisc.style.display = 'none';
        }
        
        // Scoring: +1 per ad, +10 every 10th in a row
        let pointsEarned = 1;
        if (this.streakCount % 10 === 0) {
            pointsEarned += 10;
            this.showComboPopup(adCenterX, adCenterY);
            console.log('Streak bonus! +10 points');
        }
        
        // Update score
        const oldScore = this.score;
        this.score += pointsEarned;
        console.log('Score updated:', {
            oldScore,
            pointsEarned,
            newScore: this.score,
            streakCount: this.streakCount,
            gameActive: this.gameActive
        });
        
        // Update score display
        this.updateScoreDisplay(this.score);
    }

    showComboPopup(x, y) {
        const comboDiv = document.createElement('div');
        comboDiv.className = 'streak-bonus';
        comboDiv.textContent = 'COMBO! +10';
        comboDiv.style.position = 'absolute';
        comboDiv.style.left = `${x}px`;
        comboDiv.style.top = `${y}px`;
        comboDiv.style.transform = 'translate(-50%, -50%)';
        comboDiv.style.color = '#ffe066';
        comboDiv.style.fontSize = '28px';
        comboDiv.style.textShadow = '2px 2px #ff00de, 2px 2px #00e6ff';
        comboDiv.style.animation = 'bonus-pop 0.7s ease-out forwards';
        this.gameArea.appendChild(comboDiv);
        setTimeout(() => comboDiv.remove(), 700);
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
        if (this.frameInterval) clearInterval(this.frameInterval);
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
        // Disabled: leaderboard and GIF preview
        // setTimeout(() => this.generateGifPreview(() => this.showLeaderboardModal()), 1200);
        console.log('Game over! Final Score:', this.score);
    }

    captureFrame() {
        // Capture the game area as a data URL (canvas snapshot)
        const gameArea = this.gameArea;
        html2canvas(gameArea, {width: 800, height: 600, backgroundColor: null, scale: 0.4}).then(canvas => {
            // Downscale to 320x240 for pixel effect
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 320;
            tempCanvas.height = 240;
            const ctx = tempCanvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(canvas, 0, 0, 320, 240);
            this.frameBuffer.push(tempCanvas.toDataURL('image/png'));
            // Keep only last 15 frames (~3 seconds at 5 fps)
            if (this.frameBuffer.length > 15) this.frameBuffer.shift();
        });
    }

    generateGifPreview(callback) {
        const gifPreview = document.getElementById('gifPreview');
        gifPreview.innerHTML = '<span style="color:#ffe066;font-size:18px;">Generating preview...</span>';
        if (!window.gifshot || this.frameBuffer.length === 0) {
            gifPreview.innerHTML = '<span style="color:#f00;">GIF preview unavailable</span>';
            if (callback) callback();
            return;
        }
        gifshot.createGIF({
            images: this.frameBuffer,
            gifWidth: 320,
            gifHeight: 240,
            interval: 0.2,
            numFrames: this.frameBuffer.length,
            sampleInterval: 1,
            background: '#222',
            progressCallback: function() {},
        }, function(obj) {
            if (!obj.error) {
                gifPreview.innerHTML = `<img src="${obj.image}" style="width:320px;height:240px;image-rendering:pixelated;">`;
            } else {
                gifPreview.innerHTML = '<span style="color:#f00;">GIF preview unavailable</span>';
            }
            if (callback) callback();
        });
    }

    // Leaderboard modal logic
    showLeaderboardModal() {
        const modal = document.getElementById('leaderboardModal');
        const closeBtn = document.getElementById('leaderboardClose');
        const tableBody = document.querySelector('#leaderboardTable tbody');
        const initialsForm = document.getElementById('initialsForm');
        const initialsInput = document.getElementById('initialsInput');
        modal.style.display = 'flex';
        closeBtn.onclick = () => { modal.style.display = 'none'; };
        window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
        initialsForm.style.display = 'none';
        initialsInput.value = '';
        // Fetch leaderboard
        fetch(LEADERBOARD_BIN_URL, { headers: LEADERBOARD_BIN_KEY ? { 'X-Master-Key': LEADERBOARD_BIN_KEY } : {} })
          .then(res => res.json())
          .then(data => {
            let scores = data.record || data || [];
            // Add current score if qualifies
            let qualifies = (scores.length < 10) || scores.some(entry => this.score > entry.score);
            // Sort descending
            scores = scores.sort((a, b) => b.score - a.score || new Date(a.date) - new Date(b.date));
            // Show table
            tableBody.innerHTML = '';
            scores.slice(0, 10).forEach((entry, i) => {
              const tr = document.createElement('tr');
              tr.innerHTML = `<td>${i+1}</td><td>${entry.initials}</td><td>${entry.score}</td><td>${entry.date}</td>`;
              tableBody.appendChild(tr);
            });
            // If user qualifies, show initials form
            if (qualifies && this.score > 0) {
              initialsForm.style.display = 'block';
              initialsForm.onsubmit = (e) => {
                e.preventDefault();
                const initials = initialsInput.value.toUpperCase().slice(0,3);
                const date = new Date().toISOString().slice(0,10);
                const newEntry = { initials, score: this.score, date };
                // Add and sort
                scores.push(newEntry);
                scores = scores.sort((a, b) => b.score - a.score || new Date(a.date) - new Date(b.date)).slice(0, 10);
                // Update table
                tableBody.innerHTML = '';
                scores.forEach((entry, i) => {
                  const tr = document.createElement('tr');
                  tr.innerHTML = `<td>${i+1}</td><td>${entry.initials}</td><td>${entry.score}</td><td>${entry.date}</td>`;
                  tableBody.appendChild(tr);
                });
                // Save to bin
                fetch(LEADERBOARD_BIN_URL, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(LEADERBOARD_BIN_KEY ? { 'X-Master-Key': LEADERBOARD_BIN_KEY } : {})
                  },
                  body: JSON.stringify(scores)
                }).then(() => {
                  initialsForm.style.display = 'none';
                });
              };
            }
          });
    }
}

// Initialize the game
const game = new AdWhacker();
}); 