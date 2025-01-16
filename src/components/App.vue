<template>
  <div class="app-container">
    <div class="title-bar">
      <div class="window-controls">
        <button class="window-control minimize" @click="minimizeWindow" title="最小化">
          <svg width="12" height="2" viewBox="0 0 12 2">
            <rect width="12" height="2" fill="currentColor"/>
          </svg>
        </button>
        <button class="window-control close" @click="closeWindow" title="关闭">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="timer-circle" :style="{ background: isRunning ? 'rgba(76, 175, 80, 0.9)' : 'rgba(102, 102, 102, 0.9)' }">
      <div class="timer">{{ displayTime }}</div>
      <div class="mode">{{ isWorking ? 'FOCUS' : 'BREAK' }}</div>
    </div>
    <div class="controls">
      <button @click="reset" title="重置" class="icon-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C13.2792 4 14.4926 4.28445 15.5826 4.80154M19 4V8H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button @click="start" v-if="!isRunning" title="开始" class="icon-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 4.99999V19C5 19.3466 5.17772 19.6684 5.47852 19.8506C5.77931 20.0329 6.15285 20.0494 6.47 19.894L19.47 12.894C19.8016 12.7299 20 12.3789 20 12C20 11.621 19.8016 11.27 19.47 11.106L6.47 4.10599C6.15285 3.95054 5.77931 3.96708 5.47852 4.14933C5.17772 4.33157 5 4.65337 5 4.99999Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button @click="stop" v-if="isRunning" title="暂停" class="icon-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5V19M16 5V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button @click="skip" title="跳过" class="icon-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 5V19M5 5L15 12L5 19V5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button @click="showSettings = !showSettings" title="设置" class="icon-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    
    <div class="settings-panel" v-if="showSettings">
      <div class="setting-item">
        <label>工作时长 (分钟)</label>
        <input type="number" v-model="workDuration" :disabled="isRunning" min="1" max="60">
      </div>
      <div class="setting-item">
        <label>休息时长 (分钟)</label>
        <input type="number" v-model="restDuration" :disabled="isRunning" min="1" max="30">
      </div>
      <div class="setting-item">
        <label>强制休息</label>
        <label class="switch">
          <input type="checkbox" v-model="forceRest">
          <span class="slider"></span>
        </label>
      </div>
      <div class="setting-item">
        <label>显示进度悬浮窗</label>
        <label class="switch">
          <input type="checkbox" v-model="showProgress">
          <span class="slider"></span>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron');

