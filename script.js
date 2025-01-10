class SteakTimer {
    constructor() {
        this.timeLeft = 20 * 60; // 20 minutes in seconds
        this.timerId = null;
        this.isRunning = false;
        this.cows = [];
        
        // Initialize audio as null
        this.intermediateBeep = null;
        this.finalBeep = null;
        
        // Get DOM elements
        this.startStopBtn = document.getElementById('startStop');
        this.resetBtn = document.getElementById('reset');
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.animationContainer = document.querySelector('.animation-container');
        
        // Bind event listeners
        this.startStopBtn.addEventListener('click', () => {
            // Initialize audio on first click
            if (!this.intermediateBeep) {
                this.initializeAudio();
            }
            this.toggleTimer();
        });
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        
        // Initialize speech synthesis with preferred voice
        this.speechSynth = window.speechSynthesis;
        
        // Wait for voices to be loaded
        window.speechSynthesis.onvoiceschanged = () => {
            const voices = this.speechSynth.getVoices();
            // Try to find a male English voice
            const preferredVoice = voices.find(voice => 
                voice.lang.startsWith('en') && voice.name.includes('Male')) || voices[0];
            
            this.flipMessage.voice = preferredVoice;
            this.doneMessage.voice = preferredVoice;
        };
        
        // Create speech messages
        this.flipMessage = new SpeechSynthesisUtterance("Flip the meat, Matt!");
        this.flipMessage.rate = 0.9;  // Slightly slower for clarity
        this.flipMessage.pitch = 1;
        
        this.doneMessage = new SpeechSynthesisUtterance("Your steak is done, Matt!");
        this.doneMessage.rate = 0.9;
        this.doneMessage.pitch = 1;
    }

    createCow() {
        const cow = document.createElement('div');
        cow.className = 'cow';
        cow.textContent = '🐮';
        
        // Start position
        cow.style.left = Math.random() * 90 + 'vw';
        cow.style.top = Math.random() * 90 + 'vh';
        
        // Assign random speed characteristics to each cow
        cow.speedMultiplier = 0.5 + Math.random() * 1.5; // Random speed between 50% and 200% of base speed
        
        this.animationContainer.appendChild(cow);
        this.cows.push(cow);
        
        // Add floating animation with random duration
        cow.style.animation = `float ${2 + Math.random() * 2}s infinite ease-in-out`;
        
        // Start continuous movement
        this.animateCow(cow);
    }

    animateCow(cow) {
        let currentAngle = Math.random() * Math.PI * 2;
        let baseSpeed = (0.25 + Math.random() * 0.25) * 0.5;
        let currentSpeed = baseSpeed * cow.speedMultiplier;
        
        // Give each cow a random spin direction and speed
        const spinDirection = Math.random() > 0.5 ? 1 : -1;
        const spinDuration = 1 + Math.random() * 3;
        cow.style.animation = `spin ${spinDuration}s linear infinite ${spinDirection === 1 ? '' : 'reverse'}`;
        
        const animate = () => {
            if (!this.isRunning) return;

            // Previous animation code...
            currentAngle += (Math.random() - 0.5) * 0.05 * cow.speedMultiplier;
            currentSpeed += (Math.random() - 0.5) * 0.01 * cow.speedMultiplier;
            
            const minSpeed = 0.15 * 0.5 * cow.speedMultiplier;
            const maxSpeed = 0.5 * 0.5 * cow.speedMultiplier;
            currentSpeed = Math.max(minSpeed, Math.min(maxSpeed, currentSpeed));

            let currentX = parseFloat(cow.style.left);
            let currentY = parseFloat(cow.style.top);
            
            let newX = currentX + Math.cos(currentAngle) * currentSpeed;
            let newY = currentY + Math.sin(currentAngle) * currentSpeed;
            
            if (newX < 0 || newX > 90) {
                currentAngle = Math.PI - currentAngle;
                newX = Math.max(0, Math.min(90, newX));
            }
            if (newY < 0 || newY > 90) {
                currentAngle = -currentAngle;
                newY = Math.max(0, Math.min(90, newY));
            }
            
            cow.style.left = `${newX}vw`;
            cow.style.top = `${newY}vh`;
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    makeCowsAngry() {
        this.cows.forEach(cow => {
            cow.classList.add('danger');
            // Store the original spin animation
            const originalSpin = cow.style.animation;
            // Make spin faster when angry
            cow.style.animation = 'spin 0.5s linear infinite';
            setTimeout(() => {
                if (cow.parentNode) {
                    cow.classList.remove('danger');
                    // Restore original spin speed
                    cow.style.animation = originalSpin;
                }
            }, 10000);
        });
    }

    turnCowsIntoSteaks() {
        // Define the text points for "Well Done"
        const text = "WELL DONE";
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Make canvas size more manageable
        canvas.width = 800;
        canvas.height = 400;
        
        // Set up text
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw text
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Get pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const points = [];
        const step = 8; // Sample more frequently
        
        // Sample points where text exists
        for (let y = 0; y < canvas.height; y += step) {
            for (let x = 0; x < canvas.width; x += step) {
                const i = (y * canvas.width + x) * 4;
                if (imageData[i + 3] > 0) { // If pixel is not transparent
                    points.push({
                        x: (x / canvas.width) * 80 + 10, // Add padding
                        y: (y / canvas.height) * 60 + 20  // Add padding
                    });
                }
            }
        }

        // Make sure we have enough points
        while (points.length < this.cows.length) {
            const randomIndex = Math.floor(Math.random() * points.length);
            points.push({...points[randomIndex]});
        }

        // Stop all existing animations
        this.cows.forEach(cow => {
            cow.style.animation = 'none';
            cow.style.transition = 'all 2s ease-in-out';
        });

        // Small delay to ensure transitions are applied
        setTimeout(() => {
            // Animate cows to text positions
            this.cows.forEach((cow, index) => {
                const point = points[index % points.length];
                
                // Remove existing classes and animations
                cow.className = 'cow';
                
                // Update to steak emoji
                cow.textContent = '🥩';
                
                // Position the steak
                cow.style.left = `${point.x}vw`;
                cow.style.top = `${point.y}vh`;
                
                // Add flip animation
                setTimeout(() => {
                    cow.classList.add('animate__animated', 'animate__flip');
                }, index * 50); // Stagger the animations
            });
        }, 100);
    }

    toggleTimer() {
        if (this.isRunning) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (!this.isRunning && this.timeLeft > 0) {
            this.isRunning = true;
            this.startStopBtn.textContent = 'Stop';
            this.timerId = setInterval(() => this.tick(), 1000);
            
            // Increase from 15 to 45 cows
            for (let i = 0; i < 45; i++) {
                this.createCow();
            }
        }
    }

    stopTimer() {
        this.isRunning = false;
        this.startStopBtn.textContent = 'Start';
        clearInterval(this.timerId);
        if (this.intermediateBeep) {
            this.intermediateBeep.pause();
            this.intermediateBeep.currentTime = 0;
        }
        if (this.finalBeep) {
            this.finalBeep.pause();
            this.finalBeep.currentTime = 0;
        }
        
        // Remove all cows
        this.cows.forEach(cow => cow.remove());
        this.cows = [];
    }

    resetTimer() {
        this.stopTimer();
        this.timeLeft = 20 * 60;
        this.updateDisplay();
    }

    tick() {
        this.timeLeft--;
        this.updateDisplay();

        // Every 5 minutes (300 seconds)
        if (this.timeLeft > 0 && this.timeLeft % 300 === 0) {
            console.log("5 minute mark reached:", this.timeLeft);
            this.playIntermediateBeep();
            this.makeCowsAngry();
        }

        if (this.timeLeft === 0) {
            console.log("Timer finished");
            this.playFinalBeep();
            this.turnCowsIntoSteaks();
            this.stopTimer();
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    }

    initializeAudio() {
        // Create and load audio elements
        this.intermediateBeep = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        this.finalBeep = new Audio('https://assets.mixkit.co/active_storage/sfx/2865/2865-preview.mp3');
        
        // Enable inline playback for iOS
        this.intermediateBeep.setAttribute('playsinline', '');
        this.finalBeep.setAttribute('playsinline', '');
        
        // Load the audio
        this.intermediateBeep.load();
        this.finalBeep.load();

        // Create a silent audio context for iOS
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        
        // Connect audio elements to the context
        const intermediateSource = audioContext.createMediaElementSource(this.intermediateBeep);
        const finalSource = audioContext.createMediaElementSource(this.finalBeep);
        
        intermediateSource.connect(audioContext.destination);
        finalSource.connect(audioContext.destination);
    }

    playIntermediateBeep() {
        if (!this.intermediateBeep) return;
        
        // Reset the audio before playing
        this.intermediateBeep.currentTime = 0;
        this.intermediateBeep.loop = true;
        
        // Create a promise to handle audio playback
        const playPromise = this.intermediateBeep.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("Intermediate beep started");
                this.speechSynth.speak(this.flipMessage);
                setTimeout(() => {
                    this.intermediateBeep.pause();
                    this.intermediateBeep.currentTime = 0;
                }, 20000);
            }).catch(error => {
                console.log("Playback failed:", error);
            });
        }
    }

    playFinalBeep() {
        if (!this.finalBeep) return;
        
        // Reset the audio before playing
        this.finalBeep.currentTime = 0;
        this.finalBeep.loop = true;
        
        // Create a promise to handle audio playback
        const playPromise = this.finalBeep.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("Final beep started");
                this.speechSynth.speak(this.doneMessage);
                setTimeout(() => {
                    this.finalBeep.pause();
                    this.finalBeep.currentTime = 0;
                }, 30000);
            }).catch(error => {
                console.log("Playback failed:", error);
            });
        }
    }
}

// Initialize the timer when the page loads
window.addEventListener('load', () => {
    const timer = new SteakTimer();
}); 