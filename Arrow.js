arrows.forEach(arrow => {
        arrow.update();
        enemies.forEach(enemy => {
            // Kiểm tra va chạm Hitbox mở rộng cho cả Dơi và Goomba
            if (enemy.active && arrow.active &&
                arrow.x + 10 >= enemy.x && 
                arrow.x <= enemy.x + enemy.width &&
                arrow.y + 10 >= enemy.y && 
                arrow.y <= enemy.y + enemy.height) {
                
                enemy.hp -= arrow.damage;
                enemy.hitTimer = 5;
                arrow.active = false; // Xóa đạn sau khi trúng
                playSound('hit');
                addDamageText(`-${arrow.damage}`, enemy.x + enemy.width / 2, enemy.y - 10, '#facc15');

                if (enemy.hp <= 0) {
                    enemy.active = false;
                    score += enemy.isBoss ? 500 : 50;
                }
            }
        });
    });
