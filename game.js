/**
 * ============================================
 * ALLEYWAY WALKING GAME
 * ============================================
 * A 2D interactive game where players walk through
 * an alleyway choosing between sneakers or high heels.
 *
 * Built with Phaser.js 3.60
 * ============================================
 */

// ============================================
// GAME CONFIGURATION & CONSTANTS
// ============================================

// Shoe configuration constants
const SHOE_CONFIG = {
    sneakers: {
        stepDistance: 100,      // Pixels moved per step
        stepDuration: 180,      // Animation duration in ms
        fallProbability: 0,     // 0% chance to fall
        displayName: 'Sneakers',
        description: ['Fast & Stable', 'Walking']
    },
    heels: {
        stepDistance: 50,       // Pixels moved per step (slower)
        stepDuration: 350,      // Animation duration in ms (more elegant)
        fallProbability: 0.2,   // 20% chance to fall
        fallRetreatSteps: 3,    // Number of steps to retreat after falling
        maxConsecutiveFalls: 3, // Game over after this many consecutive falls
        displayName: 'High Heels',
        description: ['Elegant but', 'Challenging']
    }
};

// Game dimensions and positions
const GAME_CONFIG = {
    width: 1280,
    height: 720,
    character: {
        startX: 250,
        startY: 430,
        finishX: 1080
    },
    ui: {
        progressBarWidth: 600,
        progressBarHeight: 30
    }
};

// Color palette
const COLORS = {
    sneaker: 0xFF3333,
    heel: 0x000000,
    success: 0x44ff44,
    danger: 0xff4444,
    warning: 0xffff00,
    skin: 0xFFDBAC,
    clothing: 0x8B4513,
    pants: 0x4169E1
};

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
// SOUND MANAGER
// ============================================
/**
 * Centralized sound management to avoid creating
 * multiple AudioContext instances
 */
class SoundManager {
    constructor() {
        this.audioContext = null;
    }

    /**
     * Get or create AudioContext (lazy initialization)
     */
    getAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    /**
     * Play a simple click/tap sound
     */
    playClick() {
        if (!gameState.soundEnabled) return;

        const ctx = this.getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    }

    /**
     * Play footstep sound (different for sneakers vs heels)
     */
    playFootstep(isSneakers) {
        if (!gameState.soundEnabled) return;

        const ctx = this.getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        if (isSneakers) {
            // Soft, muted footstep
            oscillator.frequency.value = 150;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
            oscillator.stop(ctx.currentTime + 0.08);
        } else {
            // Sharp, crisp heel click
            oscillator.frequency.value = 800;
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
            oscillator.stop(ctx.currentTime + 0.05);
        }

        oscillator.start(ctx.currentTime);
    }

    /**
     * Play fall sound (descending "Ah!")
     */
    playFall() {
        if (!gameState.soundEnabled) return;

        const ctx = this.getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    }

    /**
     * Play victory sound (ascending musical notes C-E-G)
     */
    playVictory() {
        if (!gameState.soundEnabled) return;

        const ctx = this.getAudioContext();
        const notes = [523.25, 659.25, 783.99]; // C, E, G major chord

        notes.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const startTime = ctx.currentTime + index * 0.2;
            gainNode.gain.setValueAtTime(0.2, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    }
}

// Create global sound manager instance
const soundManager = new SoundManager();

// ============================================
// BOOT SCENE - Asset Generation
// ============================================
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Show loading text
        this.add.text(640, 360, 'Loading...', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Generate all game assets
        this.generateShoeIcons();
        this.generateCharacterSprites();
    }

    create() {
        // Start the shoe selection scene
        this.scene.start('ShoeSelectionScene');
    }

    /**
     * Generate shoe icon textures
     */
    generateShoeIcons() {
        // Sneaker icon (red/blue design)
        const sneakerGraphics = this.make.graphics({ x: 0, y: 0, add: false });

        // Sole (red)
        sneakerGraphics.fillStyle(0xff3333);
        sneakerGraphics.fillRoundedRect(0, 20, 80, 30, 8);

        // Upper (blue)
        sneakerGraphics.fillStyle(0x3333ff);
        sneakerGraphics.fillRoundedRect(0, 0, 60, 25, 8);

        // Logo circle (white)
        sneakerGraphics.fillStyle(0xffffff);
        sneakerGraphics.fillCircle(25, 12, 8);

        sneakerGraphics.generateTexture('sneaker_icon', 80, 50);
        sneakerGraphics.destroy();

        // High heel icon (black/red design)
        const heelGraphics = this.make.graphics({ x: 0, y: 0, add: false });

        // Shoe body (black)
        heelGraphics.fillStyle(0x000000);
        heelGraphics.fillRoundedRect(10, 10, 60, 20, 5);

        // Heel (red)
        heelGraphics.fillStyle(0xff0000);
        heelGraphics.fillTriangle(70, 30, 80, 30, 75, 50);

        // Accent (dark red)
        heelGraphics.fillStyle(0xaa0000);
        heelGraphics.fillRect(15, 15, 50, 10);

        heelGraphics.generateTexture('heel_icon', 90, 60);
        heelGraphics.destroy();
    }

