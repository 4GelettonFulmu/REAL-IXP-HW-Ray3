# Interactive Alleyway Walking Game

A fun 2D interactive web game where you control a character walking through an alleyway, choosing between sneakers for speed and stability, or high heels for an elegant but challenging experience.

## Features

### Stage 1: Shoe Selection
- **Sneakers**: Fast & stable walking
  - Red/blue design
  - 100 pixels per step
  - 180ms animation (fast)
  - 0% fall probability
  - ~15 steps to finish

- **High Heels**: Elegant but challenging
  - Black/red design
  - 50 pixels per step
  - 350ms animation (slower, more elegant)
  - 20% fall probability per step
  - Character sways while walking
  - Falls result in 3-step retreat
  - 3 consecutive falls = game over
  - ~30 steps to finish

### Stage 2: Walking Control
- **Step Alternation System**: Click to alternate between left and right foot
- **Visual Feedback**: Ripple animation at click location
- **Accident Prevention**: Ignores clicks during animation
- **Sneaker Effects**: Speed particles and dust effects
- **High Heel Effects**: Character sway, screen shake on fall, fall sound
- **Safety Mechanism**: After 3 consecutive falls, game ends

### Stage 3: Results Display
- Victory declared at 90% completion
- Statistics: Total steps, time taken, number of falls
- Performance-based messages
- Options to restart or change shoes

### UI Elements
- Top progress bar showing walking distance
- Step counter
- Time counter
- Fall counter (high heels only)
- Restart button
- Sound on/off toggle
- Current shoe indicator
- Tutorial on first entry

### Technical Features
- 60 FPS smooth operation
- Sub-50ms click response time
- Desktop (mouse) and mobile (touch) support
- All buttons ≥60x60px for accessibility
- Smooth animations using Phaser.js tweens
- Procedurally generated sound effects
- Responsive design that adapts to screen size
- Perspective-based alleyway scene

### Sound Effects
- Shoe selection click sound
- Sneaker footsteps (soft, quick)
- High heel footsteps (sharp clicks)
- Fall sound effects (descending "Ah!")
- Victory sound (ascending musical notes)
- All sounds can be toggled on/off

## How to Play

1. **Open** `index.html` in a modern web browser
2. **Choose** your shoes: Sneakers for a safe journey, or High Heels for a challenge
3. **Click** "START" to begin
4. **Tap/Click** anywhere on the screen to make your character step
5. **Alternate** between left and right foot with each click
6. **Reach** the finish line (golden marker) to win!

### Tips
- **Sneakers**: Click rapidly for fast completion
- **High Heels**: Take your time and pray to RNG gods
- **After falling**: You'll retreat 3 steps, so be careful!
- **3 consecutive falls**: Game over - try sneakers instead!

## Technical Stack

- **HTML5**: Structure
- **Phaser.js 3.60**: Game framework
- **Web Audio API**: Procedural sound generation
- **Canvas**: Rendering
- **Responsive Design**: Works on all screen sizes

## Browser Support

Works on all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Running Locally

### Option 1: Simple HTTP Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js
npx http-server
```

Then open `http://localhost:8000` in your browser.

### Option 2: Direct File Access
Simply open `index.html` in your browser. Most modern browsers support this.

## File Structure

```
.
├── index.html          # Main HTML file
├── game.js            # Complete game logic
└── README.md          # This file
```

## Acceptance Criteria ✓

- [x] Speed difference between shoes is significant (sneakers 2x faster)
- [x] High heel fall probability is perceptible but not excessive (20%)
- [x] Left/right foot alternation logic is accurate and error-free
- [x] All animations and sound effects are synchronized
- [x] Complete flow from shoe selection to level completion
- [x] 60 FPS performance target
- [x] Sub-50ms response time
- [x] Desktop and mobile support
- [x] Button sizes ≥60x60px
- [x] Smooth, lag-free animations

## Customization

You can easily customize the game by modifying variables in `game.js`:

```javascript
// Game dimensions
width: 1280,
height: 720,

// Sneaker settings
stepDistance: 100,      // pixels per step
stepDuration: 180,      // milliseconds

// High heel settings
stepDistance: 50,       // pixels per step
stepDuration: 350,      // milliseconds
fallProbability: 0.2,   // 20% chance

// Distance to win
maxDistance: 1200,      // 90% of screen width
```

## Known Features

- Procedurally generated graphics (no external image dependencies)
- Procedurally generated sounds (no audio file dependencies)
- Perspective alleyway with walls and ground textures
- Character animation with body, legs, arms, and shoes
- Particle effects for sneakers
- Screen shake for falls
- Responsive design for all screen sizes

## License

Free to use and modify for personal and commercial projects.

## Credits

Created with Phaser.js - A fast, robust and versatile game framework for Canvas and WebGL.
