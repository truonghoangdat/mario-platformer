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
            // Khung cổng dịch chuyển đá cổ
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(drawX - 4, this.y - 4, this.width + 8, this.height + 4);
            ctx.fillStyle = activePortal ? '#0284c7' : '#475569';
            ctx.fillRect(drawX, this.y, this.width, this.height);

            if (activePortal) {
                const pulse = Math.sin(Date.now() / 150) * 3;
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(drawX + 4, this.y + 4, this.width - 8, this.height - 8);
                ctx.fillStyle = '#e0f2fe';
                ctx.fillRect(drawX + 10 - pulse / 2, this.y + 10, this.width - 20 + pulse, this.height - 20);
            } else {
                // Ổ khóa đỏ khi chưa mở cổng
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(drawX + this.width / 2 - 6, this.y + this.height / 2 - 6, 12, 12);
            }
            return;
        }

        // 1. Nền đất nâu chính
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(drawX, this.y, this.width, this.height);

        // 2. Họa tiết hạt đất & sỏi pixel theo từng ô 16x16
        const tileSize = 16;
        for (let tx = 0; tx < this.width; tx += tileSize) {
            const worldTileX = Math.floor((this.x + tx) / tileSize);
            for (let ty = 8; ty < this.height; ty += tileSize) {
                const hash = (worldTileX * 31 + Math.floor(ty / tileSize) * 17) % 7;
                ctx.fillStyle = hash < 3 ? '#432818' : '#784b2a';
                ctx.fillRect(drawX + tx + (hash * 2) % 10, this.y + ty + 2, 4, 4);
                if (this.height > 24) {
                    ctx.fillStyle = '#3b2110';
                    ctx.fillRect(drawX + tx + 8, this.y + ty + 8, 4, 4);
                }
            }

            // 3. Lớp cỏ pixel phủ trên mặt đất + răng cưa rủ xuống
            const grassW = Math.min(tileSize, this.width - tx);
            ctx.fillStyle = '#15803d';
            ctx.fillRect(drawX + tx, this.y, grassW, 6);
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(drawX + tx, this.y, grassW, 3);

            // Răng cưa cỏ rủ pixel
            const drop = (worldTileX % 2 === 0) ? 4 : 2;
            ctx.fillStyle = '#15803d';
            ctx.fillRect(drawX + tx + 2, this.y + 6, 4, drop);
            ctx.fillRect(drawX + tx + 10, this.y + 6, 4, drop === 4 ? 2 : 4);
        }

        // Viền tối đáy bục nhảy
        ctx.fillStyle = '#2d1a0e';
        ctx.fillRect(drawX, this.y + this.height - 2, this.width, 2);
    }
}
