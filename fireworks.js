let explodedCount = 0;
const greeting = document.getElementById('greeting');

const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
const boomSound = document.getElementById('boom');
const boom2Sound = document.getElementById('boom2');
const boom3Sound = document.getElementById('boom3');
const startScreen = document.getElementById('startScreen');
const content = document.getElementById('content');
const typingTitle = document.querySelector('.typing');
const typingText1 = document.querySelector('.typing-1');
const typingText2 = document.querySelector('.typing-2');
const textLines = document.querySelectorAll('.text-line');
const typingTexts = document.querySelectorAll('.typing-text');
const codeLines = document.querySelectorAll('.code-line');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Firework {
    constructor(x, targetY) {
        this.x = x;
        this.y = canvas.height;
        this.targetY = targetY;
        this.speed = 3 + Math.random() * 4;
        this.particles = [];
        this.exploded = false;
        this.trail = [];
        
        // 播放上升音效
        const sound1 = boomSound.cloneNode();
        sound1.volume = 0.2;
        sound1.play().catch(e => console.log('音频播放失败'));
    }

    update() {
        if (!this.exploded) {
            this.trail.push({ x: this.x, y: this.y, alpha: 1 });
            if (this.trail.length > 20) this.trail.shift();
            
            this.y -= this.speed;
            if (this.y <= this.targetY) {
                this.explode();
            }
        } else {
            this.particles.forEach((particle, i) => {
                particle.vx *= 0.99;
                particle.vy *= 0.99;
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.15;
                particle.alpha -= 0.006;
                particle.size *= 0.96;

                if (particle.alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            });
        }

        this.trail.forEach(dot => dot.alpha *= 0.95);
    }

    explode() {
        const particleCount = 150;
        const baseHue = Math.random() * 360;
        
        // 播放爆炸音效
        const sound2 = boom2Sound.cloneNode();
        sound2.volume = 0.2;
        sound2.play().catch(e => console.log('音频播放失败'));
        
        // 监听第二个音效结束，然后播放第三个音效
        sound2.onended = () => {
            const sound3 = boom3Sound.cloneNode();
            sound3.volume = 0.2;
            sound3.play().catch(e => console.log('音频播放失败'));
        };

        // 只在用户点击时增加计数
        if (!this.isAutomatic) {
            explodedCount++;
            
            // 在第8个烟花爆炸时显示祝福语并折叠开头文字
            if (explodedCount === 8) {
                greeting.classList.add('show');
                content.classList.add('fold');  // 添加折叠效果
                createCelebrationFireworks();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            const angle = (i * Math.PI * 2) / particleCount + Math.random() * 0.5;
            const speed = 1.5 + Math.random() * 4;
            
            const hue = baseHue + Math.random() * 30 - 15;
            const brightness = 50 + Math.random() * 20;
            const saturation = 80 + Math.random() * 20;

            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                size: 2 + Math.random() * 2,
                color: `hsla(${hue}, ${saturation}%, ${brightness}%, `
            });
        }
        this.exploded = true;
    }

    draw() {
        if (!this.exploded) {
            this.trail.forEach(dot => {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 220, 180, ${dot.alpha})`;
                ctx.fill();
            });

            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 220, 180, 1)';
            ctx.fill();
        } else {
            this.particles.forEach(particle => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color + particle.alpha + ')';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = particle.color + (particle.alpha * 0.3) + ')';
                ctx.fill();
            });
        }
    }

    isDead() {
        return this.exploded && this.particles.length === 0;
    }
}

let fireworks = [];

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新和绘制所有烟花
    fireworks = fireworks.filter(firework => {
        firework.update();
        firework.draw();
        return !firework.isDead();
    });

    requestAnimationFrame(animate);
}

// 开始动画
animate();

// 修改点燃功能
startScreen.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    
    setTimeout(() => {
        content.classList.add('show');
        
        // 逐行显示祝福语
        const texts = document.querySelectorAll('.typing-text');
        texts.forEach((text, index) => {
            setTimeout(() => {
                text.textContent = text.getAttribute('data-text');
                text.classList.add('show');
                
                // 每显示一行文字就放一组烟花
                createAutoFireworks(3);
            }, index * 1200);
        });
        
        createInitialFireworks();
    }, 500);
});

// 添加自动放烟花函数
function createAutoFireworks(count) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const x = Math.random() * canvas.width;
            const targetY = canvas.height * (0.2 + Math.random() * 0.3);
            const firework = new Firework(x, targetY);
            firework.isAutomatic = true;  // 标记为自动烟花
            fireworks.push(firework);
        }, i * 200); // 每个烟花间隔200ms
    }
}

// 添加初始烟花函数
function createInitialFireworks() {
    // 创建多个初始烟花
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const x = Math.random() * canvas.width;
            const targetY = canvas.height * (0.2 + Math.random() * 0.4);
            const firework = new Firework(x, targetY);
            fireworks.push(firework);
        }, i * 300); // 每隔300ms发射一个
    }
}

// 修改点击事件，让烟花随机出现
canvas.addEventListener('click', (e) => {
    if (startScreen.classList.contains('hidden')) {
        const x = Math.random() * canvas.width;
        const targetY = canvas.height * (0.2 + Math.random() * 0.4);
        const firework = new Firework(x, targetY);
        firework.isAutomatic = false;  // 标记为手动烟花
        fireworks.push(firework);
    }
});

// 调整画布大小
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// 解锁音频（需要用户交互）
document.addEventListener('click', function unlockAudio() {
    boomSound.play().then(() => {
        boomSound.pause();
        boomSound.currentTime = 0;
    });
    boom2Sound.play().then(() => {
        boom2Sound.pause();
        boom2Sound.currentTime = 0;
    });
    boom3Sound.play().then(() => {
        boom3Sound.pause();
        boom3Sound.currentTime = 0;
    });
    document.removeEventListener('click', unlockAudio);
});

// 添加庆祝烟花函数
function createCelebrationFireworks() {
    // 在祝福语显示时创建多个烟花
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const x = Math.random() * canvas.width;
            const targetY = canvas.height * 0.3 + Math.random() * canvas.height * 0.2;
            const firework = new FireWork(x, targetY);
            fireworks.push(firework);
        }, i * 200);
    }
} 