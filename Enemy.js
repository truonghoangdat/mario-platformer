class Enemy {
    constructor(x, y, type = 'goomba', range = 100, speed = 1.2) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = type === 'boss' ? 64 : 32;
        this.height = type === 'boss' ? 64 : 32;
        this.speed = speed;
        this.dir = type === 'boss' ? -1 : 1;
        this.rangeLeft = x - range;
        this.rangeRight = x + range;
        this.hp = type === 'boss' ? 350 : (type === 'bat' ? 40 : 25);
        this.maxHp = this.hp;
        this.active = true;
        this.hitTimer = 0;
        this.animTimer = 0;

        this.bossActionTimer = 0;
        this.bossState = 'walk';
        this.slashWave = null;
    }

    update() {
        if (!this.active) return;
        if (this.hitTimer > 0) this.hitTimer--;
        this.animTimer++;

        if (this.type === 'boss') {
            this.bossActionTimer++;
            if (this.bossState === 'walk') {
                this.x += this.speed * this.dir;
                if (this.x <= this.rangeLeft) this.dir = 1;
                if (this.x >= this.rangeRight) this.dir = -1;

                if (this.bossActionTimer >= 150) {
                    this.bossState = 'charge';
                    this.bossActionTimer = 0;
                }
            } else if (this.bossState === 'charge') {
                if (this.bossActionTimer >= 45) {
                    this.bossState = 'slash';
                    this.bossActionTimer = 0;
                    const waveDir = (window.player && window.player.x < this.x) ? -1 : 1;
                    this.dir = waveDir;
                    this.slashWave = {
                        x: waveDir === -1 ? this.x - 16 : this.x + this.width,
                        y: this.y + 18,
                        width: 22,
                        height: 44,
                        speed: 5.5 * waveDir,
                        active: true
                    };
                }
            } else if (this.bossState === 'slash') {
                if (this.bossActionTimer >= 35) {
                    this.bossState = 'walk';
                    this.bossActionTimer = 0;
                }
            }

            if (this.slashWave && this.slashWave.active) {
                this.slashWave.x += this.slashWave.speed;
                if (Math.abs(this.slashWave.x - this.x) > 850) {
                    this.slashWave.active = false;
                }
            }
        } else {
            this.x += this.speed * this.dir;
            if (this.x <= this.rangeLeft) this.dir = 1;
            if (this.x >= this.rangeRight) this.dir = -1;
        }
    }

    drawDragonBoss(ctx, drawX, y) {
        ctx.save();
        // Ảnh gốc của bạn quay mặt sang phải (dir === 1), lật ngang khi Boss quay sang trái (dir === -1)
        if (this.dir === -1) {
            ctx.translate(drawX + this.width, y);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(drawX, y);
        }

        const wingFlap = Math.sin(this.animTimer * 0.16) * 2.5;
        const step = Math.sin(this.animTimer * 0.22) * 3.5;

        const outlineColor = this.hitTimer > 0 ? '#ffffff' : '#7f1d3a';
        const bodyColor = this.hitTimer > 0 ? '#bae6fd' : '#38bdf8';
        const wingColor = this.hitTimer > 0 ? '#475569' : '#090d16';

        // 1. Cánh sau & Cánh chính màu đen viền đỏ sẫm (nhún nhịp nhàng)
        ctx.fillStyle = outlineColor;
        ctx.fillRect(4, 10 + wingFlap, 26, 28);
        ctx.fillRect(38, 8 + wingFlap, 22, 22);
        ctx.fillStyle = wingColor;
        ctx.fillRect(6, 12 + wingFlap, 22, 24);
        ctx.fillRect(40, 10 + wingFlap, 18, 18);

        // 2. Đuôi rồng uốn cong phía sau & vắt ngang dưới chân
        ctx.fillStyle = outlineColor;
        ctx.fillRect(10, 32, 10, 18);
        ctx.fillRect(14, 46, 36, 8);
        ctx.fillStyle = bodyColor;
        ctx.fillRect(12, 34, 6, 14);
        ctx.fillRect(16, 48, 32, 4);

        // 3. Thân rồng xanh dương
        ctx.fillStyle = outlineColor;
        ctx.fillRect(20, 22, 22, 24);
        ctx.fillStyle = bodyColor;
        ctx.fillRect(22, 24, 18, 20);

        // 4. Cổ, Đầu & Sừng nhỏ
        ctx.fillStyle = outlineColor;
        ctx.fillRect(32, 12, 18, 14);
        ctx.fillStyle = bodyColor;
        ctx.fillRect(34, 14, 16, 10);
        // Sừng trên đầu
        ctx.fillRect(36, 10, 3, 4);
        ctx.fillRect(41, 10, 3, 4);
        // Mắt đen
        ctx.fillStyle = '#000000';
        ctx.fillRect(42, 16, 3, 3);

        // 5. Hai chân bước qua lại (Animation so le)
        // Chân trái
        ctx.fillStyle = outlineColor;
        ctx.fillRect(22 + step, 44, 8, 16);
        ctx.fillStyle = bodyColor;
        ctx.fillRect(24 + step, 44, 4, 14);
        // Móng vuốt chân trái
        ctx.fillStyle = '#000000';
        ctx.fillRect(22 + step, 58, 3, 5);
        ctx.fillRect(27 + step, 58, 3, 5);

        // Chân phải
        ctx.fillStyle = outlineColor;
        ctx.fillRect(33 - step, 44, 8, 16);
        ctx.fillStyle = bodyColor;
        ctx.fillRect(35 - step, 44, 4, 14);
        // Móng vuốt chân phải
        ctx.fillStyle = '#000000';
        ctx.fillRect(33 - step, 58, 3, 5);
        ctx.fillRect(38 - step, 58, 3, 5);

        ctx.restore();
    }

    draw(ctx, cameraX) {
        if (!this.active) return;
        const drawX = this.x - cameraX;

        if (this.type === 'goomba') {
            const footStep = Math.sin(this.animTimer * 0.25) * 2;
            // Mũ nấm nâu + đốm sáng
            ctx.fillStyle = this.hitTimer > 0 ? '#ffffff' : '#854d0e';
            ctx.beginPath();
            ctx.arc(drawX + 16, this.y + 14, 16, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#a16207';
            ctx.fillRect(drawX + 8, this.y + 5, 5, 4);
            ctx.fillRect(drawX + 19, this.y + 6, 4, 4);

            // Thân nấm kem
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(drawX + 7, this.y + 14, 18, 13);

            // Mắt & Lông mày giận
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.dir === 1 ? drawX + 18 : drawX + 9, this.y + 16, 4, 5);
            ctx.fillRect(this.dir === 1 ? drawX + 16 : drawX + 9, this.y + 15, 6, 2);

            // Chân bước
            ctx.fillStyle = '#451a03';
            ctx.fillRect(drawX + 5 + footStep, this.y + 27, 8, 5);
            ctx.fillRect(drawX + 19 - footStep, this.y + 27, 8, 5);

        } else if (this.type === 'bat') {
            const flap = Math.sin(this.animTimer * 0.35) * 5;
            ctx.fillStyle = this.hitTimer > 0 ? '#ffffff' : '#7e22ce';
            // Thân dơi
            ctx.fillRect(drawX + 9, this.y + 8, 14, 14);
            // Tai nhọn
            ctx.fillRect(drawX + 9, this.y + 4, 3, 4);
            ctx.fillRect(drawX + 20, this.y + 4, 3, 4);
            // Cánh đập
            ctx.fillStyle = '#581c87';
            ctx.beginPath();
            ctx.moveTo(drawX + 9, this.y + 12);
            ctx.lineTo(drawX - 4, this.y + 6 + flap);
            ctx.lineTo(drawX + 9, this.y + 20);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(drawX + 23, this.y + 12);
            ctx.lineTo(drawX + 36, this.y + 6 + flap);
            ctx.lineTo(drawX + 23, this.y + 20);
            ctx.fill();

            // Mắt đỏ
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(drawX + 11, this.y + 12, 3, 3);
            ctx.fillRect(drawX + 18, this.y + 12, 3, 3);

        } else if (this.type === 'boss') {
            if (this.bossState === 'charge') {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
                ctx.beginPath();
                ctx.arc(drawX + 32, this.y + 32, 42 + Math.sin(this.animTimer * 0.4) * 5, 0, Math.PI * 2);
                ctx.fill();
            }

            this.drawDragonBoss(ctx, drawX, this.y);

            if (this.slashWave && this.slashWave.active) {
                const waveDrawX = this.slashWave.x - cameraX;
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(waveDrawX, this.slashWave.y, this.slashWave.width, this.slashWave.height);
                ctx.fillStyle = '#fde047';
                ctx.fillRect(waveDrawX + 5, this.slashWave.y + 4, this.slashWave.width - 10, this.slashWave.height - 8);
            }
        }

        // Thanh máu trên đầu quái
        if (this.hp < this.maxHp || this.type === 'boss') {
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(drawX - 1, this.y - 12, this.width + 2, 7);
            ctx.fillStyle = this.type === 'boss' ? '#ef4444' : '#22c55e';
            ctx.fillRect(drawX, this.y - 11, (this.hp / this.maxHp) * this.width, 5);
        }
    }
}
