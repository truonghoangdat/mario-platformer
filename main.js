const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'start';
let currentLevel = 1;
window.currentLevel = 1;
let difficulty = 'normal'; // 'easy' | 'normal' | 'hard'

let gold = 0;
let arrowDamage = 25;
let cameraX = 0;
let dayCycleTimer = 0;

let player;
window.player = null;
let platforms = [];
let enemies = [];
let arrows = [];
let items = [];
let keys = {};

// Chỉnh độ khó từ bảng Hướng dẫn bên trái
window.setDifficulty = function(levelDiff) {
    difficulty = levelDiff;
    document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active'));
    if (levelDiff === 'easy') {
        document.getElementById('diffEasy').classList.add('active');
        document.getElementById('diffStatus').innerText = 'Đang chọn: Dễ (Ít quái, chậm)';
    } else if (levelDiff === 'normal') {
        document.getElementById('diffNormal').classList.add('active');
        document.getElementById('diffStatus').innerText = 'Đang chọn: Bình thường (Đông, chậm)';
    } else {
        document.getElementById('diffHard').classList.add('active');
        document.getElementById('diffStatus').innerText = 'Đang chọn: Khó (Đông, nhanh)';
    }
    if (gameState === 'playing') {
        loadLevel(currentLevel);
    }
};

window.addEventListener('keydown', e => {
    keys[e.code] = true;
    keys[e.key] = true;

    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }

    if (gameState === 'playing') {
        if (e.code === 'KeyW' || e.code === 'Space' || e.code === 'ArrowUp') {
            player.jump();
        }
        if (e.code === 'KeyF') {
            shootFireball();
        }
        if (e.code === 'KeyB') {
            toggleShop();
        }
    } else if (gameState === 'shop' && e.code === 'KeyB') {
        toggleShop();
    }
});

window.addEventListener('keyup', e => {
    keys[e.code] = false;
    keys[e.key] = false;
});

function shootFireball() {
    if (!player || player.skillCooldown > 0) return;
    const spawnX = player.facing === 1 ? player.x + player.width : player.x - 18;
    arrows.push(new Arrow(spawnX, player.y + 12, arrowDamage, player.facing));
    player.skillCooldown = player.maxSkillCooldown;
    player.castTimer = 15;
}

window.startGame = function() {
    document.getElementById('startScreen').classList.add('hidden');
    gold = 0;
    arrowDamage = 25;
    currentLevel = 1;
    window.currentLevel = 1;
    player = new Player(60, 320);
    window.player = player;
    loadLevel(1);
    gameState = 'playing';
};

window.restartGame = function() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('victoryScreen').classList.add('hidden');
    startGame();
};

window.toggleShop = function() {
    const shopEl = document.getElementById('shopScreen');
    if (gameState === 'playing') {
        gameState = 'shop';
        document.getElementById('shopGoldText').innerText = `Vàng hiện có: ${gold}`;
        shopEl.classList.remove('hidden');
    } else if (gameState === 'shop') {
        gameState = 'playing';
        shopEl.classList.add('hidden');
    }
};

window.buyHeal = function() {
    if (gold >= 10 && player.hp < player.maxHp) {
        gold -= 10;
        player.hp = Math.min(player.maxHp, player.hp + 40);
        document.getElementById('shopGoldText').innerText = `Vàng hiện có: ${gold}`;
    }
};

window.buyDamage = function() {
    if (gold >= 10) {
        gold -= 10;
        arrowDamage += 15;
        document.getElementById('shopGoldText').innerText = `Vàng hiện có: ${gold}`;
    }
};

function buildEnemyList(rawEnemies) {
    // Dễ: lấy một nửa số quái & tốc độ chậm
    // Bình thường: giữ đủ quái & tốc độ chậm
    // Khó: giữ đủ quái & tốc độ nhanh
    const speedFactor = difficulty === 'hard' ? 1.55 : 0.72;
    const filtered = difficulty === 'easy'
        ? rawEnemies.filter((e, idx) => e.type === 'boss' || idx % 2 === 0)
        : rawEnemies;

    return filtered.map(e => new Enemy(e.x, e.y, e.type, e.range, e.speed * speedFactor));
}

