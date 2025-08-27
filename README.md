# Snow Bros Game 🎮

A complete retro-style Snow Bros game built with pure JavaScript, HTML5 Canvas, and CSS3.

## 🎯 Game Features

- **5 Progressive Levels**: Each level 10% harder with unique platform designs
- **3-Stage Freeze System**: Hit enemies 3 times to create pushable snowballs
- **Anger Level System**: Increases every 10 seconds, making enemies faster and more aggressive
- **Advanced Enemy AI**: Hunters, pathfinding, and anger-based behavior
- **Retro 8-bit Sounds**: Web Audio API generated sounds (no external files)
- **Animated UI**: Logo animations on level completion
- **Sound Control**: Toggle button with volume control
- **Responsive Design**: Works on all screen sizes

## 🎮 How to Play

1. **Move**: A/D or Arrow Keys
2. **Jump**: W or Up Arrow
3. **Shoot/Push**: SPACE
4. **Freeze Enemies**: Hit penguins 3 times with snowballs
5. **Push Snowballs**: Get close to frozen enemies and press SPACE
6. **Clear Levels**: Defeat all enemies to advance

## 🚀 Quick Start

1. Clone this repository
2. Open `index.html` in your browser
3. Start playing!

No build process or dependencies required - just pure web technologies!

## 🔧 Technical Details

- **Pure JavaScript** (ES6+) - No frameworks
- **HTML5 Canvas** for game rendering
- **CSS3** with hardware acceleration
- **Web Audio API** for sound effects
- **Modular architecture** for maintainability

## 📁 Project Structure

```
snowbros/
├── index.html          # Main HTML file
├── style.css           # Styles and animations
├── game.js            # Main game logic
├── logo.png           # Game logo
└── js/
    ├── player.js      # Player character logic
    ├── enemy.js       # Enemy AI and behavior
    ├── snowball.js    # Projectile physics
    ├── sound.js       # Audio management
    ├── levels.js      # Level definitions
    └── particles.js   # Visual effects
```

## 🎨 Game Mechanics

### Difficulty Scaling
- **Level 1**: Base difficulty (1.0x)
- **Level 2**: 10% harder (1.1x)
- **Level 3**: 20% harder (1.2x)
- **Level 4**: 30% harder (1.3x)
- **Level 5**: 40% harder (1.4x) + Extra features

### Enemy System
- **Base Enemies**: 4 per level (5 for Level 5)
- **Anger Bonus**: +1 enemy when anger reaches 100%
- **AI Types**: Normal, Aggressive, Ultra-Aggressive Hunters
- **Freeze Stages**: Slow (1 hit) → Slower (2 hits) → Snowball (3 hits)

### Anger Level
- Starts at 0%, increases 20% every 10 seconds
- Affects enemy speed (1.0x to 2.0x multiplier)
- Influences AI aggression and decision-making
- Resets on level completion

## 🎵 Sound Effects

All sounds are generated using Web Audio API:
- Shooting snowballs
- Enemy hits and freezing
- Pushing snowballs
- Enemy deaths
- Level completion fanfare
- Game over sequence
- Anger level increases

## 🏆 Credits

Built with ❤️ using pure web technologies.
Perfect example of what's possible with vanilla JavaScript!

---

**Ready to play? Open index.html and start your snow adventure!** ❄️🎮
