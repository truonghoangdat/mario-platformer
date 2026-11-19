class Arrow {
    constructor(x, y, damage = 25, dir = 1) {
        this.x = x;
        this.y = y;
        this.width = 18;
        this.height = 12;
        this.dir = dir;
        this.speed = 7.5 * dir;
        this.damage = damage;
        this.traveled = 0;
        this.active = true;
    }

    update() {
        this.x += this.speed;
        this.traveled += Math.abs(this.speed);
        if (this.traveled > 850) {
            this.active = false;
        }
    }

    draw(ctx, cameraX) {
        if (!this.active) return;
        const drawX = this.x - cameraX;

        // Đuôi lửa kéo dài ngược hướng bay
        ctx.fillStyle = 'rgba(249, 115, 22, 0.75)';
        const tailX = this.dir === 1 ? drawX - 8 : drawX + 12;
        ctx.fillRect(tailX, this.y + 3, 12, 6);

        // Vòng cầu lửa ngoài màu đỏ cam
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(drawX + 9, this.y + 6, 8, 0, Math.PI * 2);
        ctx.fill();

        // Lõi lửa vàng sáng
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(drawX + 9 + this.dir * 2, this.y + 6, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}