function loadLevel(lvl) {
    currentLevel = lvl;
    window.currentLevel = lvl;
    cameraX = 0;
    arrows = [];
    platforms = [];
    items = [];

    if (!player) {
        player = new Player(60, 320);
        window.player = player;
    }
    player.x = 60;
    player.y = 320;
    player.vx = 0;
    player.vy = 0;
    player.maxSkillCooldown = 45;

    const mapW = lvl === 4 ? 2200 : 3200;
    // Nền đất chính
    platforms.push(new Platform(0, 400, mapW, 60, false));

    if (lvl === 1) {
        platforms.push(new Platform(220, 310, 160, 20));
        platforms.push(new Platform(460, 240, 180, 20));
        platforms.push(new Platform(740, 300, 160, 20));
        platforms.push(new Platform(1020, 230, 200, 20));
        platforms.push(new Platform(1340, 290, 180, 20));
        platforms.push(new Platform(1650, 220, 200, 20));
        platforms.push(new Platform(1980, 300, 180, 20));
        platforms.push(new Platform(2300, 240, 200, 20));
        platforms.push(new Platform(2620, 310, 180, 20));
        platforms.push(new Platform(3080, 320, 44, 80, true));

        enemies = buildEnemyList([
            { x: 350, y: 368, type: 'goomba', range: 110, speed: 1.2 },
            { x: 520, y: 208, type: 'goomba', range: 60, speed: 1.1 },
            { x: 920, y: 368, type: 'goomba', range: 140, speed: 1.3 },
            { x: 1100, y: 198, type: 'goomba', range: 70, speed: 1.2 },
            { x: 1520, y: 368, type: 'goomba', range: 150, speed: 1.3 },
            { x: 1730, y: 188, type: 'goomba', range: 70, speed: 1.2 },
            { x: 2150, y: 368, type: 'goomba', range: 150, speed: 1.4 },
            { x: 2400, y: 208, type: 'goomba', range: 70, speed: 1.2 },
            { x: 2820, y: 368, type: 'goomba', range: 140, speed: 1.4 }
        ]);

        items = [
            { x: 290, y: 278, type: 'coin', collected: false },
            { x: 540, y: 208, type: 'coin', collected: false },
            { x: 810, y: 268, type: 'potion', collected: false },
            { x: 1110, y: 198, type: 'coin', collected: false },
            { x: 1740, y: 188, type: 'coin', collected: false },
            { x: 2060, y: 268, type: 'potion', collected: false },
            { x: 2390, y: 208, type: 'coin', collected: false }
        ];
    } else if (lvl === 2) {
        platforms.push(new Platform(200, 300, 150, 20));
        platforms.push(new Platform(440, 220, 170, 20));
        platforms.push(new Platform(720, 290, 170, 20));
        platforms.push(new Platform(1000, 210, 180, 20));
        platforms.push(new Platform(1320, 280, 190, 20));
        platforms.push(new Platform(1640, 200, 190, 20));
        platforms.push(new Platform(1960, 280, 190, 20));
        platforms.push(new Platform(2280, 210, 190, 20));
        platforms.push(new Platform(2600, 290, 190, 20));
        platforms.push(new Platform(3080, 320, 44, 80, true));

        enemies = buildEnemyList([
            { x: 380, y: 368, type: 'goomba', range: 120, speed: 1.3 },
            { x: 560, y: 165, type: 'bat', range: 110, speed: 1.5 },
            { x: 880, y: 368, type: 'goomba', range: 140, speed: 1.4 },
            { x: 1120, y: 155, type: 'bat', range: 120, speed: 1.6 },
            { x: 1480, y: 368, type: 'goomba', range: 150, speed: 1.4 },
            { x: 1760, y: 145, type: 'bat', range: 120, speed: 1.6 },
            { x: 2120, y: 368, type: 'goomba', range: 150, speed: 1.5 },
            { x: 2420, y: 155, type: 'bat', range: 130, speed: 1.7 },
            { x: 2800, y: 368, type: 'goomba', range: 150, speed: 1.5 }
        ]);

        items = [
            { x: 265, y: 268, type: 'coin', collected: false },
            { x: 515, y: 188, type: 'coin', collected: false },
            { x: 795, y: 258, type: 'potion', collected: false },
            { x: 1080, y: 178, type: 'coin', collected: false },
            { x: 1720, y: 168, type: 'coin', collected: false },
            { x: 2040, y: 248, type: 'potion', collected: false },
            { x: 2680, y: 258, type: 'coin', collected: false }
        ];
    } else if (lvl === 3) {
        platforms.push(new Platform(210, 290, 150, 20));
        platforms.push(new Platform(460, 210, 160, 20));
        platforms.push(new Platform(740, 270, 160, 20));
        platforms.push(new Platform(1020, 195, 170, 20));
        platforms.push(new Platform(1340, 265, 180, 20));
        platforms.push(new Platform(1660, 190, 180, 20));
        platforms.push(new Platform(1980, 265, 180, 20));
        platforms.push(new Platform(2300, 195, 180, 20));
        platforms.push(new Platform(2620, 275, 180, 20));
        platforms.push(new Platform(3080, 320, 44, 80, true));

        enemies = buildEnemyList([
            { x: 360, y: 368, type: 'goomba', range: 130, speed: 1.4 },
            { x: 520, y: 150, type: 'bat', range: 120, speed: 1.7 },
            { x: 840, y: 368, type: 'goomba', range: 150, speed: 1.5 },
            { x: 1100, y: 140, type: 'bat', range: 130, speed: 1.8 },
            { x: 1440, y: 368, type: 'goomba', range: 160, speed: 1.5 },
            { x: 1740, y: 135, type: 'bat', range: 130, speed: 1.8 },
            { x: 2080, y: 368, type: 'goomba', range: 160, speed: 1.6 },
            { x: 2380, y: 140, type: 'bat', range: 140, speed: 1.9 },
            { x: 2740, y: 368, type: 'goomba', range: 160, speed: 1.6 },
            { x: 2880, y: 200, type: 'bat', range: 120, speed: 1.9 }
        ]);

        items = [
            { x: 275, y: 258, type: 'coin', collected: false },
            { x: 530, y: 178, type: 'coin', collected: false },
            { x: 810, y: 238, type: 'potion', collected: false },
            { x: 1095, y: 163, type: 'coin', collected: false },
            { x: 1420, y: 233, type: 'potion', collected: false },
            { x: 1740, y: 158, type: 'coin', collected: false },
            { x: 2380, y: 163, type: 'coin', collected: false },
            { x: 2700, y: 243, type: 'coin', collected: false }
        ];
    } else if (lvl === 4) {
        // Đấu trường Boss Rồng Xanh
        platforms.push(new Platform(220, 290, 160, 20));
        platforms.push(new Platform(480, 220, 160, 20));
        platforms.push(new Platform(760, 290, 160, 20));
        platforms.push(new Platform(1120, 240, 180, 20));
        platforms.push(new Platform(1480, 290, 160, 20));
        platforms.push(new Platform(2080, 320, 44, 80, true));

        enemies = buildEnemyList([
            { x: 420, y: 368, type: 'goomba', range: 120, speed: 1.4 },
            { x: 650, y: 160, type: 'bat', range: 120, speed: 1.7 },
            { x: 1580, y: 336, type: 'boss', range: 260, speed: 1.5 }
        ]);

        items = [
            { x: 290, y: 258, type: 'coin', collected: false },
            { x: 550, y: 188, type: 'potion', collected: false },
            { x: 830, y: 258, type: 'coin', collected: false },
            { x: 1200, y: 208, type: 'potion', collected: false },
            { x: 1550, y: 258, type: 'coin', collected: false }
        ];
    }
}

