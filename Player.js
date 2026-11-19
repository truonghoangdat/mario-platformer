class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.normalHeight = 42;
        this.crouchHeight = 20;
        this.height = this.normalHeight;
        this.vx = 0;
        this.vy = 0;
        this.speed = 2.8;
        this.jumpPower = -9.6;
        this.hp = 100;
        this.maxHp = 100;
        this.isGrounded = false;
        this.isCrouching = false;
        this.invincibleTimer = 0;
        this.facing = 1; // 1: quay phải, -1: quay trái
        
        this.jumpCount = 0;
        this.maxJumps = 2;

        this.skillCooldown = 0;
        this.maxSkillCooldown = 45;
        this.castTimer = 0;
        this.walkTimer = 0;
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
        this.vy += 0.36;

        if (this.skillCooldown > 0) this.skillCooldown--;
        if (this.castTimer > 0) this.castTimer--;

        if (this.vx > 0) {
            this.facing = 1;
            this.walkTimer++;
        } else if (this.vx < 0) {
            this.facing = -1;
            this.walkTimer++;
        } else {
            this.walkTimer = 0;
        }

        if ((keys['s'] || keys['S'] || keys['KeyS'] || keys['ArrowDown']) && this.isGrounded) {
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
        const currentMapMax = (window.currentLevel === 4 ? 2200 : 3200);
        if (this.x + this.width > currentMapMax) this.x = currentMapMax - this.width;

        if (this.invincibleTimer > 0) this.invincibleTimer--;
    }

    draw(ctx, cameraX) {
        if (this.invincibleTimer % 4 > 2) return;
        const drawX = this.x - cameraX;
        const stepOffset = (this.isGrounded && Math.abs(this.vx) > 0) ? Math.sin(this.walkTimer * 0.35) * 3 : 0;

        if (this.isCrouching) {
            // Mũ đỏ
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(drawX + 2, this.y, 26, 6);
            // Mặt
            ctx.fillStyle = '#fed7aa';
            ctx.fillRect(drawX + 5, this.y + 6, 20, 6);
            // Mắt
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(this.facing === 1 ? drawX + 19 : drawX + 8, this.y + 7, 3, 3);
            // Quần yếm xanh
            ctx.fillStyle = '#1d4ed8';
            ctx.fillRect(drawX + 3, this.y + 12, 24, 8);
            return;
        }

        // Áo đỏ bên trong
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(drawX + 4, this.y + 14, 22, 12);

        // Quần yếm xanh dương + khuy vàng
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(drawX + 6, this.y + 20, 18, 16);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(drawX + 8, this.y + 21, 3, 3);
        ctx.fillRect(drawX + 19, this.y + 21, 3, 3);

        // Tay & Găng tay trắng (vươn ra khi tung chưởng lửa)
        ctx.fillStyle = '#ffffff';
        if (this.castTimer > 0) {
            const handX = this.facing === 1 ? drawX + 24 : drawX - 6;
            ctx.fillRect(handX, this.y + 15, 10, 6);
            ctx.fillStyle = '#f97316';
            ctx.fillRect(this.facing === 1 ? handX + 8 : handX - 6, this.y + 14, 8, 8);
        } else {
            ctx.fillRect(drawX + 2, this.y + 22 - stepOffset * 0.5, 5, 5);
            ctx.fillRect(drawX + 23, this.y + 22 + stepOffset * 0.5, 5, 5);
        }

        // Đầu & Khuôn mặt
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(drawX + 6, this.y + 5, 18, 10);
        // Tóc nâu sau gáy
        ctx.fillStyle = '#78350f';
        ctx.fillRect(this.facing === 1 ? drawX + 5 : drawX + 21, this.y + 6, 4, 7);
        // Mắt & Ria mép
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(this.facing === 1 ? drawX + 18 : drawX + 9, this.y + 7, 3, 3);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(this.facing === 1 ? drawX + 16 : drawX + 7, this.y + 12, 7, 2);

        // Mũ lưỡi trai đỏ
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(drawX + 4, this.y, 22, 5);
        ctx.fillRect(this.facing === 1 ? drawX + 12 : drawX, this.y + 3, 18, 3);

        // Giày nâu chuyển động bước chân
        ctx.fillStyle = '#78350f';
        ctx.fillRect(drawX + 2 + stepOffset, this.y + 36, 11, 6);
        ctx.fillRect(drawX + 17 - stepOffset, this.y + 36, 11, 6);
    }
}
