class Arrow {
    constructor(x, y, damage = 25) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 14;
        this.speed = 12; // Bay thẳng tốc độ cao
        this.damage = damage;
        this.active = true;
    }

    update() {
        this.x += this.speed;
        if (this.x > 2500) this.active = false;
    }

    draw(ctx, cameraX) {
        const drawX = this.x - cameraX;
        
        // Vệt đuôi lửa kéo dài
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.fillRect(drawX - 12, this.y + 3, 12, 8);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.fillRect(drawX - 6, this.y + 2, 8, 10);

        // Đầu ngọn lửa bùng nổ
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(drawX + 8, this.y + 7, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(drawX + 8, this.y + 7, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(drawX + 10, this.y + 7, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}