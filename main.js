const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- HỆ THỐNG ÂM THANH WEB AUDIO API ---
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playSound(type) {
    try {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'jump') {
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'fireball') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.2);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'hit') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.linearRampToValueAtTime(40, now + 0.1);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'coin') {
            osc.frequency.setValueAtTime(987.77, now);
            osc.frequency.setValueAtTime(1318.51, now + 0.08);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        }
    } catch(e) {}
}

let player = new Player(50, 300);
let arrows = [];
let keys = {};
let score = 0;
let coins = 0;
let arrowDamage = 25;
let currentLevel = 1;
window.currentLevel = 1;
let gameState = 'MENU';
let cameraX = 0;
let gameTime = 0;

let platforms = [];
let enemies = [];
let items = [];
let portal = null;
let princess = null;

let damageTexts = [];

function addDamageText(text, x, y, color = '#facc15') {
    damageTexts.push({
        text: text,
        x: x,
        y: y,
        color: color,
        alpha: 1.0,
        vy: -1.2
    });
}

const stars = [];
for (let i = 0; i < 60; i++) {
    stars.push({
        x: Math.random() * 800,
        y: Math.random() * 220,
        size: Math.random() * 2 + 1
    });
}

function loadLevel(lvl) {
    currentLevel = lvl;
    window.currentLevel = lvl;
    player.x = 50;
    player.y = 300;
    player.vx = 0;
    player.vy = 0;
    player.skillCooldown = 0;
    player.maxSkillCooldown = 60;
    arrows = [];
    damageTexts = [];

    if (lvl === 1) {
        platforms = [
            new Platform(0, 380, 2000, 70),
            new Platform(180, 280, 200, 18),
            new Platform(440, 210, 200, 18),
            new Platform(720, 280, 200, 18),
            new Platform(1000, 210, 200, 18),
            new Platform(1280, 280, 200, 18),
            new Platform(1560, 210, 200, 18)
        ];
        enemies = [
            new Enemy(220, 248, 190, 360, 'goomba'),
            new Enemy(740, 248, 730, 900, 'goomba'),
            new Enemy(1020, 178, 1010, 1180, 'goomba'),
            new Enemy(1580, 178, 1570, 1740, 'goomba')
        ];
        items = [
            { type: 'coin', x: 250, y: 240, active: true },
            { type: 'coin', x: 500, y: 170, active: true },
            { type: 'coin', x: 1050, y: 170, active: true },
            { type: 'heal', x: 1330, y: 240, active: true }
        ];
        portal = new Platform(1900, 310, 45, 70, true);
        princess = null;

    } else if (lvl === 2) {
        platforms = [
            new Platform(0, 380, 2000, 70),
            new Platform(180, 290, 180, 18),
            new Platform(400, 220, 180, 18),
            new Platform(640, 170, 180, 18),
            new Platform(920, 260, 180, 18),
            new Platform(1220, 210, 180, 18),
            new Platform(1520, 270, 180, 18)
        ];
        enemies = [
            new Enemy(200, 258, 190, 340, 'goomba'),
            new Enemy(420, 330, 380, 560, 'bat'),  
            new Enemy(940, 330, 900, 1080, 'bat'), 
            new Enemy(1240, 178, 1230, 1380, 'goomba'),
            new Enemy(1540, 330, 1500, 1680, 'bat')
        ];
        items = [
            { type: 'coin', x: 230, y: 250, active: true },
            { type: 'coin', x: 440, y: 180, active: true },
            { type: 'coin', x: 680, y: 130, active: true },
            { type: 'coin', x: 1260, y: 170, active: true },
            { type: 'heal', x: 1560, y: 230, active: true }
        ];
        portal = new Platform(1900, 310, 45, 70, true);
        princess = null;

    } else if (lvl === 3) {
        platforms = [
            new Platform(0, 380, 1400, 70),
            new Platform(250, 270, 220, 18),
            new Platform(650, 270, 220, 18)
        ];
        enemies = [
            new Enemy(750, 290, 550, 1100, 'boss')
        ];
        items = [
            { type: 'heal', x: 300, y: 230, active: true }
        ];
        portal = null;
        princess = { x: 1250, y: 340, active: true };
    }
}

