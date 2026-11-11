class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.normalHeight = 42;
        this.crouchHeight = 18;
        this.height = this.normalHeight;
        this.vx = 0;
        this.vy = 0;
        this.speed = 3.8;
        this.jumpPower = -10.2;
        this.hp = 100;
        this.isGrounded = false;
        this.isCrouching = false;
        this.invincibleTimer = 0;
        
        this.jumpCount = 0;
        this.maxJumps = 2;

        this.skillCooldown = 0;
        this.maxSkillCooldown = 600;
        this.castTimer = 0;
    }

    jump() {
        if (this.isGrounded) {
            this.vy = this.jumpPower;
            this.jumpCount = 1;
            this.isGrounded = false;
            if (window.playSound) playSound('jump');
        } else if (this.jumpCount < this.maxJumps) {
            this.vy = this.jumpPower * 0.92;
            this.jumpCount++;
            if (window.playSound) playSound('jump');
        }
    }

    update(platforms, keys) {
        this.vy += 0.38;

        if (this.skillCooldown > 0) this.skillCooldown--;
        if (this.castTimer > 0) this.castTimer--;

        if ((keys['s'] || keys['S'] || keys['ArrowDown']) && this.isGrounded) {
            if (!this.isCrouching) {
                this.y += (this.normalHeight - this.crouchHeight);
            }
            this.isCrouching = true;
            this.height = this.crouchHeight;
        } else {
            if (this.isCrouching) {
                this.y -= (this.normalHeight - this.crouchHeight);
            }
            this.isCrouching = false;
            this.height = this.normalHeight;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.isGrounded = false;

        platforms.forEach(p => {
            if (!p.isPortal && 
                this.x + this.width > p.x && 
                this.x < p.x + p.width &&
                this.y + this.height >= p.y &&
                this.y + this.height <= p.y + 14 &&
                this.vy >= 0) {
                this.y = p.y - this.height;
                this.vy = 0;
                this.isGrounded = true;
                this.jumpCount = 0;
            }
        });

        if (this.x < 0) this.x = 0;
        const currentMapMax = (window.currentLevel === 3 ? 1400 : 2000);
        if (this.x + this.width > currentMapMax) this.x = currentMapMax - this.width;

        if (this.invincibleTimer > 0) this.invincibleTimer--;
    }

    draw(ctx, cameraX) {
        if (this.invincibleTimer % 4 > 2) return;
        const drawX = this.x - cameraX;

        if (this.isCrouching) {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(drawX, this.y, 30, 6);
            ctx.fillStyle = '#fde047';
            ctx.fillRect(drawX + 4, this.y + 6, 22, 5);
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(drawX + 2, this.y + 11, 26, 7);
        } else {
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(drawX + 5, this.y + 20, 20, 16);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(drawX + 3, this.y + 12, 24, 10);
            
            if (this.castTimer > 0) {
                ctx.fillStyle = '#ff4500';
                ctx.fillRect(drawX + 26, this.y + 10, 14, 8);
            }

            ctx.fillStyle = '#fde047';
            ctx.fillRect(drawX + 5, this.y + 5, 20, 9);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(drawX + 3, this.y, 24, 6);
            ctx.fillRect(drawX + (this.vx >= 0 ? 12 : 0), this.y + 4, 16, 3);
            ctx.fillStyle = '#78350f';
            ctx.fillRect(drawX, this.y + 36, 12, 6);
            ctx.fillRect(drawX + 18, this.y + 36, 12, 6);
        }
    }
}