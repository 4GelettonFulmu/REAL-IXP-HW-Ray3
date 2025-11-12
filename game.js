// Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#2d2d2d',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, ShoeSelectionScene, GameScene, ResultsScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

const game = new Phaser.Game(config);

// Global game state
const gameState = {
    selectedShoe: null,
    totalSteps: 0,
    totalTime: 0,
    fallCount: 0,
    consecutiveFalls: 0,
    soundEnabled: true
};

// ============================================
// BOOT SCENE - Preload and setup
// ============================================
function BootScene() {
    this.scene = null;
}

BootScene.prototype = {
    constructor: BootScene,

    key: 'BootScene',

    preload: function() {
        // Create loading text
        const loadingText = this.add.text(640, 360, 'Loading...', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Generate all required assets
        this.generateAssets();
    },

    create: function() {
        // Generate sounds
        this.generateSounds();

        // Start the shoe selection scene
        this.scene.start('ShoeSelectionScene');
    },

    generateAssets: function() {
        // Generate sneaker sprite
        const sneakerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        sneakerGraphics.fillStyle(0xff3333);
        sneakerGraphics.fillRoundedRect(0, 20, 80, 30, 8);
        sneakerGraphics.fillStyle(0x3333ff);
        sneakerGraphics.fillRoundedRect(0, 0, 60, 25, 8);
        sneakerGraphics.fillStyle(0xffffff);
        sneakerGraphics.fillCircle(25, 12, 8);
        sneakerGraphics.generateTexture('sneaker_icon', 80, 50);
        sneakerGraphics.destroy();

        // Generate high heel sprite
        const heelGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        heelGraphics.fillStyle(0x000000);
        heelGraphics.fillRoundedRect(10, 10, 60, 20, 5);
        heelGraphics.fillStyle(0xff0000);
        heelGraphics.fillTriangle(70, 30, 80, 30, 75, 50);
        heelGraphics.fillStyle(0xaa0000);
        heelGraphics.fillRect(15, 15, 50, 10);
        heelGraphics.generateTexture('heel_icon', 90, 60);
        heelGraphics.destroy();

        // Generate character sprite (simple stick figure style)
        const charGraphics = this.make.graphics({ x: 0, y: 0, add: false });

        // Body
        charGraphics.fillStyle(0x8B4513);
        charGraphics.fillRect(35, 20, 30, 50);

        // Head
        charGraphics.fillStyle(0xFFDBAC);
        charGraphics.fillCircle(50, 15, 15);

        // Arms
        charGraphics.fillStyle(0x8B4513);
        charGraphics.fillRect(25, 30, 10, 35);
        charGraphics.fillRect(65, 30, 10, 35);

        charGraphics.generateTexture('character_base', 100, 120);
        charGraphics.destroy();

        // Generate button background
        const btnGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        btnGraphics.fillStyle(0x4a90e2);
        btnGraphics.fillRoundedRect(0, 0, 200, 60, 10);
        btnGraphics.generateTexture('button_bg', 200, 60);
        btnGraphics.destroy();
    },

    generateSounds: function() {
        // Create simple procedural sounds using Web Audio API
        this.game.sound.sounds = [];
    }
};

Phaser.Scene.call(BootScene.prototype.constructor);
Object.setPrototypeOf(BootScene.prototype, Phaser.Scene.prototype);

// ============================================
// SHOE SELECTION SCENE
// ============================================
function ShoeSelectionScene() {
    this.scene = null;
}

ShoeSelectionScene.prototype = {
    constructor: ShoeSelectionScene,

    key: 'ShoeSelectionScene',

    create: function() {
        // Reset game state
        gameState.selectedShoe = null;
        gameState.totalSteps = 0;
        gameState.totalTime = 0;
        gameState.fallCount = 0;
        gameState.consecutiveFalls = 0;

        // Title
        this.add.text(640, 100, 'Choose Your Shoes', {
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(640, 180, 'Select your footwear for the journey ahead', {
            fontSize: '24px',
            fill: '#cccccc'
        }).setOrigin(0.5);

        // Create shoe selection buttons
        this.createShoeButton('sneakers', 320, 400);
        this.createShoeButton('heels', 960, 400);

        // Start button (initially hidden)
        this.startButton = this.add.container(640, 600);
        const startBg = this.add.rectangle(0, 0, 200, 60, 0x44ff44).setInteractive();
        const startText = this.add.text(0, 0, 'START', {
            fontSize: '28px',
            fill: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.startButton.add([startBg, startText]);
        this.startButton.setAlpha(0);

        startBg.on('pointerdown', () => {
            if (gameState.selectedShoe) {
                this.playClickSound();
                this.scene.start('GameScene');
            }
        });

        startBg.on('pointerover', () => {
            this.startButton.setScale(1.1);
        });

        startBg.on('pointerout', () => {
            this.startButton.setScale(1);
        });
    },

    createShoeButton: function(type, x, y) {
        const container = this.add.container(x, y);

        // Background
        const bg = this.add.rectangle(0, 0, 300, 300, 0x3a3a3a);
        bg.setStrokeStyle(4, 0x666666);

        // Shoe icon
        const iconKey = type === 'sneakers' ? 'sneaker_icon' : 'heel_icon';
        const icon = this.add.image(0, -60, iconKey).setScale(2);

        // Labels
        const title = this.add.text(0, 40, type === 'sneakers' ? 'SNEAKERS' : 'HIGH HEELS', {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const desc1 = this.add.text(0, 80, type === 'sneakers' ? 'Fast & Stable' : 'Elegant but', {
            fontSize: '18px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);

        const desc2 = this.add.text(0, 105, type === 'sneakers' ? 'Walking' : 'Challenging', {
            fontSize: '18px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);

        container.add([bg, icon, title, desc1, desc2]);

        // Make interactive
        bg.setInteractive();

        bg.on('pointerover', () => {
            container.setScale(1.1);
            icon.setScale(2.2);
            bg.setStrokeStyle(4, 0xffff00);
            this.tweens.add({
                targets: icon,
                angle: 360,
                duration: 500,
                ease: 'Power2'
            });
        });

        bg.on('pointerout', () => {
            if (gameState.selectedShoe !== type) {
                container.setScale(1);
                icon.setScale(2);
                bg.setStrokeStyle(4, 0x666666);
            }
        });

        bg.on('pointerdown', () => {
            this.playClickSound();
            gameState.selectedShoe = type;

            // Update all buttons
            this.children.list.forEach(child => {
                if (child.type === 'Container' && child !== this.startButton) {
                    const childBg = child.list[0];
                    if (child === container) {
                        childBg.setStrokeStyle(6, 0x44ff44);
                        child.setScale(1.15);
                    } else {
                        childBg.setStrokeStyle(4, 0x666666);
                        child.setScale(1);
                    }
                }
            });

            // Show start button
            this.tweens.add({
                targets: this.startButton,
                alpha: 1,
                duration: 300,
                ease: 'Power2'
            });
        });
    },

    playClickSound: function() {
        if (!gameState.soundEnabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
};

Phaser.Scene.call(ShoeSelectionScene.prototype.constructor);
Object.setPrototypeOf(ShoeSelectionScene.prototype, Phaser.Scene.prototype);

// ============================================
// MAIN GAME SCENE
// ============================================
function GameScene() {
    this.scene = null;
    this.character = null;
    this.isAnimating = false;
    this.currentFoot = 'left'; // Start with left foot
    this.startTime = 0;
    this.distance = 0;
    this.maxDistance = 1200; // 90% of screen width considering character position
}

GameScene.prototype = {
    constructor: GameScene,

    key: 'GameScene',

    create: function() {
        this.startTime = Date.now();
        this.distance = 0;
        this.currentFoot = 'left';
        this.isAnimating = false;

        // Create alleyway background
        this.createAlleyway();

        // Create character
        this.createCharacter();

        // Create UI
        this.createUI();

        // Input handlers
        this.input.on('pointerdown', this.handleClick, this);

        // Show tutorial
        this.showTutorial();
    },

    createAlleyway: function() {
        const graphics = this.add.graphics();

        // Sky/background
        graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE0F6FF, 0xE0F6FF, 1);
        graphics.fillRect(0, 0, 1280, 400);

        // Ground with perspective
        graphics.fillStyle(0x8B7355);
        graphics.beginPath();
        graphics.moveTo(0, 500);
        graphics.lineTo(1280, 500);
        graphics.lineTo(1280, 720);
        graphics.lineTo(0, 720);
        graphics.closePath();
        graphics.fillPath();

        // Alleyway walls (perspective)
        // Left wall
        graphics.fillStyle(0x6B4423);
        graphics.beginPath();
        graphics.moveTo(0, 300);
        graphics.lineTo(200, 400);
        graphics.lineTo(200, 720);
        graphics.lineTo(0, 720);
        graphics.closePath();
        graphics.fillPath();

        // Right wall
        graphics.fillStyle(0x8B5A3C);
        graphics.beginPath();
        graphics.moveTo(1280, 300);
        graphics.lineTo(1080, 400);
        graphics.lineTo(1080, 720);
        graphics.lineTo(1280, 720);
        graphics.closePath();
        graphics.fillPath();

        // Add some texture lines
        graphics.lineStyle(2, 0x5A3A1A, 0.3);
        for (let i = 0; i < 10; i++) {
            const y = 500 + i * 22;
            graphics.beginPath();
            graphics.moveTo(200, y);
            graphics.lineTo(1080, y);
            graphics.strokePath();
        }

        // Finish line marker
        graphics.fillStyle(0xFFD700);
        graphics.fillRect(1050, 450, 30, 50);
        graphics.fillStyle(0xFFFFFF);
        this.add.text(1065, 470, 'END', {
            fontSize: '16px',
            fill: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAngle(90);
    },

    createCharacter: function() {
        // Character container
        this.character = this.add.container(250, 430);

        // Body parts
        const body = this.add.rectangle(0, 0, 30, 60, 0x8B4513);
        const head = this.add.circle(0, -40, 20, 0xFFDBAC);

        // Legs
        this.leftLeg = this.add.rectangle(-10, 40, 8, 40, 0x4169E1);
        this.rightLeg = this.add.rectangle(10, 40, 8, 40, 0x4169E1);

        // Shoes indicator
        const shoeColor = gameState.selectedShoe === 'sneakers' ? 0xFF3333 : 0x000000;
        this.leftShoe = this.add.rectangle(-10, 65, 12, 8, shoeColor);
        this.rightShoe = this.add.rectangle(10, 65, 12, 8, shoeColor);

        // Arms
        this.leftArm = this.add.rectangle(-20, -10, 8, 35, 0x8B4513);
        this.rightArm = this.add.rectangle(20, -10, 8, 35, 0x8B4513);

        this.character.add([
            body, head,
            this.leftLeg, this.rightLeg,
            this.leftShoe, this.rightShoe,
            this.leftArm, this.rightArm
        ]);
    },

    createUI: function() {
        // Progress bar background
        const progressBg = this.add.rectangle(640, 30, 600, 30, 0x333333);
        progressBg.setStrokeStyle(2, 0x666666);

        // Progress bar fill
        this.progressBar = this.add.rectangle(340, 30, 0, 26, 0x44ff44);

        // Step counter
        this.stepText = this.add.text(100, 80, 'Steps: 0', {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: '#00000088',
            padding: { x: 10, y: 5 }
        });

        // Time counter
        this.timeText = this.add.text(100, 120, 'Time: 0s', {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: '#00000088',
            padding: { x: 10, y: 5 }
        });

        // Fall counter (only for heels)
        if (gameState.selectedShoe === 'heels') {
            this.fallText = this.add.text(100, 160, 'Falls: 0', {
                fontSize: '24px',
                fill: '#ff4444',
                fontStyle: 'bold',
                backgroundColor: '#00000088',
                padding: { x: 10, y: 5 }
            });
        }

        // Restart button
        const restartBtn = this.add.rectangle(1180, 80, 80, 50, 0xff4444).setInteractive();
        const restartText = this.add.text(1180, 80, 'RESTART', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        restartBtn.on('pointerdown', () => {
            this.playClickSound();
            this.scene.restart();
        });

        restartBtn.on('pointerover', () => {
            restartBtn.setScale(1.1);
            restartText.setScale(1.1);
        });

        restartBtn.on('pointerout', () => {
            restartBtn.setScale(1);
            restartText.setScale(1);
        });

        // Sound toggle
        const soundBtn = this.add.rectangle(1180, 140, 80, 50, gameState.soundEnabled ? 0x44ff44 : 0x666666).setInteractive();
        this.soundText = this.add.text(1180, 140, gameState.soundEnabled ? 'SOUND\nON' : 'SOUND\nOFF', {
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        soundBtn.on('pointerdown', () => {
            gameState.soundEnabled = !gameState.soundEnabled;
            soundBtn.setFillStyle(gameState.soundEnabled ? 0x44ff44 : 0x666666);
            this.soundText.setText(gameState.soundEnabled ? 'SOUND\nON' : 'SOUND\nOFF');
            if (gameState.soundEnabled) {
                this.playClickSound();
            }
        });

        // Shoe indicator
        const iconKey = gameState.selectedShoe === 'sneakers' ? 'sneaker_icon' : 'heel_icon';
        this.add.image(100, 220, iconKey).setScale(1.5);
        this.add.text(100, 260, gameState.selectedShoe === 'sneakers' ? 'Sneakers' : 'High Heels', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#00000088',
            padding: { x: 5, y: 3 }
        }).setOrigin(0.5);

        // Update timer
        this.time.addEvent({
            delay: 100,
            callback: this.updateTime,
            callbackScope: this,
            loop: true
        });
    },

    showTutorial: function() {
        const tutorial = this.add.text(640, 360, 'Tap the screen to walk!\n\nAlternate between left and right foot', {
            fontSize: '32px',
            fill: '#ffff00',
            fontStyle: 'bold',
            align: 'center',
            backgroundColor: '#000000cc',
            padding: { x: 30, y: 20 }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: tutorial,
            alpha: 0,
            duration: 3000,
            delay: 2000,
            onComplete: () => tutorial.destroy()
        });
    },

    handleClick: function(pointer) {
        if (this.isAnimating) return;

        // Create ripple effect at click position
        this.createRipple(pointer.x, pointer.y);

        // Perform step
        this.performStep();
    },

    createRipple: function(x, y) {
        const ripple = this.add.circle(x, y, 10, 0xffffff, 0.6);

        this.tweens.add({
            targets: ripple,
            radius: 50,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => ripple.destroy()
        });
    },

    performStep: function() {
        this.isAnimating = true;
        gameState.totalSteps++;

        const isSneakers = gameState.selectedShoe === 'sneakers';
        const stepDistance = isSneakers ? 100 : 50;
        const stepDuration = isSneakers ? 180 : 350;

        // Play footstep sound
        this.playFootstepSound(isSneakers);

        // Check for fall (heels only)
        if (!isSneakers && Math.random() < 0.2) {
            this.handleFall();
            return;
        }

        // Reset consecutive falls on successful step
        if (!isSneakers) {
            gameState.consecutiveFalls = 0;
        }

        // Animate step
        this.animateStep(stepDistance, stepDuration);
    },

    animateStep: function(distance, duration) {
        const targetX = Math.min(this.character.x + distance, 1080);

        // Animate character movement
        this.tweens.add({
            targets: this.character,
            x: targetX,
            duration: duration,
            ease: 'Power2',
            onComplete: () => {
                this.distance = targetX - 250;
                this.isAnimating = false;

                // Update UI
                this.updateUI();

                // Check win condition
                if (this.distance >= this.maxDistance * 0.9) {
                    this.handleWin();
                }
            }
        });

        // Animate leg movement based on current foot
        const movingLeg = this.currentFoot === 'left' ? this.leftLeg : this.rightLeg;
        const movingShoe = this.currentFoot === 'left' ? this.leftShoe : this.rightShoe;
        const movingArm = this.currentFoot === 'left' ? this.rightArm : this.leftArm;

        // Leg forward
        this.tweens.add({
            targets: movingLeg,
            x: movingLeg.x + 15,
            y: movingLeg.y - 10,
            duration: duration / 2,
            ease: 'Power2',
            yoyo: true
        });

        // Shoe follows leg
        this.tweens.add({
            targets: movingShoe,
            x: movingShoe.x + 15,
            y: movingShoe.y - 10,
            duration: duration / 2,
            ease: 'Power2',
            yoyo: true
        });

        // Arm swing (opposite)
        this.tweens.add({
            targets: movingArm,
            y: movingArm.y - 15,
            duration: duration / 2,
            ease: 'Power2',
            yoyo: true
        });

        // Add particle effect for sneakers
        if (gameState.selectedShoe === 'sneakers') {
            this.createDustParticles();
        }

        // Add sway for heels
        if (gameState.selectedShoe === 'heels') {
            this.tweens.add({
                targets: this.character,
                angle: this.currentFoot === 'left' ? -3 : 3,
                duration: duration / 2,
                ease: 'Sine.easeInOut',
                yoyo: true
            });
        }

        // Switch foot
        this.currentFoot = this.currentFoot === 'left' ? 'right' : 'left';
    },

    createDustParticles: function() {
        for (let i = 0; i < 3; i++) {
            const particle = this.add.circle(
                this.character.x - 20,
                this.character.y + 60,
                 3 + Math.random() * 3,
                0xcccccc,
                0.6
            );

            this.tweens.add({
                targets: particle,
                x: particle.x - 20 - Math.random() * 20,
                y: particle.y + 10,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    },

    handleFall: function() {
        gameState.fallCount++;
        gameState.consecutiveFalls++;

        // Play fall sound
        this.playFallSound();

        // Camera shake
        this.cameras.main.shake(500, 0.01);

        // Animate fall
        this.tweens.add({
            targets: this.character,
            angle: 45,
            y: this.character.y + 30,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Check if game over (3 consecutive falls)
                if (gameState.consecutiveFalls >= 3) {
                    this.handleGameOver();
                    return;
                }

                // Get up and retreat
                this.tweens.add({
                    targets: this.character,
                    angle: 0,
                    y: 430,
                    x: Math.max(this.character.x - 150, 250), // Retreat 3 steps
                    duration: 800,
                    ease: 'Power2',
                    onComplete: () => {
                        this.distance = Math.max(this.character.x - 250, 0);
                        this.isAnimating = false;
                        this.updateUI();
                    }
                });
            }
        });
    },

    handleWin: function() {
        gameState.totalTime = Math.floor((Date.now() - this.startTime) / 1000);

        // Play victory sound
        this.playVictorySound();

        // Celebration animation
        this.tweens.add({
            targets: this.character,
            y: this.character.y - 50,
            duration: 300,
            ease: 'Power2',
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                this.time.delayedCall(500, () => {
                    this.scene.start('ResultsScene');
                });
            }
        });
    },

    handleGameOver: function() {
        gameState.totalTime = Math.floor((Date.now() - this.startTime) / 1000);

        // Show game over message
        const gameOverText = this.add.text(640, 360, 'TOO MANY FALLS!\nGAME OVER', {
            fontSize: '48px',
            fill: '#ff0000',
            fontStyle: 'bold',
            align: 'center',
            backgroundColor: '#000000cc',
            padding: { x: 30, y: 20 }
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            this.scene.start('ResultsScene');
        });
    },

    updateUI: function() {
        // Update progress bar
        const progress = Math.min((this.distance / this.maxDistance) * 600, 600);
        this.progressBar.width = progress;

        // Update step counter
        this.stepText.setText(`Steps: ${gameState.totalSteps}`);

        // Update fall counter
        if (this.fallText) {
            this.fallText.setText(`Falls: ${gameState.fallCount}`);
        }
    },

    updateTime: function() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.timeText.setText(`Time: ${elapsed}s`);
    },

    playFootstepSound: function(isSneakers) {
        if (!gameState.soundEnabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (isSneakers) {
            // Soft, quick footstep
            oscillator.frequency.value = 150;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
            oscillator.stop(audioContext.currentTime + 0.08);
        } else {
            // Sharp heel click
            oscillator.frequency.value = 800;
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            oscillator.stop(audioContext.currentTime + 0.05);
        }

        oscillator.start(audioContext.currentTime);
    },

    playFallSound: function() {
        if (!gameState.soundEnabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create descending "Ah!" sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    },

    playVictorySound: function() {
        if (!gameState.soundEnabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Play ascending victory notes
        const notes = [523.25, 659.25, 783.99]; // C, E, G

        notes.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const startTime = audioContext.currentTime + index * 0.2;
            gainNode.gain.setValueAtTime(0.2, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    },

    playClickSound: function() {
        if (!gameState.soundEnabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
};

Phaser.Scene.call(GameScene.prototype.constructor);
Object.setPrototypeOf(GameScene.prototype, Phaser.Scene.prototype);

// ============================================
// RESULTS SCENE
// ============================================
function ResultsScene() {
    this.scene = null;
}

ResultsScene.prototype = {
    constructor: ResultsScene,

    key: 'ResultsScene',

    create: function() {
        // Determine if player won
        const won = gameState.consecutiveFalls < 3;

        // Background
        const bgColor = won ? 0x2d5016 : 0x501616;
        this.cameras.main.setBackgroundColor(bgColor);

        // Title
        const titleText = won ? 'CONGRATULATIONS!' : 'GAME OVER';
        const titleColor = won ? '#44ff44' : '#ff4444';

        this.add.text(640, 100, titleText, {
            fontSize: '56px',
            fill: titleColor,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Results
        const resultsY = 220;
        const lineHeight = 60;

        this.add.text(640, resultsY, `Shoe Choice: ${gameState.selectedShoe === 'sneakers' ? 'Sneakers' : 'High Heels'}`, {
            fontSize: '28px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(640, resultsY + lineHeight, `Total Steps: ${gameState.totalSteps}`, {
            fontSize: '28px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(640, resultsY + lineHeight * 2, `Time Taken: ${gameState.totalTime}s`, {
            fontSize: '28px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(640, resultsY + lineHeight * 3, `Falls: ${gameState.fallCount}`, {
            fontSize: '28px',
            fill: '#ff8888'
        }).setOrigin(0.5);

        // Performance message
        let message = '';
        if (won) {
            if (gameState.selectedShoe === 'sneakers') {
                message = 'Safe and steady wins the race!';
            } else {
                if (gameState.fallCount === 0) {
                    message = 'Flawless performance! You\'re a natural!';
                } else if (gameState.fallCount <= 2) {
                    message = 'Graceful despite the challenges!';
                } else {
                    message = 'You made it despite the falls!';
                }
            }
        } else {
            message = 'Maybe try sneakers next time?';
        }

        this.add.text(640, 500, message, {
            fontSize: '24px',
            fill: '#ffff88',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Buttons
        this.createButton('RESTART', 440, 600, () => {
            this.scene.start('GameScene');
        });

        this.createButton('CHANGE SHOES', 840, 600, () => {
            this.scene.start('ShoeSelectionScene');
        });
    },

    createButton: function(text, x, y, callback) {
        const button = this.add.rectangle(x, y, 250, 60, 0x4a90e2).setInteractive();
        const buttonText = this.add.text(x, y, text, {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.on('pointerdown', () => {
            this.playClickSound();
            callback();
        });

        button.on('pointerover', () => {
            button.setFillStyle(0x5aa0f2);
            button.setScale(1.05);
            buttonText.setScale(1.05);
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x4a90e2);
            button.setScale(1);
            buttonText.setScale(1);
        });
    },

    playClickSound: function() {
        if (!gameState.soundEnabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
};

Phaser.Scene.call(ResultsScene.prototype.constructor);
Object.setPrototypeOf(ResultsScene.prototype, Phaser.Scene.prototype);
