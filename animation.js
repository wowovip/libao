// 音乐控制
const bgMusic = document.getElementById('bgMusic');
const musicBox = document.querySelector('.music-box');
const musicImg = document.querySelector('.music-img');

// 设置初始音量
bgMusic.volume = 0.3;

// 音乐控制功能
musicBox.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play();
        musicImg.classList.remove('paused');
    } else {
        bgMusic.pause();
        musicImg.classList.add('paused');
    }
});

// 处理自动播放
document.addEventListener('click', function initAudio() {
    bgMusic.play().then(() => {
        musicImg.classList.remove('paused');
    }).catch(e => {
        console.log('音频播放失败:', e);
    });
    document.removeEventListener('click', initAudio);
}); 