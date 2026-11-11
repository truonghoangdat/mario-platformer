class Arrow {
    constructor(x, y, damage = 25) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 8;
        this.speed = 9;
        this.damage = damage;
        this.active = true;
    }

    update() {
        this.x += this.speed;
        if (this.x > 2000) {
            this.active = false;
        }
    }

    draw(ctx, cameraX) {
        if (!this.active) return;
        const drawX = this.x - cameraX;

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(drawX + 8, this.y + 4, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(drawX + 6, this.y + 4, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}