// Vẽ bình thuốc hồi máu pixel theo mẫu
function drawPixelPotion(ctx, drawX, y) {
    const floatY = y + Math.sin(Date.now() / 220) * 3;

    // 1. Nút bần nâu trên cổ chai
    ctx.fillStyle = '#92400e';
    ctx.fillRect(drawX + 9, floatY, 6, 4);

    // 2. Viền thủy tinh trắng xám
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(drawX + 7, floatY + 4, 10, 2); // Miệng cổ chai
    ctx.fillRect(drawX + 8, floatY + 6, 8, 4);  // Cổ chai
    ctx.fillRect(drawX + 4, floatY + 10, 16, 12); // Thân bầu tròn
    ctx.fillRect(drawX + 6, floatY + 22, 12, 2); // Đáy bình

    // 3. Khoảng rỗng thủy tinh xanh đậm bên trong
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(drawX + 6, floatY + 11, 12, 4);

    // 4. Nước thuốc màu đỏ rực
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(drawX + 6, floatY + 15, 12, 7);

    // 5. Chữ thập đỏ đậm nổi trên nước thuốc & ánh sáng trắng
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(drawX + 11, floatY + 16, 2, 5);
    ctx.fillRect(drawX + 9, floatY + 17, 6, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(drawX + 7, floatY + 12, 2, 3);

    // 6. Dấu cộng đỏ pixel lơ lửng phía trên bình
    const sparkle = Math.floor(Date.now() / 300) % 2;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(drawX + 5, floatY - 6 - sparkle, 2, 6);
    ctx.fillRect(drawX + 3, floatY - 4 - sparkle, 6, 2);
    ctx.fillRect(drawX + 15, floatY - 8 + sparkle, 2, 2);
    ctx.fillRect(drawX + 18, floatY - 5 + sparkle, 2, 2);
}

// Vẽ bầu trời chuyển Ngày <-> Đêm với Mặt Trời & Mặt Trăng xoay vòng cung
function drawSkyAndScenery() {
    dayCycleTimer += 0.0018; // Chu kỳ xoay vòng cung mượt mà
    const cycle = dayCycleTimer % (Math.PI * 2);
    const isDay = cycle < Math.PI;
    const progress = isDay ? (cycle / Math.PI) : ((cycle - Math.PI) / Math.PI);

    // Nội suy màu trời Ngày <-> Hoàng hôn <-> Đêm
    let skyTop, skyBottom;
    if (isDay) {
        const sunHeight = Math.sin(progress * Math.PI); // 0 ở chân trời, 1 ở đỉnh trời
        if (sunHeight < 0.25) {
            skyTop = '#1e3a8a';
            skyBottom = '#f97316'; // Bình minh / Hoàng hôn
        } else {
            skyTop = '#0284c7';
            skyBottom = '#7dd3fc'; // Ban ngày trong xanh
        }
    } else {
        skyTop = '#090d16';
        skyBottom = '#1e293b'; // Ban đêm
    }

    const grad = ctx.createLinearGradient(0, 0, 0, 400);
    grad.addColorStop(0, skyTop);
    grad.addColorStop(1, skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, 400);

    // Quỹ đạo vòng cung từ trái (x=60) qua đỉnh (y=55) sang phải (x=760)
    const arcX = 60 + progress * (canvas.width - 120);
    const arcY = 270 - Math.sin(progress * Math.PI) * 215;

    if (isDay) {
        // Mặt trời xoay vòng cung + tia nắng
        ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
        ctx.beginPath();
        ctx.arc(arcX, arcY, 34, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(arcX, arcY, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(arcX - 4, arcY - 4, 14, 0, Math.PI * 2);
        ctx.fill();

        // Mây pixel trôi nhẹ ban ngày
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < 6; i++) {
            const cx = ((i * 340 - cameraX * 0.25) % 1200 + 1200) % 1200 - 150;
            const cy = 65 + (i % 3) * 38;
            ctx.fillRect(cx + 12, cy, 44, 14);
            ctx.fillRect(cx, cy + 8, 68, 14);
        }
    } else {
        // Các ngôi sao lấp lánh ban đêm
        ctx.fillStyle = '#ffffff';
        for (let s = 0; s < 35; s++) {
            const sx = (s * 97) % canvas.width;
            const sy = (s * 53) % 250 + 15;
            if ((Math.floor(Date.now() / 400) + s) % 4 !== 0) {
                ctx.fillRect(sx, sy, 2, 2);
            }
        }

        // Mặt trăng vàng nhạt xoay vòng cung
        ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
        ctx.beginPath();
        ctx.arc(arcX, arcY, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(arcX, arcY, 19, 0, Math.PI * 2);
        ctx.fill();
    }

    // Đồi núi nền phía xa (Parallax)
    ctx.fillStyle = isDay ? '#0d9488' : '#0f172a';
    for (let h = 0; h < 8; h++) {
        const hx = h * 460 - (cameraX * 0.35) % 460 - 100;
        ctx.beginPath();
        ctx.moveTo(hx, 400);
        ctx.lineTo(hx + 160, 260);
        ctx.lineTo(hx + 320, 400);
        ctx.fill();
    }

    // Cây cối chi tiết có tán 2 lớp
    const mapW = currentLevel === 4 ? 2200 : 3200;
    for (let tx = 130; tx < mapW; tx += 360) {
        const treeDrawX = tx - cameraX;
        if (treeDrawX < -80 || treeDrawX > canvas.width + 80) continue;

        // Thân cây nâu có vân
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(treeDrawX + 16, 336, 14, 64);
        ctx.fillStyle = '#432818';
        ctx.fillRect(treeDrawX + 20, 342, 4, 52);

        // Tán lá 2 tầng
        ctx.fillStyle = isDay ? '#166534' : '#064e3b';
        ctx.beginPath();
        ctx.arc(treeDrawX + 23, 326, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isDay ? '#15803d' : '#047857';
        ctx.beginPath();
        ctx.arc(treeDrawX + 23, 312, 20, 0, Math.PI * 2);
        ctx.fill();
    }
}

function checkRectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function update() {
    if (gameState !== 'playing') return;

    // Điều khiển trái / phải
    if (keys['KeyA'] || keys['a'] || keys['A'] || keys['ArrowLeft']) {
        player.vx = -player.speed;
    } else if (keys['KeyD'] || keys['d'] || keys['D'] || keys['ArrowRight']) {
        player.vx = player.speed;
    } else {
        player.vx = 0;
    }

    player.update(platforms, keys);

    // Camera bám theo Player mượt mà
    const mapW = currentLevel === 4 ? 2200 : 3200;
    cameraX = player.x - canvas.width * 0.35;
    if (cameraX < 0) cameraX = 0;
    if (cameraX > mapW - canvas.width) cameraX = mapW - canvas.width;

    // Cập nhật đạn lửa & va chạm với quái
    arrows.forEach(arrow => {
        if (!arrow.active) return;
        arrow.update();

        enemies.forEach(enemy => {
            if (enemy.active && checkRectCollision(arrow, enemy)) {
                enemy.hp -= arrow.damage;
                enemy.hitTimer = 8;
                arrow.active = false;
                if (enemy.hp <= 0) {
                    enemy.active = false;
                    gold += (enemy.type === 'boss' ? 20 : 2);
                }
            }
        });
    });
    arrows = arrows.filter(a => a.active);

    // Cập nhật quái & va chạm với Player
    enemies.forEach(enemy => {
        if (!enemy.active) return;
        enemy.update();

        if (checkRectCollision(player, enemy)) {
            // Nhảy dẫm lên đầu quái thường
            if (enemy.type !== 'boss' && player.vy > 0 && player.y + player.height - player.vy <= enemy.y + 12) {
                enemy.hp -= 25;
                enemy.hitTimer = 8;
                player.vy = -7.5;
                if (enemy.hp <= 0) {
                    enemy.active = false;
                    gold += 2;
                }
            } else if (player.invincibleTimer <= 0) {
                player.hp -= (enemy.type === 'boss' ? 20 : 12);
                player.invincibleTimer = 50;
            }
        }

        // Sóng kiếm của Boss
        if (enemy.type === 'boss' && enemy.slashWave && enemy.slashWave.active) {
            if (checkRectCollision(player, enemy.slashWave) && player.invincibleTimer <= 0) {
                player.hp -= 18;
                player.invincibleTimer = 50;
                enemy.slashWave.active = false;
            }
        }
    });

    // Nhặt vàng & bình thuốc hồi máu
    items.forEach(item => {
        if (item.collected) return;
        const hitbox = { x: item.x, y: item.y, width: 22, height: 24 };
        if (checkRectCollision(player, hitbox)) {
            item.collected = true;
            if (item.type === 'coin') {
                gold += 3;
            } else if (item.type === 'potion') {
                player.hp = Math.min(player.maxHp, player.hp + 30);
            }
        }
    });

    // Kiểm tra điều kiện mở Cổng & qua màn
    const allEnemiesDead = enemies.every(e => !e.active);
    const allCoinsCollected = items.filter(i => i.type === 'coin').every(i => i.collected);
    const canPortal = allEnemiesDead && allCoinsCollected;

    platforms.forEach(p => {
        if (p.isPortal && canPortal && checkRectCollision(player, p)) {
            if (currentLevel < 4) {
                loadLevel(currentLevel + 1);
            } else {
                gameState = 'victory';
                document.getElementById('victoryScreen').classList.remove('hidden');
            }
        }
    });

    if (player.hp <= 0) {
        player.hp = 0;
        gameState = 'gameover';
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
}

function drawHUD() {
    const remainingEnemies = enemies.filter(e => e.active).length;
    const totalCoins = items.filter(i => i.type === 'coin').length;
    const collectedCoins = items.filter(i => i.type === 'coin' && i.collected).length;
    const canPortal = remainingEnemies === 0 && collectedCoins === totalCoins;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.fillRect(10, 10, canvas.width - 20, 66);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    const shopHint = gold >= 10 ? ' (ĐỦ VÀNG SHOP!)' : '';
    ctx.fillText(`Màn: ${currentLevel}/4  |  HP: ${player.hp}/${player.maxHp}  |  Vàng: ${gold}${shopHint}  |  Sát thương lửa: ${arrowDamage}`, 22, 30);

    // Thanh hồi chiêu chưởng lửa (F)
    const cooldownRatio = 1 - (player.skillCooldown / player.maxSkillCooldown);
    ctx.fillStyle = '#334155';
    ctx.fillRect(22, 40, 130, 10);
    ctx.fillStyle = cooldownRatio >= 1 ? '#f97316' : '#94a3b8';
    ctx.fillRect(22, 40, 130 * cooldownRatio, 10);

    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = cooldownRatio >= 1 ? '#fde047' : '#cbd5e1';
    ctx.fillText(cooldownRatio >= 1 ? 'CHƯỞNG LỬA SẴN SÀNG (F)' : 'Đang hồi chiêu...', 160, 49);

    // Trạng thái nhiệm vụ mở Cổng
    ctx.fillStyle = canPortal ? '#4ade80' : '#f87171';
    ctx.fillText(
        canPortal
            ? 'CỔNG ĐÃ MỞ! Chạy tới cuối màn để qua vòng!'
            : `Còn ${remainingEnemies} quái & ${totalCoins - collectedCoins} đồng vàng để mở Cổng`,
        22, 67
    );
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawSkyAndScenery();

    const allEnemiesDead = enemies.every(e => !e.active);
    const allCoinsCollected = items.filter(i => i.type === 'coin').every(i => i.collected);
    const canPortal = allEnemiesDead && allCoinsCollected;

    platforms.forEach(p => p.draw(ctx, cameraX, canPortal));

    // Vẽ vàng & bình thuốc hồi máu pixel
    items.forEach(item => {
        if (item.collected) return;
        const drawX = item.x - cameraX;
        if (item.type === 'coin') {
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.arc(drawX + 10, item.y + 10, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(drawX + 8, item.y + 8, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (item.type === 'potion') {
            drawPixelPotion(ctx, drawX, item.y);
        }
    });

    enemies.forEach(e => e.draw(ctx, cameraX));
    arrows.forEach(a => a.draw(ctx, cameraX));

    if (player) {
        player.draw(ctx, cameraX);
        drawHUD();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Khởi tạo sẵn nền màn 1 khi mở trang
loadLevel(1);
gameLoop();