    /**
     * Generate character sprite textures (if needed)
     */
    generateCharacterSprites() {
        // Character sprites are created procedurally in GameScene
        // This method is here for future expansion
    }
}

// ============================================
// SHOE SELECTION SCENE
// ============================================
class ShoeSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShoeSelectionScene' });
    }

    create() {
        // Reset game state
        this.resetGameState();

        // Create UI elements
        this.createTitle();
        this.createShoeButtons();
        this.createStartButton();
    }

    /**
     * Reset all game state variables
     */
    resetGameState() {
        gameState.selectedShoe = null;
        gameState.totalSteps = 0;
        gameState.totalTime = 0;
        gameState.fallCount = 0;
        gameState.consecutiveFalls = 0;
    }

    /**
     * Create title and instructions
     */
    createTitle() {
        this.add.text(640, 100, 'Choose Your Shoes', {
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(640, 180, 'Select your footwear for the journey ahead', {
            fontSize: '24px',
            fill: '#cccccc'
        }).setOrigin(0.5);
    }

    /**
     * Create shoe selection buttons
     */
    createShoeButtons() {
        this.createShoeButton('sneakers', 320, 400);
        this.createShoeButton('heels', 960, 400);
    }

    /**
     * Create individual shoe button
     */
    createShoeButton(shoeType, x, y) {
        const config = SHOE_CONFIG[shoeType];
        const container = this.add.container(x, y);

        // Background card
        const bg = this.add.rectangle(0, 0, 300, 300, 0x3a3a3a);
        bg.setStrokeStyle(4, 0x666666);

        // Shoe icon
        const iconKey = shoeType === 'sneakers' ? 'sneaker_icon' : 'heel_icon';
        const icon = this.add.image(0, -60, iconKey).setScale(2);

        // Title text
        const title = this.add.text(0, 40, config.displayName.toUpperCase(), {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Description lines
        const desc1 = this.add.text(0, 80, config.description[0], {
            fontSize: '18px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);

        const desc2 = this.add.text(0, 105, config.description[1], {
            fontSize: '18px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);

        container.add([bg, icon, title, desc1, desc2]);

        // Setup interactivity
        this.setupShoeButtonInteraction(bg, container, icon, shoeType);
    }

    /**
     * Setup button interaction handlers
     */
    setupShoeButtonInteraction(bg, container, icon, shoeType) {
        bg.setInteractive();

        // Hover effect
        bg.on('pointerover', () => {
            container.setScale(1.1);
            icon.setScale(2.2);
            bg.setStrokeStyle(4, COLORS.warning);

            // Spin animation
            this.tweens.add({
                targets: icon,
                angle: 360,
                duration: 500,
                ease: 'Power2'
            });
        });

        // Hover out
        bg.on('pointerout', () => {
            if (gameState.selectedShoe !== shoeType) {
                container.setScale(1);
                icon.setScale(2);
                bg.setStrokeStyle(4, 0x666666);
            }
        });

        // Click handler
        bg.on('pointerdown', () => {
            soundManager.playClick();
            gameState.selectedShoe = shoeType;
            this.updateShoeSelection(container, bg);
        });
    }

    /**
     * Update visual feedback for shoe selection
     */
    updateShoeSelection(selectedContainer, selectedBg) {
        // Update all shoe containers
        this.children.list.forEach(child => {
            if (child.type === 'Container' && child !== this.startButton) {
                const childBg = child.list[0];
                if (child === selectedContainer) {
                    // Highlight selected shoe
                    childBg.setStrokeStyle(6, COLORS.success);
                    child.setScale(1.15);
                } else {
                    // Reset other shoe
                    childBg.setStrokeStyle(4, 0x666666);
                    child.setScale(1);
                }
            }
        });

        // Show start button
        this.showStartButton();
    }

    /**
     * Create start button (initially hidden)
     */
    createStartButton() {
        this.startButton = this.add.container(640, 600);

        const startBg = this.add.rectangle(0, 0, 200, 60, COLORS.success).setInteractive();
        const startText = this.add.text(0, 0, 'START', {
            fontSize: '28px',
            fill: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.startButton.add([startBg, startText]);
        this.startButton.setAlpha(0);

        // Button interactions
        startBg.on('pointerdown', () => {
            if (gameState.selectedShoe) {
                soundManager.playClick();
                this.scene.start('GameScene');
            }
        });

        startBg.on('pointerover', () => this.startButton.setScale(1.1));
        startBg.on('pointerout', () => this.startButton.setScale(1));
    }

    /**
     * Show start button with fade animation
     */
    showStartButton() {
        this.tweens.add({
            targets: this.startButton,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
    }
}

// ============================================
// MAIN GAME SCENE
// ============================================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Initialize game variables
        this.initializeGameVariables();

        // Create game elements
        this.createAlleyway();
        this.createCharacter();
        this.createUI();

        // Setup input handlers
        this.setupInputHandlers();

        // Show tutorial
        this.showTutorial();
    }

    /**
     * Initialize all game variables
     */
    initializeGameVariables() {
        this.startTime = Date.now();
        this.distance = 0;
        this.maxDistance = GAME_CONFIG.character.finishX - GAME_CONFIG.character.startX;
        this.currentFoot = 'left';
        this.isAnimating = false;
    }

    /**
     * Create alleyway background with perspective
     */
    createAlleyway() {
        const graphics = this.add.graphics();

        // Sky gradient
        graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE0F6FF, 0xE0F6FF, 1);
        graphics.fillRect(0, 0, GAME_CONFIG.width, 400);

        // Ground
        graphics.fillStyle(0x8B7355);
        graphics.fillRect(0, 500, GAME_CONFIG.width, 220);

        // Left wall (perspective)
        graphics.fillStyle(0x6B4423);
        graphics.fillTriangle(0, 300, 0, 720, 200, 720);
        graphics.fillRect(0, 400, 200, 320);

        // Right wall (perspective)
        graphics.fillStyle(0x8B5A3C);
        graphics.fillTriangle(GAME_CONFIG.width, 300, GAME_CONFIG.width, 720, 1080, 720);
        graphics.fillRect(1080, 400, 200, 320);

        // Ground texture lines
        graphics.lineStyle(2, 0x5A3A1A, 0.3);
        for (let i = 0; i < 10; i++) {
            const y = 500 + i * 22;
            graphics.lineTo(200, y);
            graphics.lineTo(1080, y);
            graphics.moveTo(200, y);
        }
        graphics.strokePath();

        // Finish line marker
        this.createFinishLine();
    }

    /**
     * Create finish line marker
     */
    createFinishLine() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0xFFD700);
        graphics.fillRect(1050, 450, 30, 50);

        this.add.text(1065, 470, 'END', {
            fontSize: '16px',
            fill: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAngle(90);
    }

    /**
     * Create character sprite
     */
    createCharacter() {
        const { startX, startY } = GAME_CONFIG.character;
        this.character = this.add.container(startX, startY);

        // Body
        const body = this.add.rectangle(0, 0, 30, 60, COLORS.clothing);

        // Head
        const head = this.add.circle(0, -40, 20, COLORS.skin);

        // Legs
        this.leftLeg = this.add.rectangle(-10, 40, 8, 40, COLORS.pants);
        this.rightLeg = this.add.rectangle(10, 40, 8, 40, COLORS.pants);

        // Shoes
        const shoeColor = gameState.selectedShoe === 'sneakers' ? COLORS.sneaker : COLORS.heel;
        this.leftShoe = this.add.rectangle(-10, 65, 12, 8, shoeColor);
        this.rightShoe = this.add.rectangle(10, 65, 12, 8, shoeColor);

        // Arms
        this.leftArm = this.add.rectangle(-20, -10, 8, 35, COLORS.clothing);
        this.rightArm = this.add.rectangle(20, -10, 8, 35, COLORS.clothing);

        this.character.add([
            body, head,
            this.leftLeg, this.rightLeg,
            this.leftShoe, this.rightShoe,
            this.leftArm, this.rightArm
        ]);
    }

    /**
     * Create UI elements
     */
    createUI() {
        this.createProgressBar();
        this.createCounters();
        this.createButtons();
        this.createShoeIndicator();
        this.setupTimerUpdate();
    }

    /**
     * Create progress bar
     */
    createProgressBar() {
        const centerX = GAME_CONFIG.width / 2;
        const barWidth = GAME_CONFIG.ui.progressBarWidth;
        const barHeight = GAME_CONFIG.ui.progressBarHeight;

        // Background
        const progressBg = this.add.rectangle(centerX, 30, barWidth, barHeight, 0x333333);
        progressBg.setStrokeStyle(2, 0x666666);

        // Fill bar (starts at 0 width)
        this.progressBar = this.add.rectangle(
            centerX - barWidth / 2,
            30,
            0,
            barHeight - 4,
            COLORS.success
        );
        this.progressBar.setOrigin(0, 0.5);
    }

    /**
     * Create stat counters
     */
    createCounters() {
        const textStyle = {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: '#00000088',
            padding: { x: 10, y: 5 }
        };

        // Step counter
        this.stepText = this.add.text(100, 80, 'Steps: 0', textStyle);

        // Time counter
        this.timeText = this.add.text(100, 120, 'Time: 0s', textStyle);

        // Fall counter (only for heels)
        if (gameState.selectedShoe === 'heels') {
            this.fallText = this.add.text(100, 160, 'Falls: 0', {
                ...textStyle,
                fill: '#ff4444'
            });
        }
    }

    /**
     * Create restart and sound toggle buttons
     */
    createButtons() {
        // Restart button
        const restartBtn = this.add.rectangle(1180, 80, 80, 50, COLORS.danger).setInteractive();
        const restartText = this.add.text(1180, 80, 'RESTART', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        restartBtn.on('pointerdown', () => {
            soundManager.playClick();
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

        // Sound toggle button
        this.createSoundToggle();
    }

    /**
     * Create sound toggle button
     */
    createSoundToggle() {
        const soundColor = gameState.soundEnabled ? COLORS.success : 0x666666;
        const soundBtn = this.add.rectangle(1180, 140, 80, 50, soundColor).setInteractive();

        this.soundText = this.add.text(1180, 140,
            gameState.soundEnabled ? 'SOUND\nON' : 'SOUND\nOFF', {
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        soundBtn.on('pointerdown', () => {
            gameState.soundEnabled = !gameState.soundEnabled;
            soundBtn.setFillStyle(gameState.soundEnabled ? COLORS.success : 0x666666);
            this.soundText.setText(gameState.soundEnabled ? 'SOUND\nON' : 'SOUND\nOFF');

            if (gameState.soundEnabled) {
                soundManager.playClick();
            }
        });
    }

    /**
     * Create shoe indicator
     */
    createShoeIndicator() {
        const iconKey = gameState.selectedShoe === 'sneakers' ? 'sneaker_icon' : 'heel_icon';
        const config = SHOE_CONFIG[gameState.selectedShoe];

        this.add.image(100, 220, iconKey).setScale(1.5);
        this.add.text(100, 260, config.displayName, {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#00000088',
            padding: { x: 5, y: 3 }
        }).setOrigin(0.5);
    }

    /**
     * Setup timer to update every 100ms
     */
    setupTimerUpdate() {
        this.time.addEvent({
            delay: 100,
            callback: this.updateTime,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * Setup input handlers for walking
     */
    setupInputHandlers() {
        this.input.on('pointerdown', this.handleClick, this);
    }

    /**
     * Show tutorial overlay
     */
    showTutorial() {
        const tutorial = this.add.text(640, 360,
            'Tap the screen to walk!\n\nAlternate between left and right foot', {
            fontSize: '32px',
            fill: '#ffff00',
            fontStyle: 'bold',
            align: 'center',
            backgroundColor: '#000000cc',
            padding: { x: 30, y: 20 }
        }).setOrigin(0.5);

        // Fade out after 2 seconds
        this.tweens.add({
            targets: tutorial,
            alpha: 0,
            duration: 3000,
            delay: 2000,
            onComplete: () => tutorial.destroy()
        });
    }

    /**
     * Handle click/tap input
     */
    handleClick(pointer) {
        // Ignore if animation in progress
        if (this.isAnimating) return;

        // Visual feedback
        this.createRipple(pointer.x, pointer.y);

        // Perform step
        this.performStep();
    }

    /**
     * Create ripple effect at click position
     */
    createRipple(x, y) {
        const ripple = this.add.circle(x, y, 10, 0xffffff, 0.6);

        this.tweens.add({
            targets: ripple,
            radius: 50,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => ripple.destroy()
        });
    }

    /**
     * Perform a walking step
     */
    performStep() {
        this.isAnimating = true;
        gameState.totalSteps++;

        const config = SHOE_CONFIG[gameState.selectedShoe];
        const isSneakers = gameState.selectedShoe === 'sneakers';

        // Play footstep sound
        soundManager.playFootstep(isSneakers);

        // Check for fall (heels only)
        if (!isSneakers && Math.random() < config.fallProbability) {
            this.handleFall();
            return;
        }

        // Reset consecutive falls on successful step
        if (!isSneakers) {
            gameState.consecutiveFalls = 0;
        }

        // Animate step
        this.animateStep(config.stepDistance, config.stepDuration);
    }

    /**
     * Animate character walking step
     */
    animateStep(distance, duration) {
        const targetX = Math.min(
            this.character.x + distance,
            GAME_CONFIG.character.finishX
        );

        // Move character forward
        this.tweens.add({
            targets: this.character,
            x: targetX,
            duration: duration,
            ease: 'Power2',
            onComplete: () => {
                this.distance = targetX - GAME_CONFIG.character.startX;
                this.isAnimating = false;
                this.updateUI();

                // Check win condition (90% of distance)
                if (this.distance >= this.maxDistance * 0.9) {
                    this.handleWin();
                }
            }
        });

        // Animate limbs
        this.animateLimbs(duration);

        // Add shoe-specific effects
        this.addShoeEffects(duration);

        // Switch foot for next step
        this.currentFoot = this.currentFoot === 'left' ? 'right' : 'left';
    }

    /**
     * Animate character limbs during step
     */
    animateLimbs(duration) {
        const movingLeg = this.currentFoot === 'left' ? this.leftLeg : this.rightLeg;
        const movingShoe = this.currentFoot === 'left' ? this.leftShoe : this.rightShoe;
        const movingArm = this.currentFoot === 'left' ? this.rightArm : this.leftArm;

        // Leg forward motion
        this.tweens.add({
            targets: [movingLeg, movingShoe],
            x: `+=${15}`,
            y: `-=${10}`,
            duration: duration / 2,
            ease: 'Power2',
            yoyo: true
        });

        // Arm swing (opposite of leg)
        this.tweens.add({
            targets: movingArm,
            y: `-=${15}`,
            duration: duration / 2,
            ease: 'Power2',
            yoyo: true
        });
    }

    /**
     * Add shoe-specific visual effects
     */
    addShoeEffects(duration) {
        if (gameState.selectedShoe === 'sneakers') {
            this.createDustParticles();
        } else if (gameState.selectedShoe === 'heels') {
            this.addHeelSway(duration);
        }
    }

    /**
     * Create dust particles for sneakers
     */
    createDustParticles() {
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
    }

    /**
     * Add sway animation for high heels
     */
    addHeelSway(duration) {
        const swayAngle = this.currentFoot === 'left' ? -3 : 3;

        this.tweens.add({
            targets: this.character,
            angle: swayAngle,
            duration: duration / 2,
            ease: 'Sine.easeInOut',
            yoyo: true
        });
    }

    /**
     * Handle character fall
     */
    handleFall() {
        gameState.fallCount++;
        gameState.consecutiveFalls++;

        // Play fall sound and shake camera
        soundManager.playFall();
        this.cameras.main.shake(500, 0.01);

        // Animate fall
        this.tweens.add({
            targets: this.character,
            angle: 45,
            y: this.character.y + 30,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Check for game over
                if (gameState.consecutiveFalls >= SHOE_CONFIG.heels.maxConsecutiveFalls) {
                    this.handleGameOver();
                    return;
                }

                // Get up and retreat
                this.recoverFromFall();
            }
        });
    }

    /**
     * Recover from fall and retreat
     */
    recoverFromFall() {
        const retreatDistance = SHOE_CONFIG.heels.stepDistance * SHOE_CONFIG.heels.fallRetreatSteps;
        const newX = Math.max(
            this.character.x - retreatDistance,
            GAME_CONFIG.character.startX
        );

        this.tweens.add({
            targets: this.character,
            angle: 0,
            y: GAME_CONFIG.character.startY,
            x: newX,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                this.distance = Math.max(newX - GAME_CONFIG.character.startX, 0);
                this.isAnimating = false;
                this.updateUI();
            }
        });
    }

    /**
     * Handle victory
     */
    handleWin() {
        gameState.totalTime = Math.floor((Date.now() - this.startTime) / 1000);

        // Play victory sound
        soundManager.playVictory();

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
    }

    /**
     * Handle game over
     */
    handleGameOver() {
        gameState.totalTime = Math.floor((Date.now() - this.startTime) / 1000);

        // Show game over message
        this.add.text(640, 360, 'TOO MANY FALLS!\nGAME OVER', {
            fontSize: '48px',
            fill: '#ff0000',
            fontStyle: 'bold',
            align: 'center',
            backgroundColor: '#000000cc',
            padding: { x: 30, y: 20 }
        }).setOrigin(0.5);

        // Transition to results
        this.time.delayedCall(2000, () => {
            this.scene.start('ResultsScene');
        });
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Update progress bar
        const progressPercent = this.distance / this.maxDistance;
        this.progressBar.width = progressPercent * GAME_CONFIG.ui.progressBarWidth;

        // Update step counter
        this.stepText.setText(`Steps: ${gameState.totalSteps}`);

        // Update fall counter (if exists)
        if (this.fallText) {
            this.fallText.setText(`Falls: ${gameState.fallCount}`);
        }
    }

    /**
     * Update time display
     */
    updateTime() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.timeText.setText(`Time: ${elapsed}s`);
    }
}

// ============================================
// RESULTS SCENE
// ============================================
class ResultsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultsScene' });
    }

    create() {
        // Determine if player won
        const won = gameState.consecutiveFalls < SHOE_CONFIG.heels.maxConsecutiveFalls;

        // Create results display
        this.createBackground(won);
        this.createTitle(won);
        this.createStats();
        this.createPerformanceMessage(won);
        this.createButtons();
    }

    /**
     * Create background with win/lose color
     */
    createBackground(won) {
        const bgColor = won ? 0x2d5016 : 0x501616;
        this.cameras.main.setBackgroundColor(bgColor);
    }

    /**
     * Create title text
     */
    createTitle(won) {
        const titleText = won ? 'CONGRATULATIONS!' : 'GAME OVER';
        const titleColor = won ? '#44ff44' : '#ff4444';

        this.add.text(640, 100, titleText, {
            fontSize: '56px',
            fill: titleColor,
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    /**
     * Create stats display
     */
    createStats() {
        const statsY = 220;
        const lineHeight = 60;
        const config = SHOE_CONFIG[gameState.selectedShoe];

        const stats = [
            `Shoe Choice: ${config.displayName}`,
            `Total Steps: ${gameState.totalSteps}`,
            `Time Taken: ${gameState.totalTime}s`,
            `Falls: ${gameState.fallCount}`
        ];

        stats.forEach((stat, index) => {
            const color = index === 3 ? '#ff8888' : '#ffffff';
            this.add.text(640, statsY + lineHeight * index, stat, {
                fontSize: '28px',
                fill: color
            }).setOrigin(0.5);
        });
    }

    /**
     * Create performance message
     */
    createPerformanceMessage(won) {
        let message = this.getPerformanceMessage(won);

        this.add.text(640, 500, message, {
            fontSize: '24px',
            fill: '#ffff88',
            fontStyle: 'italic'
        }).setOrigin(0.5);
    }

    /**
     * Get performance message based on results
     */
    getPerformanceMessage(won) {
        if (!won) {
            return 'Maybe try sneakers next time?';
        }

        if (gameState.selectedShoe === 'sneakers') {
            return 'Safe and steady wins the race!';
        }

        // High heels performance messages
        if (gameState.fallCount === 0) {
            return "Flawless performance! You're a natural!";
        } else if (gameState.fallCount <= 2) {
            return 'Graceful despite the challenges!';
        } else {
            return 'You made it despite the falls!';
        }
    }

    /**
     * Create action buttons
     */
    createButtons() {
        this.createButton('RESTART', 440, 600, () => {
            this.scene.start('GameScene');
        });

        this.createButton('CHANGE SHOES', 840, 600, () => {
            this.scene.start('ShoeSelectionScene');
        });
    }

    /**
     * Create individual button
     */
    createButton(text, x, y, callback) {
        const button = this.add.rectangle(x, y, 250, 60, 0x4a90e2).setInteractive();
        const buttonText = this.add.text(x, y, text, {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Click handler
        button.on('pointerdown', () => {
            soundManager.playClick();
            callback();
        });

        // Hover effects
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
    }
}

// ============================================
// GAME INITIALIZATION
// ============================================

// Phaser game configuration
const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
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

// Initialize game
const game = new Phaser.Game(config);
