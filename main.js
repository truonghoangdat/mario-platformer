// ==========================================
// MARIO PLATFORMER 6.0 - MAIN LOGIC
// ==========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'START'; // START, PLAYING, GAMEOVER, SHOP
let lastTime = 0;

// Lắng nghe sự kiện bàn phím
const keys = {};

window.addEventListener('keydown', (e) => {
    // Ngăn trình duyệt cuộn trang khi bấm phím cách (Space) hoặc các phím mũi tên
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }
    keys[e.code] = true;
    keys[e.key.toLowerCase()] = true;

    // Bấm phím B hoặc b để bật/tắt Shop
    if (e.key === 'b' || e.key === 'B' || e.code === 'KeyB') {
        if (gameState === 'PLAYING') {
            gameState = 'SHOP';
            if (typeof openShopUI === 'function') openShopUI();
        } else if (gameState === 'SHOP') {
            gameState = 'PLAYING';
            if (typeof closeShopUI === 'function') closeShopUI();
        }
    }

    // Bấm phím F để tung Chưởng Lửa
    if ((e.key === 'f' || e.key === 'F' || e.code === 'KeyF') && gameState === 'PLAYING') {
        if (typeof player !== 'undefined' && typeof player.shootFireball === 'function') {
            player.shootFireball();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    keys[e.key.toLowerCase()] = false;
});

// Hàm bắt đầu game khi bấm nút BẮT ĐẦU CHƠI
function startGame() {
    const startScreen = document.getElementById('startScreen');
    if (startScreen) {
        startScreen.style.display = 'none';
    }
    gameState = 'PLAYING';
    initGame();
    requestAnimationFrame(gameLoop);
}

// Khởi tạo trạng thái game
function initGame() {
    if (typeof resetPlayer === 'function') resetPlayer();
    if (typeof initPlatforms === 'function') initPlatforms();
    if (typeof initEnemies === 'function') initEnemies();
}

// Vòng lặp game chính (Game Loop)
function gameLoop(timeStamp) {
    let deltaTime = (timeStamp - lastTime) / 1000;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'PLAYING' || gameState === 'SHOP') {
        // Cập nhật và vẽ các đối tượng trong game
        if (typeof updatePlatforms === 'function') updatePlatforms(deltaTime);
        if (typeof drawPlatforms === 'function') drawPlatforms(ctx);

        if (typeof updateEnemies === 'function') updateEnemies(deltaTime);
        if (typeof drawEnemies === 'function') drawEnemies(ctx);

        if (typeof updatePlayer === 'function') updatePlayer(deltaTime, keys);
        if (typeof drawPlayer === 'function') drawPlayer(ctx);

        if (typeof updateArrows === 'function') updateArrows(deltaTime);
        if (typeof drawArrows === 'function') drawArrows(ctx);

        // Hiển thị giao diện Shop phủ lên canvas nếu ở trạng thái SHOP
        if (gameState === 'SHOP' && typeof drawShopOverlay === 'function') {
            drawShopOverlay(ctx);
        }
    }

    requestAnimationFrame(gameLoop);
}
