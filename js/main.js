let game = null;
let initialized = false;

async function initializeGame() {
    if (initialized) {
        console.log('Game already initialized, skipping...');
        return;
    }
    
    console.log('Maze Game Initializing...');
    console.log('Loading assets...');
    
    // Create procedural assets
    const mouseSprite = Assets.createPlaceholderMouse();
    const wallTexture = Assets.createPlaceholderWall();
    const floorTexture = Assets.createPlaceholderFloor();
    
    // Store assets
    Assets.assets['mouse'] = mouseSprite;
    Assets.assets['wall'] = wallTexture;
    Assets.assets['floor'] = floorTexture;
    
    console.log('Assets loaded successfully');
    
    initialized = true;
    game = new Game();
    window.game = game; // Make game globally accessible
    await game.init(Assets);
    
    // Add event listener for difficulty changes
    const difficultySelect = document.getElementById('difficulty');
    if (difficultySelect) {
        difficultySelect.addEventListener('change', () => {
            console.log('Difficulty changed, restarting game...');
            Audio.nextTrack(); // Change music track when difficulty changes
            game.reset();
        });
    }

    // Add mute button functionality
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            const isMuted = Audio.toggleMute();
            muteBtn.textContent = isMuted ? '🔇' : '🔊';
            muteBtn.title = isMuted ? 'Unmute Music' : 'Mute Music';
        });
    }

    // Add debug victory button
    const debugBtn = document.getElementById('debug-btn');
    if (debugBtn) {
        debugBtn.addEventListener('click', () => {
            console.log('Debug: Triggering victory screen');
            game.debugVictory();
        });
    }
    
    console.log('Game started! Use arrow keys or WASD to move.');
}

document.addEventListener('DOMContentLoaded', initializeGame);

window.addEventListener('beforeunload', () => {
    if (game) {
        game.stop();
    }
});