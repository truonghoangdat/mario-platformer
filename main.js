// ==========================================
// MARIO PLATFORMER 6.0 - INTEGRATED MAIN JS
// ==========================================

let gameState = 'START';
let lastTime = 0;
let isShopOpen = false;
const keys = {};

// 1. LẮNG NGHE BÀN PHÍM (XỬ LÝ TRIỆT ĐỂ PHÍM B MỞ SHOP)
window.addEventListener('keydown', (e) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }
    keys[e.code] = true;
    keys[e.key] = true;
    keys[e.key.toLowerCase()] = true;

    // Bấm B hoặc KeyB để chuyển đổi Shop
    if (e.code === 'KeyB' || e.key === 'b' || e.key === 'B') {
        if (gameState === 'PLAYING') {
            gameState = 'SHOP';
            isShopOpen = true;
        } else if (gameState === 'SHOP') {
            gameState = 'PLAYING';
            isShopOpen = false;
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    keys[e.key] = false;
    keys[e.key.toLowerCase()] = false;
});

// 2. HÀM BẮT ĐẦU CHƠI (GỌI TỪ NÚT TRÊN OVERLAY)
function startGame() {
    const startScreen = document.getElementById('startScreen');
    if (startScreen) startScreen.style.display = 'none';
    gameState = 'PLAYING';
    isShopOpen = false;
    
    if (typeof resetPlayer === 'function') resetPlayer();
    requestAnimationFrame(gameLoop);
}

// 3. VÒNG LẮP GAME CHÍNH (SAFE LOOP)
function gameLoop(timeStamp) {
    let deltaTime = (timeStamp - lastTime) / 1000;
    if (isNaN(deltaTime) || deltaTime > 0.1) deltaTime = 1 / 60;
    lastTime = timeStamp;

    // Lấy canvas hiện có
    const cvs = document.getElementById('gameCanvas');
    if (cvs) {
        const context = cvs.getContext('2d');
        context.clearRect(0, 0, cvs.width, cvs.height);

        if (gameState === 'PLAYING' || gameState === 'SHOP') {
            // Cập nhật & Vẽ các thành phần từ các file JS khác
            if (typeof updatePlatforms === 'function') updatePlatforms(deltaTime);
            if (typeof drawPlatforms === 'function') drawPlatforms(context);

            if (typeof updateEnemies === 'function') updateEnemies(deltaTime);
            if (typeof drawEnemies === 'function') drawEnemies(context);

            if (typeof updatePlayer === 'function') updatePlayer(deltaTime, keys);
            if (typeof drawPlayer === 'function') drawPlayer(context);

            if (typeof updateArrows === 'function') updateArrows(deltaTime);
            if (typeof drawArrows === 'function') drawArrows(context);

            // Vẽ giao diện Cửa hàng nếu bật phím B
            if (gameState === 'SHOP' || isShopOpen) {
                if (typeof drawShop === 'function') {
                    drawShop(context);
                } else if (typeof drawShopOverlay === 'function') {
                    drawShopOverlay(context);
                } else {
                    // Màn hình Shop dự phòng
                    context.fillStyle = 'rgba(15, 23, 42, 0.85)';
                    context.fillRect(120, 60, 560, 300);
                    context.strokeStyle = '#facc15';
                    context.lineWidth = 3;
                    context.strokeRect(120, 60, 560, 300);

                    context.fillStyle = '#facc15';
                    context.font = 'bold 22px Arial';
                    context.fillText('--- CỬA HÀNG VẬT PHẨM (SHOP) ---', 210, 110);

                    context.fillStyle = '#ffffff';
                    context.font = '16px Arial';
                    context.fillText('1. Hồi Máu (50 HP) - Giá: 20 Vàng', 180, 180);
                    context.fillText('2. Tăng Tốc Độ - Giá: 40 Vàng', 180, 220);

                    context.fillStyle = '#38bdf8';
                    context.font = 'italic 14px Arial';
                    context.fillText('💡 Nhấn phím B để đóng Cửa Hàng', 240, 310);
                }
            }
        }
    }

    requestAnimationFrame(gameLoop);
}
