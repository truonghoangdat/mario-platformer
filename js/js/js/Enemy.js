class Enemy {
    constructor(x, y, rangeLeft, rangeRight, type = 'goomba') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.isBoss = (type === 'boss');
        this.isBat = (type === 'bat');
        
        this.width = this.isBoss ? 100 : (this.isBat ? 36 : 32);
        this.height = this.isBoss ? 90 : (this.isBat ? 20 : 32);
        this.speed = this.isBoss ? 1.4 : (this.isBat ? 2.3 : 1.3);
        this.dir = 1;
        this.rangeLeft = rangeLeft;
        this.rangeRight = rangeRight;
        this.hp = this.isBoss ? 450 : 40;
        this.maxHp = this.hp;
        this.active = true;
        this.hitTimer = 0;

        this.bossActionTimer = 0;
        this.bossState = 'WALK';
        this.slashWave = null;
    }

    update() {
        if (!this.active) return;

        if (this.isBoss) {
            this.bossActionTimer++;
            if (this.bossActionTimer > 140) {
                this.bossActionTimer = 0;
                if (Math.random() < 0.5) {
                    this.bossState = 'ROLL';
                } else {
                    this.bossState = 'SLASH';
                    this.slashWave = {
                        x: this.dir === 1 ? this.x + this.width : this.x - 60,
                        y: 350,
                        width: 60,
                        height: 25,
                        speed: this.dir * 7.5,
                        active: true
                    };
                }
                setTimeout(() => { this.bossState = 'WALK'; }, 2000);
            }

            if (this.bossState === 'ROLL') {
                this.x += this.speed * 2.2 * this.dir;
            } else {
                this.x += this.speed * this.dir;
            }

            if (this.slashWave && this.slashWave.active) {
                this.slashWave.x += this.slashWave.speed;
                if (Math.abs(this.slashWave.x - this.x) > 750) this.slashWave.active = false;
            }
        } else {
            this.x += this.speed * this.dir;
        }

        if (this.x >= this.rangeRight || this.x <= this.rangeLeft) {
            this.dir *= -1;
        }
        if (this.hitTimer > 0) this.hitTimer--;
    }

    draw(ctx, cameraX) {
        if (!this.active) return;
        const drawX = this.x - cameraX;

        if (this.isBoss) {
            // Model BOSS RỒNG KHỔNG LỒ
            ctx.fillStyle = this.hitTimer > 0 ? '#ffffff' : (this.bossState === 'ROLL' ? '#c2410c' : '#b91c1c');
            ctx.fillRect(drawX + 15, this.y + 20, 70, 60);
            ctx.fillRect(this.dir === 1 ? drawX + 55 : drawX + 5, this.y, 40, 30);
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.moveTo(this.dir === 1 ? drawX + 65 : drawX + 25, this.y);
            ctx.lineTo(this.dir === 1 ? drawX + 75 : drawX + 15, this.y - 18);
            ctx.lineTo(this.dir === 1 ? drawX + 85 : drawX + 35, this.y);
            ctx.fill();
            ctx.fillStyle = '#7f1d1d';
            ctx.beginPath();
            ctx.moveTo(drawX + 35, this.y + 20);
            ctx.lineTo(drawX + 10, this.y - 15);
            ctx.lineTo(drawX + 50, this.y + 20);
            ctx.fill();
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(this.dir === 1 ? drawX + 80 : drawX + 10, this.y + 8, 10, 8);

            if (this.slashWave && this.slashWave.active) {
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(this.slashWave.x - cameraX, this.slashWave.y, this.slashWave.width, this.slashWave.height);
            }
        } else if (this.isBat) {
            // Quái Dơi Bay
            ctx.fillStyle = this.hitTimer > 0 ? '#ffffff' : '#9333ea';
            ctx.fillRect(drawX + 10, this.y + 2, 16, 12);
            ctx.fillStyle = '#581c87';
            ctx.beginPath();
            ctx.moveTo(drawX, this.y);
            ctx.lineTo(drawX + 12, this.y + 10);
            ctx.lineTo(drawX, this.y + 18);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(drawX + 36, this.y);
            ctx.lineTo(drawX + 24, this.y + 10);
            ctx.lineTo(drawX + 36, this.y + 18);
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(drawX + 13, this.y + 4, 3, 3);
            ctx.fillRect(drawX + 19, this.y + 4, 3, 3);
        } else {
            // Quái Nấm
            ctx.fillStyle = this.hitTimer > 0 ? '#ffffff' : '#854d0e';
            ctx.beginPath();
            ctx.arc(drawX + 16, this.y + 14, 16, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(drawX + 6, this.y + 14, 20, 14);
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.dir === 1 ? drawX + 18 : drawX + 8, this.y + 16, 4, 6);
        }

        ctx.fillStyle = '#000';
        ctx.fillRect(drawX, this.y - 12, this.width, 5);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(drawX, this.y - 12, (this.hp / this.maxHp) * this.width, 5);
    }
}