// BẮT SỰ KIỆN BÀN PHÍM
window.addEventListener('keydown', e => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }

    keys[e.key] = true;
    keys[e.code] = true;
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === 'w' || e.key === 'W' || e.key === ' ' || e.code === 'Space' || e.key === 'ArrowUp') {
        if (gameState === 'PLAYING') player.jump();
    }

    // CHƯỞNG LỬA PHÍM F
    if ((e.key === 'f' || e.key === 'F' || e.code === 'KeyF') && gameState === 'PLAYING') {
        if (!player.skillCooldown || player.skillCooldown <= 0) {
            arrows.push(new Arrow(player.x + player.width, player.y + 10, arrowDamage));
            player.skillCooldown = player.maxSkillCooldown || 60;
            player.castTimer = 15;
            playSound('fireball');
        }
    }

    // Phím B / KeyB: Bật/Tắt Shop
    if (e.code === 'KeyB' || e.key === 'b' || e.key === 'B') {
        if (gameState === 'PLAYING') {
            toggleShop();
        }
    }
});

window.addEventListener('keyup', e => {
    keys[e.key] = false;
    keys[e.code] = false;
    keys[e.key.toLowerCase()] = false;
});

function toggleShop() {
    const shop = document.getElementById('shopScreen');
    if (shop) {
        if (shop.classList.contains('hidden')) {
            shop.classList.remove('hidden');
            const coinsElem = document.getElementById('shopCoins');
            if (coinsElem) coinsElem.innerText = `Vàng hiện có: ${coins}`;
        } else {
            shop.classList.add('hidden');
        }
    }
}

function buyItem(type) {
    if (type === 'heal' && coins >= 5) {
        coins -= 5;
        player.hp = Math.min(100, player.hp + 30);
        addDamageText('+30 HP', player.x + 10, player.y - 15, '#22c55e');
    } else if (type === 'upgrade' && coins >= 20) {
        coins -= 20;
        arrowDamage += 15;
        addDamageText('+15 ATK', player.x + 10, player.y - 15, '#38bdf8');
    }
    const coinsElem = document.getElementById('shopCoins');
    if (coinsElem) coinsElem.innerText = `Vàng hiện có: ${coins}`;
}

