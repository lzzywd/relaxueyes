<template>
  <div class="lock-screen">
    <div class="timer">{{ formatTime(remainingTime) }}</div>
    <div class="message">休息一下，让眼睛放松...</div>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron');

export default {
  name: 'LockScreen',
  data() {
    return {
      remainingTime: 0,
      timer: null
    };
  },
  methods: {
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    startCountdown(duration) {
      if (this.timer) {
        clearInterval(this.timer);
      }
      
      this.remainingTime = duration;
      console.log('开始休息倒计时，持续时间:', duration, '秒');

      this.timer = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--;
          ipcRenderer.send('update-timer', this.remainingTime);
        } else {
          this.handleCountdownComplete();
        }
      }, 1000);
    },
    handleCountdownComplete() {
      console.log('休息时间结束');
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      ipcRenderer.send('rest-complete');
    }
  },
  mounted() {
    console.log('Lock 组件已挂载');
    ipcRenderer.on('start-rest', (event, duration) => {
      console.log('收到开始休息信号，持续时间:', duration);
      this.startCountdown(duration);
    });
  },
  beforeUnmount() {
    console.log('Lock 组件即将卸载');
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    ipcRenderer.removeAllListeners('start-rest');
  }
};
</script>

<style>
.lock-screen {
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  backdrop-filter: blur(10px);
}

.timer {
  font-size: 120px;
  font-weight: 200;
  margin-bottom: 20px;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.message {
  font-size: 24px;
  opacity: 0.8;
  color: #fff;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
}
</style> 