export default {
  name: 'App',
  data() {
    return {
      time: 25 * 60,
      isRunning: false,
      isWorking: true,
      timer: null,
      workDuration: 25,
      restDuration: 5,
      showSettings: false,
      forceRest: true,
      showProgress: true,
    };
  },
  computed: {
    displayTime() {
      const minutes = Math.floor(this.time / 60);
      const seconds = this.time % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  },
  methods: {
    start() {
      if (!this.timer) {
        this.isRunning = true;
        this.time = this.isWorking ? this.workDuration * 60 : this.restDuration * 60;
        console.log(`开始${this.isWorking ? '工作' : '休息'}时间: ${this.time}秒`);
        
        this.timer = setInterval(() => {
          if (this.time > 0) {
            this.time--;
            if (this.isWorking) {
              console.log(`当前工作时间剩余: ${this.time}秒`);
              if (this.time === 30) {
                console.log('=== 触发30秒提醒条件 ===');
                ipcRenderer.send('show-reminder');
              }
            }
            ipcRenderer.send('update-timer', this.time);
          } else {
            this.handleTimerComplete();
          }
        }, 1000);
      }
    },
    stop() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
        this.isRunning = false;
        console.log('计时器已暂停');
      }
    },
    reset() {
      this.stop();
      this.isWorking = true;
      this.time = this.workDuration * 60;
      ipcRenderer.send('update-timer', this.time);
      console.log('计时器已重置为工作时间');
    },
    skip() {
      this.stop();
      this.isWorking = !this.isWorking;
      this.time = this.isWorking ? this.workDuration * 60 : this.restDuration * 60;
      
      if (!this.isWorking) {
        console.log('跳过工作时间，进入休息');
        this.startRest();
      } else {
        console.log('跳过休息时间，开始新的工作时间');
        this.start();
      }
    },
    handleTimerComplete() {
      console.log('当前阶段完成');
      this.stop();
      
      if (this.isWorking) {
        console.log('工作时间结束，进入休息时间');
        this.isWorking = false;
        this.startRest();
      } else {
        console.log('休息时间结束，开始新的工作时间');
        this.isWorking = true;
        this.time = this.workDuration * 60;
        this.start();
      }
    },
    startRest() {
      this.time = this.restDuration * 60;
      if (this.forceRest) {
        ipcRenderer.send('lock-screen', this.restDuration * 60);
      } else {
        this.start();
      }
    },
    async loadSettings() {
      try {
        const settings = await ipcRenderer.invoke('get-settings');
        if (settings) {
          this.workDuration = settings.workDuration || 25;
          this.restDuration = settings.restDuration || 5;
          this.forceRest = settings.forceRest !== undefined ? settings.forceRest : true;
          this.showProgress = settings.showProgress !== undefined ? settings.showProgress : true;
          this.time = this.workDuration * 60;
        }
      } catch (error) {
        console.error('加载设置失败:', error);
      }
    },
    saveSettings() {
      ipcRenderer.send('save-settings', {
        workDuration: this.workDuration,
        restDuration: this.restDuration,
        forceRest: this.forceRest,
        showProgress: this.showProgress
      });
      if (!this.isRunning) {
        this.time = this.isWorking ? this.workDuration * 60 : this.restDuration * 60;
      }
      
      ipcRenderer.send('update-progress-window', this.showProgress);
    },
    extendWorkTime(minutes) {
      if (this.isWorking && this.isRunning) {
        this.time += minutes * 60;
        console.log(`延长工作时间 ${minutes} 分钟，当前剩余时间: ${this.time}秒`);
      }
    },
    minimizeWindow() {
      ipcRenderer.send('minimize-window');
    },
    closeWindow() {
      ipcRenderer.send('close-window');
    },
  },
  watch: {
    workDuration() {
      this.saveSettings();
    },
    restDuration() {
      this.saveSettings();
    },
    forceRest() {
      this.saveSettings();
    },
    showProgress() {
      this.saveSettings();
    }
  },
  mounted() {
    this.loadSettings();
    
    ipcRenderer.on('rest-complete', () => {
      console.log('收到休息完成信号，开始新的工作时间');
      this.isWorking = true;
      this.time = this.workDuration * 60;
      this.start();
    });

    ipcRenderer.on('get-current-state', () => {
      ipcRenderer.send('current-state-update', {
        isWorking: this.isWorking,
        totalTime: this.isWorking ? this.workDuration * 60 : this.restDuration * 60,
        currentTime: this.time
      });
    });

    ipcRenderer.on('extend-work-time', (event, minutes) => {
      this.extendWorkTime(minutes);
    });
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    ipcRenderer.removeAllListeners('rest-complete');
    ipcRenderer.removeAllListeners('update-timer');
    ipcRenderer.removeAllListeners('get-current-state');
    ipcRenderer.removeAllListeners('extend-work-time');
  }
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-app-region: drag;
}

.app-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  padding-top: 40px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.timer-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  transition: background 0.3s;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.timer {
  font-size: 48px;
  font-weight: 200;
}

.mode {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 8px;
}

.controls {
  display: flex;
  gap: 16px;
  -webkit-app-region: no-drag;
}

.icon-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.icon-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.icon-button svg {
  width: 20px;
  height: 20px;
}

.settings-panel {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  width: 100%;
  -webkit-app-region: no-drag;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
  color: white;
}

.setting-item label {
  font-size: 14px;
  opacity: 0.9;
}

.setting-item input {
  width: 60px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 14px;
  text-align: center;
}

.setting-item input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.title-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 32px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 8px;
  -webkit-app-region: drag;
}

.window-controls {
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
}

.window-control {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.window-control:hover {
  background: rgba(255, 255, 255, 0.2);
}

.window-control.close:hover {
  background: rgba(255, 0, 0, 0.8);
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: .4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4CAF50;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.setting-item {
  margin: 12px 0;
}
</style> 