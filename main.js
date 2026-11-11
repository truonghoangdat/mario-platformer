// =================================================================
// MARIO PLATFORMER 6.0 - COMPLETE ALL-IN-ONE MAIN LOGIC
// =================================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- TRẠNG THÁI GAME ---
let gameState = 'START'; // 'START', 'PLAYING', 'SHOP', 'GAMEOVER', 'WIN'
let lastTime = 0;
let isShopOpen = false;

// --- DỮ LIỆU NGƯỜI CHƠI (MARIO) ---
const player = {
    x: 50,
    y: 300,
    width: 32,
    height: 48,
    vx: 0,
    vy: 0,
    speed: 4,
    jumpPower: -12,
    isGrounded: false,
    jumpCount: 0,
    maxJumps: 2,
    hp: 100,
    maxHp: 100,
    gold: 50,
    isCrouching: false,
    fireballCooldown: 0,
    facing: 'right'
};

// --- QUẢN LÝ BÀN PHÍM ---
const keys = {};

window.addEventListener('keydown', (e) => {
    // Ngăn trình duyệt cuộn trang
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }

    keys[e.code] = true;

    // Phím B / KeyB: Bật/Tắt Shop triệt để
    if (e.code === 'KeyB' || e.key === 'b' || e.key === 'B') {
        if (gameState === 'PLAYING') {
            gameState = 'SHOP';
            isShopOpen = true;
        } else if (gameState === 'SHOP') {
            gameState = 'PLAYING';
            isShopOpen = false;
        }
    }

    // Phím F: Bắn cầu lửa
    if ((e.code === 'KeyF' || e.key === 'f' || e.key === 'F') && gameState === 'PLAYING') {
        shootFireball();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// --- NỀN TẢNG (PLATFORMS) ---
const platforms = [
    { x: 0, y: 400, width: 800, height: 50, type: 'ground' },
    { x: 150, y: 310, width: 140, height: 20, type: 'block' },
    { x: 380, y: 240, width: 150, height: 20, type: 'block' },
    { x: 600, y: 170, width: 140, height: 20, type: 'block' }
];

// --- KẺ ĐỊCH (ENEMIES) ---
let enemies = [
    { x: 200, y: 370, width: 30, height: 30, vx: 1.5, type: 'walker', hp: 20, alive: true },
    { x: 420, y: 210, width: 30, height: 30, vx: -2, type: 'walker', hp: 20, alive: true },
    { x: 620, y: 100, width: 25, height: 25, vx: 2, vy: 1, type: 'flyer', hp: 15, alive: true }
];

// --- ĐẠN CẦU LỬA ---
let fireballs = [];

function shootFireball() {
    if (player.fireballCooldown <= 0) {
        fireballs.push({
            x: player.facing === 'right' ? player.x + player.width : player.x - 10,
            y: player.y + 15,
            vx: player.facing === 'right' ? 8 : -8,
            radius: 6,
            alive: true
        });
        player.fireballCooldown = 10; // Hồi chiêu (frames)
    }
}

// --- KHỞI TẠO GAME ---
function startGame() {
    const startScreen = document.getElementById('startScreen');
    if (startScreen) startScreen.style.display = 'none';

    player.x = 50;
    player.y = 300;
    player.vx = 0;
    player.vy = 0;
    player.hp = 100;
    player.gold = 50;
    gameState = 'PLAYING';
    isShopOpen = false;

    requestAnimationFrame(gameLoop);
}

// --- CẬP NHẬT LOGIC GAME ---
function update(deltaTime) {
    if (gameState !== 'PLAYING') return;

    // 1. Giảm hồi chiêu
    if (player.fireballCooldown > 0) player.fireballCooldown--;

    // 2. Điều khiển Di chuyển Mario
    if (keys['KeyA'] || keys['ArrowLeft']) {
        player.vx = -player.speed;
        player.facing = 'left';
    } else if (keys['KeyD'] || keys['ArrowRight']) {
        player.vx = player.speed;
        player.facing = 'right';
    } else {
        player.vx = 0;
    }

    // 3. Phím S: Cúi người
    if (keys['KeyS'] || keys['ArrowDown']) {
        player.isCrouching = true;
        player.height = 30;
    } else {
        if (player.isCrouching) player.y -= 18; // Nâng người dậy
        player.isCrouching = false;
        player.height = 48;
    }

    // 4. Nhảy (W / Space / ArrowUp)
    if ((keys['KeyW'] || keys['Space'] || keys['ArrowUp'])) {
        if (player.isGrounded) {
            player.vy = player.jumpPower;
            player.isGrounded = false;
            player.jumpCount = 1;
            keys['KeyW'] = keys['Space'] = keys['ArrowUp'] = false; // Tránh giữ phím
        } else if (player.jumpCount < player.maxJumps) {
            player.vy = player.jumpPower * 0.85; // Nhảy đôi
            player.jumpCount++;
            keys['KeyW'] = keys['Space'] = keys['ArrowUp'] = false;
        }
    }

    // 5. Trọng lực & Tọa độ
    player.vy += 0.5; // Trọng lực
    player.x += player.vx;
    player.y += player.vy;

    // Giới hạn biên màn hình
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // 6. Va chạm Nền tảng (Platforms)
    player.isGrounded = false;
    for (let p of platforms) {
        if (player.x + player.width > p.x &&
            player.x < p.x + p.width &&
            player.y + player.height >= p.y &&
            player.y + player.height <= p.y + p.height + player.vy) {
            
            player.y = p.y - player.height;
            player.vy = 0;
            player.isGrounded = true;
            player.jumpCount = 0;
        }
    }

    // 7. Cập nhật Kẻ địch
    for (let enemy of enemies) {
        if (!enemy.alive) continue;

        if (enemy.type === 'walker') {
            enemy.x += enemy.vx;
            if (enemy.x <= 150 || enemy.x + enemy.width >= 750) enemy.vx *= -1;
        } else if (enemy.type === 'flyer') {
            enemy.x += enemy.vx;
            enemy.y += enemy.vy;
            if (enemy.x <= 100 || enemy.x >= 700) enemy.vx *= -1;
            if (enemy.y <= 50 || enemy.y >= 200) enemy.vy *= -1;
        }

        // Va chạm với Mario
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            // Giẫm lên đầu quái
            if (player.vy > 0 && player.y + player.height - player.vy <= enemy.y + 10) {
                enemy.alive = false;
                player.vy = player.jumpPower * 0.6;
                player.gold += 15;
            } else {
                player.hp -= 0.5;
                if (player.hp <= 0) gameState = 'GAMEOVER';
            }
        }
    }

    // 8. Cập nhật Đạn Cầu lửa
    for (let fb of fireballs) {
        if (!fb.alive) continue;
        fb.x += fb.vx;

        if (fb.x < 0 || fb.x > canvas.width) fb.alive = false;

        // Cầu lửa trúng kẻ địch
        for (let enemy of enemies) {
            if (enemy.alive &&
                fb.x > enemy.x && fb.x < enemy.x + enemy.width &&
                fb.y > enemy.y && fb.y < enemy.y + enemy.height) {
                
                enemy.hp -= 10;
                fb.alive = false;
                if (enemy.hp <= 0) {
                    enemy.alive = false;
                    player.gold += 20;
                }
            }
        }
    }
}

// --- VẼ ĐỒ HỌA TRÊN CANVAS ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Vẽ Nền trời & Mặt đất
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let p of platforms) {
        ctx.fillStyle = p.type === 'ground' ? '#15803d' : '#b45309';
        ctx.fillRect(p.x, p.y, p.width, p.height);
    }

    // 2. Vẽ Kẻ địch
    for (let enemy of enemies) {
        if (!enemy.alive) continue;
        ctx.fillStyle = enemy.type === 'walker' ? '#dc2626' : '#9333ea';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }

    // 3. Vẽ Cầu lửa
    ctx.fillStyle = '#f97316';
    for (let fb of fireballs) {
        if (!fb.alive) continue;
        ctx.beginPath();
        ctx.arc(fb.x, fb.y, fb.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // 4. Vẽ Mario
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Mắt Mario
    ctx.fillStyle = '#ffffff';
    let eyeX = player.facing === 'right' ? player.x + 20 : player.x + 4;
    ctx.fillRect(eyeX, player.y + 8, 8, 8);

    // 5. Vẽ UI (Thanh HP, Vàng, Hướng dẫn)
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText(`Màn: 1  |  HP: ${Math.ceil(player.hp)}/${player.maxHp}  |  Vàng: ${player.gold}  |  Phím B: Mở Shop`, 15, 30);

    // 6. GIAO DIỆN CỬA HÀNG (SHOP OVERLAY)
    if (gameState === 'SHOP' || isShopOpen) {
        // Phủ màu tối background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(100, 50, 600, 340);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.strokeRect(100, 50, 600, 340);

        // Tiêu đề Shop
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('--- CỬA HÀNG VẬT PHẨM (SHOP) ---', 200, 95);

        // Vật phẩm 1: Bình Máu
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText('1. Hồi 50 HP (Giá: 20 Vàng) - Bấm phím [1]', 150, 160);

        // Vật phẩm 2: Tăng Tốc Độ
        ctx.fillText('2. Tăng Tốc Độ Chạy (Giá: 40 Vàng) - Bấm phím [2]', 150, 210);

        // Hướng dẫn đóng
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'italic 14px Arial';
        ctx.fillText('💡 Bấm lại phím B trên bàn phím để đóng Shop và tiếp tục chơi', 180, 330);
    }

    // Game Over Screen
    if (gameState === 'GAMEOVER') {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 36px Arial';
        ctx.fillText('GAME OVER!', 300, 220);
    }
}

// Mua vật phẩm trong Shop bằng phím 1 và 2
window.addEventListener('keydown', (e) => {
    if (gameState === 'SHOP') {
        if (e.code === 'Digit1' || e.key === '1') {
            if (player.gold >= 20 && player.hp < player.maxHp) {
                player.gold -= 20;
                player.hp = Math.min(player.maxHp, player.hp + 50);
            }
        }
        if (e.code === 'Digit2' || e.key === '2') {
            if (player.gold >= 40) {
                player.gold -= 40;
                player.speed += 1.5;
            }
        }
    }
});

// --- VÒNG LẮP CHÍNH (GAME LOOP) ---
function gameLoop(timeStamp) {
    let deltaTime = (timeStamp - lastTime) / 1000;
    lastTime = timeStamp;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}