function startGame() {
    const startScreen = document.getElementById('startScreen');
    if (startScreen) startScreen.classList.add('hidden');
    loadLevel(1);
    gameState = 'PLAYING';
    gameTime = 0;
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (gameState !== 'PLAYING') return;

    gameTime += 1 / 60;

    // Giảm hồi chiêu phím F
    if (player.skillCooldown > 0) player.skillCooldown--;

    if (keys['a'] || keys['A'] || keys['ArrowLeft']) player.vx = -player.speed;
    else if (keys['d'] || keys['D'] || keys['ArrowRight']) player.vx = player.speed;
    else player.vx = 0;

    player.update(platforms, keys);

    // CHỐNG RỚT OUT KHỎI MAP
    if (player.x < 0) player.x = 0;
    const maxMapWidth = currentLevel === 3 ? 1350 : 1950;
    if (player.x > maxMapWidth) player.x = maxMapWidth;

    if (player.y > 420) {
        player.x = 50;
        player.y = 300;
        player.vy = 0;
        player.hp -= 15;
        addDamageText('-15 HP (Rơi vực)', player.x + 10, player.y - 15, '#ef4444');
    }

    cameraX = Math.max(0, Math.min(player.x - 300, (currentLevel === 3 ? 1400 : 2000) - 800));

    // CẬP NHẬT ĐẠN
    arrows.forEach(arrow => {
        arrow.update();
        enemies.forEach(enemy => {
            if (enemy.active && arrow.active &&
                arrow.x + 15 >= enemy.x && 
                arrow.x <= enemy.x + enemy.width &&
                arrow.y + 15 >= enemy.y && 
                arrow.y <= enemy.y + enemy.height) {
                
                enemy.hp -= arrow.damage;
                enemy.hitTimer = 5;
                arrow.active = false;
                playSound('hit');
                addDamageText(`-${arrow.damage}`, enemy.x + enemy.width / 2, enemy.y - 10, '#facc15');

                if (enemy.hp <= 0) {
                    enemy.active = false;
                    score += enemy.isBoss ? 500 : 50;
                }
            }
        });
    });
    arrows = arrows.filter(a => a.active);

    enemies.forEach(enemy => {
        enemy.update();

        if (enemy.isBoss && enemy.slashWave && enemy.slashWave.active && player.invincibleTimer === 0) {
            const wave = enemy.slashWave;
            if (player.x + player.width > wave.x && player.x < wave.x + wave.width &&
                player.y < wave.y + wave.height && player.y + player.height > wave.y) {
                if (!player.isCrouching) {
                    player.hp -= 25;
                    player.invincibleTimer = 35;
                    wave.active = false;
                    playSound('hit');
                    addDamageText('-25 HP', player.x + 10, player.y - 15, '#ef4444');
                }
            }
        }

        if (enemy.active && player.x + player.width > enemy.x && player.x < enemy.x + enemy.width &&
            player.y + player.height >= enemy.y && player.y + player.height <= enemy.y + 18 && player.vy > 0) {
            
            enemy.hp -= 40;
            enemy.hitTimer = 6;
            player.vy = -7.5;
            player.jumpCount = 1;
            playSound('hit');
            addDamageText('-40', enemy.x + enemy.width / 2, enemy.y - 10, '#f59e0b');

            if (enemy.hp <= 0) {
                enemy.active = false;
                score += enemy.isBoss ? 500 : 50;
            }
        } 
        else if (enemy.active && player.invincibleTimer === 0 &&
            player.x + player.width > enemy.x && player.x < enemy.x + enemy.width &&
            player.y + player.height > enemy.y && player.y < enemy.y + enemy.height) {
            
            const dmg = enemy.isBoss ? 30 : 15;
            player.hp -= dmg;
            player.invincibleTimer = 40;
            player.vx = player.x < enemy.x ? -5 : 5;
            playSound('hit');
            addDamageText(`-${dmg} HP`, player.x + 10, player.y - 15, '#ef4444');
        }
    });

    items.forEach(item => {
        if (item.active && Math.abs(player.x - item.x) < 25 && Math.abs(player.y - item.y) < 25) {
            item.active = false;
            if (item.type === 'coin') {
                coins += 1;
                score += 10;
                playSound('coin');
                addDamageText('+1 Xu', item.x, item.y - 10, '#ffd700');
            } else if (item.type === 'heal') {
                player.hp = Math.min(100, player.hp + 30);
                playSound('coin');
                addDamageText('+30 HP', item.x, item.y - 10, '#22c55e');
            }
        }
    });

    const allEnemiesDead = enemies.every(e => !e.active);
    const allItemsCollected = items.every(i => !i.active);
    const canPortal = allEnemiesDead && allItemsCollected;

    if (portal && canPortal &&
        player.x + player.width > portal.x &&
        player.y + player.height > portal.y) {
        loadLevel(currentLevel + 1);
    }

    if (currentLevel === 3 && allEnemiesDead && princess && player.x + player.width > princess.x) {
        gameState = 'VICTORY';
        const vicScreen = document.getElementById('victoryScreen');
        if (vicScreen) vicScreen.classList.remove('hidden');
        const vicScore = document.getElementById('victoryScore');
        if (vicScore) vicScore.innerText = `BẠN ĐÃ GIẢI CỨU THÀNH CÔNG CÔNG CHÚA PEACH!\nTổng Điểm: ${score} | Vàng dư: ${coins}`;
        return;
    }

    if (player.hp <= 0) {
        gameState = 'GAMEOVER';
        const goScreen = document.getElementById('gameOverScreen');
        if (goScreen) goScreen.classList.remove('hidden');
        const finalScore = document.getElementById('finalScore');
        if (finalScore) finalScore.innerText = 'Score: ' + score;
        return;
    }

    const isNight = Math.floor(gameTime / 60) % 2 === 1;

    ctx.fillStyle = isNight ? '#0b132b' : '#38bdf8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isNight) {
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(700, 70, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        stars.forEach(s => {
            ctx.fillRect(s.x, s.y, s.size, s.size);
        });
    } else {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(700, 70, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(700, 70, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            ctx.beginPath();
            ctx.moveTo(700 + Math.cos(a) * 34, 70 + Math.sin(a) * 34);
            ctx.lineTo(700 + Math.cos(a) * 46, 70 + Math.sin(a) * 46);
            ctx.stroke();
        }

        ctx.fillStyle = '#ffffffbb';
        ctx.beginPath();
        ctx.arc(200 - (cameraX * 0.2) % 800, 60, 22, 0, Math.PI * 2);
        ctx.arc(230 - (cameraX * 0.2) % 800, 60, 28, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = '#065f46';
    for (let treeX = 100; treeX < 2000; treeX += 250) {
        const drawTreeX = treeX - cameraX * 0.5;
        ctx.fillRect(drawTreeX + 15, 330, 10, 50);
        ctx.beginPath();
        ctx.arc(drawTreeX + 20, 320, 25, 0, Math.PI * 2);
        ctx.fill();
    }

    platforms.forEach(p => p.draw(ctx, cameraX));
    if (portal) portal.draw(ctx, cameraX, canPortal);

    if (princess) {
        const drawPx = princess.x - cameraX;
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(drawPx, princess.y, 20, 30);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(drawPx + 2, princess.y - 8, 16, 8);
        ctx.fillRect(drawPx + 6, princess.y - 14, 8, 6);
    }

    enemies.forEach(e => e.draw(ctx, cameraX));
    arrows.forEach(a => a.draw(ctx, cameraX));

    items.forEach(i => {
        if (!i.active) return;
        const drawX = i.x - cameraX;
        ctx.fillStyle = i.type === 'coin' ? '#ffd700' : '#ef4444';
        ctx.beginPath();
        ctx.arc(drawX, i.y, 7, 0, Math.PI * 2);
        ctx.fill();
    });

    player.draw(ctx, cameraX);

    damageTexts.forEach(dt => {
        dt.y += dt.vy;
        dt.alpha -= 0.02;
        ctx.fillStyle = dt.color;
        ctx.font = 'bold 15px Arial';
        ctx.globalAlpha = Math.max(0, dt.alpha);
        ctx.fillText(dt.text, dt.x - cameraX, dt.y);
        ctx.globalAlpha = 1.0;
    });
    damageTexts = damageTexts.filter(dt => dt.alpha > 0);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    let shopHint = coins >= 5 ? ' (ĐỦ MUA MÁU!)' : ` (${coins}/5 Vàng)`;
    ctx.fillText(`Màn: ${currentLevel} | HP: ${player.hp} | Vàng: ${coins}${shopHint} | S: Cúi | F: Chưởng Lửa | B: Shop`, 15, 25);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(15, 35, 120, 8);
    const ragePercent = Math.max(0, 1 - ((player.skillCooldown || 0) / (player.maxSkillCooldown || 60)));
    ctx.fillStyle = ragePercent >= 1 ? '#ff4500' : '#38bdf8';
    ctx.fillRect(15, 35, 120 * ragePercent, 8);
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.fillText(ragePercent >= 1 ? 'NỘ SẴN SÀNG (F)' : `HỒI NỘ: ${Math.ceil((player.skillCooldown || 0) / 60)}s`, 140, 42);

    if (portal && !canPortal) {
        ctx.fillStyle = '#f87171';
        ctx.font = '13px Arial';
        ctx.fillText(`🔒 Diệt hết quái & nhặt hết vàng để mở Cổng!`, 15, 62);
    }

    requestAnimationFrame(gameLoop);
}
