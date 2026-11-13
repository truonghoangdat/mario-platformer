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
let currentMapWidth = 3200;

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
        currentMapWidth = 3200;
        platforms = [
            new Platform(0, 380, 3200, 70),
            new Platform(180, 280, 200, 18),
            new Platform(440, 210, 200, 18),
            new Platform(720, 280, 200, 18),
            new Platform(1000, 210, 200, 18),
            new Platform(1280, 280, 220, 18),
            new Platform(1580, 200, 220, 18),
            new Platform(1880, 270, 220, 18),
            new Platform(2180, 190, 220, 18),
            new Platform(2480, 270, 220, 18),
            new Platform(2780, 210, 200, 18)
        ];
        enemies = [
            new Enemy(220, 248, 190, 360, 'goomba'),
            new Enemy(740, 248, 730, 900, 'goomba'),
            new Enemy(1020, 178, 1010, 1180, 'goomba'),
            new Enemy(1320, 248, 1300, 1480, 'goomba'),
            new Enemy(1620, 168, 1600, 1780, 'goomba'),
            new Enemy(2220, 158, 2200, 2380, 'goomba'),
            new Enemy(2520, 238, 2500, 2680, 'goomba')
        ];
        items = [
            { type: 'coin', x: 250, y: 240, active: true },
            { type: 'coin', x: 500, y: 170, active: true },
            { type: 'coin', x: 1050, y: 170, active: true },
            { type: 'heal', x: 1350, y: 240, active: true },
            { type: 'coin', x: 1650, y: 160, active: true },
            { type: 'coin', x: 2250, y: 150, active: true },
            { type: 'heal', x: 2550, y: 230, active: true },
            { type: 'coin', x: 2850, y: 170, active: true }
        ];
        portal = new Platform(3080, 310, 45, 70, true);
        princess = null;

    } else if (lvl === 2) {
        currentMapWidth = 3200;
        platforms = [
            new Platform(0, 380, 3200, 70),
            new Platform(180, 290, 180, 18),
            new Platform(420, 220, 180, 18),
            new Platform(680, 170, 180, 18),
            new Platform(960, 260, 200, 18),
            new Platform(1260, 210, 200, 18),
            new Platform(1560, 270, 200, 18),
            new Platform(1860, 190, 200, 18),
            new Platform(2160, 260, 200, 18),
            new Platform(2460, 180, 200, 18),
            new Platform(2760, 250, 200, 18)
        ];
        enemies = [
            new Enemy(200, 258, 190, 340, 'goomba'),
            new Enemy(440, 330, 380, 620, 'bat'),
            new Enemy(980, 330, 920, 1160, 'bat'),
            new Enemy(1280, 178, 1270, 1440, 'goomba'),
            new Enemy(1580, 330, 1520, 1760, 'bat'),
            new Enemy(1880, 158, 1870, 2040, 'goomba'),
            new Enemy(2180, 330, 2120, 2360, 'bat'),
            new Enemy(2480, 148, 2470, 2640, 'goomba'),
            new Enemy(2780, 330, 2720, 2960, 'bat')
        ];
        items = [
            { type: 'coin', x: 230, y: 250, active: true },
            { type: 'coin', x: 460, y: 180, active: true },
            { type: 'coin', x: 720, y: 130, active: true },
            { type: 'coin', x: 1300, y: 170, active: true },
            { type: 'heal', x: 1620, y: 230, active: true },
            { type: 'coin', x: 1920, y: 150, active: true },
            { type: 'coin', x: 2520, y: 140, active: true },
            { type: 'heal', x: 2820, y: 210, active: true }
        ];
        portal = new Platform(3080, 310, 45, 70, true);
        princess = null;

    } else if (lvl === 3) {
        currentMapWidth = 3200;
        platforms = [
            new Platform(0, 380, 3200, 70),
            new Platform(200, 280, 200, 18),
            new Platform(480, 200, 200, 18),
            new Platform(780, 270, 220, 18),
            new Platform(1100, 190, 220, 18),
            new Platform(1420, 270, 220, 18),
            new Platform(1740, 180, 220, 18),
            new Platform(2060, 260, 220, 18),
            new Platform(2380, 190, 220, 18),
            new Platform(2700, 260, 220, 18)
        ];
        enemies = [
            new Enemy(220, 248, 210, 380, 'goomba'),
            new Enemy(500, 330, 440, 700, 'bat'),
            new Enemy(800, 238, 790, 980, 'goomba'),
            new Enemy(1120, 158, 1110, 1300, 'goomba'),
            new Enemy(1440, 330, 1380, 1660, 'bat'),
            new Enemy(1760, 148, 1750, 1940
