class Platform {
    constructor(x, y, width, height, isPortal = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isPortal = isPortal;
    }

    draw(ctx, cameraX, activePortal = false) {
        const drawX = this.x - cameraX;
        if (this.isPortal) {
            ctx.fillStyle = activePortal ? '#38bdf8' : '#475569';
            ctx.fillRect(drawX, this.y, this.width, this.height);
            if (activePortal) {
                ctx.fillStyle = '#f0abfc';
                ctx.fillRect(drawX + 5, this.y + 5, this.width - 10, this.height - 10);
            }
        } else {
            ctx.fillStyle = '#472e23';
            ctx.fillRect(drawX, this.y, this.width, this.height);
            ctx.fillStyle = '#15803d';
            ctx.fillRect(drawX, this.y, this.width, 6);
        }
    }
}