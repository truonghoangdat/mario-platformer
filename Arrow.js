class Arrow {
    constructor(x, y, damage = 25) {
        this.x = x;
        this.y = y;
        this.width = 18;
        this.height = 12;
        this.speed = 9;
        this.damage = damage;
        this.traveled = 0;
        this.active = true;
    }

    update() {
        this.x += this.speed;
        this.traveled += Math.abs(this.speed);
        if (this.traveled > 900) {
            this.active = false;
        }
    }

    draw(ctx, cameraX) {
        if (!this.active) return;
        const drawX = this.x - cameraX;

        ctx.fillStyle = '#ff4500';
        ctx.beginPath();
        ctx.arc(drawX + 9, this.y + 6, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(drawX + 10, this.y + 6, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}
