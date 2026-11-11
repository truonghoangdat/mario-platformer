// ==========================================
// MARIO PLATFORMER 6.0 - FULL MAIN LOGIC
// ==========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'START'; // START, PLAYING, GAMEOVER, SHOP
let lastTime = 0;

// Biến quản lý trạng thái Shop
let isShopOpen = false;

// Đối tượng lưu trạng thái bàn phím
const keys = {};

// Lắng nghe sự kiện nhấn phím (KeyDown)
window.addEventListener('keydown', (e) => {
    // Chống cuộn trang web khi bấm Space hoặc phím mũi tên
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }

    keys[e.code] = true;
    keys[e.key] = true;
    keys[e.key.toLowerCase()] = true;

    // Xử lý phím B để Mở / Đóng Shop (Bắt triệt để cả KeyB, 'b' và 'B')
    if (e.code === 'KeyB' || e.key === 'b' || e.key === 'B') {
        if (gameState === 'PLAYING') {
            gameState = 'SHOP';
            isShopOpen = true;
            if (typeof openShopUI === 'function') openShopUI();
            else if (typeof openShop === 'function') openShop();
        } else if (gameState === 'SHOP') {
            gameState = 'PLAYING';
            isShopOpen = false;
            if (typeof closeShopUI === 'function') closeShopUI();
            else if (typeof closeShop === 'function') closeShop();
        }
    }

    // Xử lý phím F để Tung Chưởng Lửa
    if ((e.code === 'KeyF' || e.key === 'f' || e.key === 'F') && gameState === 'PLAYING') {
        if (typeof player !== 'undefined' && typeof player.shootFireball === 'function') {
            player.shootFireball();
        }
    }
});

// Lắng nghe sự kiện nhả phím (KeyUp)
window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    keys[e.key] = false;
    keys[e.key.toLowerCase()] = false;
});

// Hàm bắt đầu trò chơi khi bấm nút BẮT ĐẦU CHƠI
function startGame() {
    const startScreen = document.getElementById('startScreen');
    if (startScreen) {
        startScreen.style.display = 'none';
    }
    gameState = 'PLAYING';
    initGame();
    requestAnimationFrame(gameLoop);
}

// Khởi tạo/Reset lại game
function initGame() {
    isShopOpen = false;
    if (typeof resetPlayer === 'function') resetPlayer();
    if (typeof initPlatforms === 'function') initPlatforms();
    if (typeof initEnemies === 'function') initEnemies();
}

// Vòng lặp chính của Game (Game Loop)
function gameLoop(timeStamp) {
    let deltaTime = (timeStamp - lastTime) / 1000;
    if (isNaN(deltaTime) || deltaTime > 0.1) deltaTime = 1 / 60;
    lastTime = timeStamp;

    // Xóa khung vẽ Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'PLAYING' || gameState === 'SHOP') {
        // 1. Cập nhật & Vẽ Nền tảng (Platforms)
        if (typeof updatePlatforms === 'function') updatePlatforms(deltaTime);
        if (typeof drawPlatforms === 'function') drawPlatforms(ctx);

        // 2. Cập nhật & Vẽ Kẻ địch (Enemies)
        if (typeof updateEnemies === 'function') updateEnemies(deltaTime);
        if (typeof drawEnemies === 'function') drawEnemies(ctx);

        // 3. Cập nhật & Vẽ Người chơi (Player / Mario)
        if (gameState === 'PLAYING') {
            if (typeof updatePlayer === 'function') updatePlayer(deltaTime, keys);
        }
        if (typeof drawPlayer === 'function') drawPlayer(ctx);

        // 4. Cập nhật & Vẽ Đạn/Cầu lửa (Fireballs / Arrows)
        if (typeof updateArrows === 'function') updateArrows(deltaTime);
        if (typeof drawArrows === 'function') drawArrows(ctx);

        // 5. Vẽ giao diện Cửa hàng (Shop Overlay) nếu đang mở Shop
        if ((gameState === 'SHOP' || isShopOpen) && typeof drawShopOverlay === 'function') {
            drawShopOverlay(ctx);
        }
    }

    requestAnimationFrame(gameLoop);
}
