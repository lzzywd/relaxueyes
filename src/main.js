const { app, BrowserWindow, ipcMain, screen, Tray, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');
const store = new Store();
const fs = require('fs');
const { exec } = require('child_process');

// 初始化 remote 模块
const remoteMain = require('@electron/remote/main');
remoteMain.initialize();

let mainWindow = null;
let lockWindow = null;
let tray = null;
let forceQuit = false;
let reminderWindow = null;
let progressWindow = null;

// 在全局范围内注册一次事件监听器
let windowPosition = null;

// 处理拖动事件
ipcMain.on('progress-window-drag-start', () => {
  if (!progressWindow) return;
  windowPosition = progressWindow.getPosition();
});

ipcMain.on('progress-window-drag', (event, { deltaX, deltaY }) => {
  if (!progressWindow || !windowPosition) return;
  progressWindow.setPosition(
    windowPosition[0] + deltaX,
    windowPosition[1] + deltaY
  );
});

ipcMain.on('progress-window-drag-end', () => {
  if (!progressWindow) return;
  
  // 获取当前窗口位置和屏幕信息
  const [x] = progressWindow.getPosition();
  const { workArea } = screen.getPrimaryDisplay();
  
  // 自动吸附到屏幕顶部
  const newY = workArea.y;
  
  // 确保窗口不会超出屏幕左右边界
  const newX = Math.max(
    workArea.x,
    Math.min(x, workArea.x + workArea.width - 200)
  );
  
  // 应用新位置
  progressWindow.setPosition(newX, newY);
  
  // 保存新位置到设置
  store.set('progressWindowPosition', { x: newX, y: newY });
});

// 保存设置
ipcMain.on('save-settings', (event, settings) => {
  store.set('settings', settings);
});

// 获取设置
ipcMain.handle('get-settings', () => {
  return store.get('settings');
});

// 添加获取窗口位置的处理
ipcMain.handle('get-window-position', () => {
  if (!progressWindow || progressWindow.isDestroyed()) {
    return { x: 0, y: 0 };
  }
  const [x, y] = progressWindow.getPosition();
  return { x, y };
});

// 修改拖动事件处理
ipcMain.on('progress-window-move', (event, { x, y }) => {
  if (!progressWindow || progressWindow.isDestroyed()) return;
  progressWindow.setPosition(Math.round(x), Math.round(y));
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
      enableRemoteModule: true
    },
    frame: false,
    transparent: true,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: -100, y: -100 },
    hasShadow: true,
    resizable: false,
    show: false
  });

  // 为主窗口启用 remote 模块
  remoteMain.enable(mainWindow.webContents);

  mainWindow.loadURL(process.env.NODE_ENV === 'development'
    ? 'http://localhost:9000/index.html'
    : `file://${path.join(__dirname, '../dist/index.html')}`
  );

  // 等待窗口加载完成后再显示
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
  });

  // 修改窗口关闭行为
  mainWindow.on('close', (event) => {
    if (!forceQuit) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  createTray();
}

function createTray() {
  if (tray !== null) return;

  try {
    // 根据开发环境或生产环境选择正确的图标路径
    const isDev = process.env.NODE_ENV === 'development';
    let iconPath;
    
    if (process.platform === 'darwin') {
      iconPath = isDev 
        ? path.join(__dirname, 'icon--macos--tray.png')
        : path.join(__dirname, '../src/icon--macos--tray.png');
    } else {
      iconPath = isDev
        ? path.join(__dirname, 'icon-win-tray.png')
        : path.join(__dirname, '../src/icon-win-tray.png');
    }

    console.log('尝试加载托盘图标:', iconPath);

    if (!fs.existsSync(iconPath)) {
      console.error(`找不到托盘图标: ${iconPath}`);
      // 尝试使用备用图标
      const backupIconPath = isDev
        ? path.join(__dirname, 'icon.png')
        : path.join(__dirname, '../src/icon.png');
      
      console.log('尝试使用备用图标:', backupIconPath);
      
      if (!fs.existsSync(backupIconPath)) {
        throw new Error('找不到任何可用的图标文件');
      }
      console.log('使用备用图标');
      tray = new Tray(backupIconPath);
    } else {
      tray = new Tray(iconPath);
    }

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示主窗口',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
          }
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          forceQuit = true;
          app.quit();
        }
      }
    ]);

    // 修改这里：添加单击事件处理
    tray.on('click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    // Windows 平台特殊处理（保留双击事件作为备用）
    if (process.platform === 'win32') {
      tray.on('double-click', () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      });
    }

    tray.setContextMenu(contextMenu);
  } catch (error) {
    console.error('创建托盘图标失败:', error);
  }
}

function createLockScreen() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  const newLockWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    fullscreen: true,
    skipTaskbar: true,
    show: false,
    movable: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    focusable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      enableRemoteModule: true
    }
  });

  // 防止用户通过快捷键退出全屏
  newLockWindow.setFullScreenable(false);
  
  // 设置窗口层级为最顶层
  newLockWindow.setAlwaysOnTop(true, 'screen-saver');
  
  // 监听失去焦点事件，强制获取焦点
  newLockWindow.on('blur', () => {
    if (newLockWindow && !newLockWindow.isDestroyed()) {
      newLockWindow.focus();
    }
  });

  // 禁用所有快捷键
  newLockWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown') {
      event.preventDefault();
    }
  });

  // 加载锁屏页面
  const lockUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:9000/lock.html'
    : `file://${path.join(__dirname, '../dist/lock.html')}`;
  
  console.log('加载锁屏页面:', lockUrl);
  newLockWindow.loadURL(lockUrl);

  return newLockWindow;
}

// 修改 showLockScreen 函数
function showLockScreen(duration) {
  console.log('显示锁屏，持续时间:', duration, '秒');
  
  try {
    // 如果存在旧的锁屏窗口，先销毁
    if (lockWindow) {
      lockWindow.destroy();
      lockWindow = null;
    }

    // 创建新的锁屏窗口
    lockWindow = createLockScreen();

    // 等待窗口加载完成后再显示
    lockWindow.webContents.once('did-finish-load', () => {
      try {
        console.log('锁屏页面加载完成，准备显示');
        if (lockWindow) {
          lockWindow.show();
          lockWindow.focus();
          lockWindow.webContents.send('start-rest', duration);
          console.log('锁屏窗口已显示并发送休息信号');
        }
      } catch (error) {
        console.error('显示锁屏窗口时出错:', error);
      }
    });
  } catch (error) {
    console.error('创建锁屏窗口时出错:', error);
  }
}

// 窗口控制事件处理
ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

// 修改处理时间更新的部分
ipcMain.on('update-timer', (event, time) => {
  // 更新托盘图标
  if (tray) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (process.platform === 'win32') {
      const isWorking = mainWindow && !mainWindow.isDestroyed() && !lockWindow;
      const mode = isWorking ? '工作中' : '休息中';
      const tooltipText = `RelaxUeyes - 护眼提醒\n${mode}\n剩余时间: ${timeString}`;
      tray.setToolTip(tooltipText);
    }
  }

  // 更新进度窗口
  if (progressWindow && !progressWindow.isDestroyed()) {
    // 修改这里：通过检查 lockWindow 来判断是否在休息中
    const isWorking = !lockWindow;
    const settings = store.get('settings', {});
    const totalTime = isWorking ? 
      settings.workDuration * 60 : 
      settings.restDuration * 60;
    
    progressWindow.webContents.send('update-timer', {
      time,
      totalTime,
      isWorking
    });
  }
});

// 应用程序生命周期
app.whenReady().then(async () => {
  createWindow();
  const settings = store.get('settings');
  if (settings && settings.showProgress) {
    createProgressWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 处理锁屏请求
ipcMain.on('lock-screen', (event, duration) => {
  console.log('收到锁屏请求，持续时间:', duration);
  try {
    showLockScreen(duration);
  } catch (error) {
    console.error('处理锁屏请求时出错:', error);
  }
});

// 确保托盘图标在应用退出时被销毁
app.on('before-quit', () => {
  forceQuit = true;
  if (progressWindow) {
    progressWindow.destroy();
    progressWindow = null;
  }
  if (tray) {
    tray.destroy();
  }
  // 移除所有相关的事件监听器
  ipcMain.removeAllListeners('progress-window-drag-start');
  ipcMain.removeAllListeners('progress-window-drag');
  ipcMain.removeAllListeners('progress-window-drag-end');
});

// 防止应用程序在后台被暂停
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

// 处理休息完成
ipcMain.on('rest-complete', () => {
  console.log('收到休息完成信号');
  
  try {
    // 先锁定系统，再处理窗口
    if (process.platform === 'win32') {
      console.log('正在锁定 Windows 系统...');
      exec('rundll32.exe user32.dll,LockWorkStation', (error) => {
        if (error) {
          console.error('锁定系统失败:', error);
        } else {
          console.log('系统已锁定');
          // 系统锁定后再处理窗口
          handleWindowsAfterLock();
        }
      });
    } else {
      handleWindowsAfterLock();
    }
  } catch (error) {
    console.error('处理休息完成时出错:', error);
  }
});

// 抽取窗口处理逻辑为单独的函数
function handleWindowsAfterLock() {
  if (lockWindow) {
    lockWindow.destroy();
    lockWindow = null;
    console.log('锁屏窗口已销毁');
  }

  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('rest-complete');
    console.log('主窗口已显示，并发送休息完成信号');
  }
}

// 创建提醒窗口
function createReminderWindow() {
  console.log('=== 开始创建提醒窗口 ===');
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  
  try {
    if (reminderWindow) {
      reminderWindow.destroy();
      reminderWindow = null;
    }

    reminderWindow = new BrowserWindow({
      width: 280,
      height: 160,
      x: screenWidth - 300,
      y: screenHeight - 200,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
        webSecurity: false
      }
    });

    // 修改这里的路径处理
    const reminderUrl = process.env.NODE_ENV === 'development'
      ? `file://${path.join(__dirname, 'reminder.html')}`
      : `file://${path.join(__dirname, 'reminder.html')}`;

    console.log('提醒窗口URL:', reminderUrl);

    // 添加错误处理
    reminderWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('加载提醒窗口失败:', errorCode, errorDescription);
      console.error('尝试加载的URL:', reminderUrl);
    });

    // 添加成功处理
    reminderWindow.webContents.on('did-finish-load', () => {
      console.log('提醒窗口加载成功');
      reminderWindow.show();
    });

    // 加载页面
    reminderWindow.loadFile(path.join(__dirname, 'reminder.html')).catch(err => {
      console.error('加载提醒窗口时出错:', err);
    });

    // 开发环境下打开开发者工具
    if (process.env.NODE_ENV === 'development') {
      reminderWindow.webContents.openDevTools({ mode: 'detach' });
    }

  } catch (error) {
    console.error('创建提醒窗口时出错:', error);
  }
}

// 处理延长时间请求
ipcMain.on('extend-time', (event, minutes) => {
  console.log(`延长工作时间 ${minutes} 分钟`);
  if (reminderWindow) {
    reminderWindow.destroy();
    reminderWindow = null;
  }
  
  if (mainWindow) {
    mainWindow.webContents.send('extend-work-time', minutes);
    // 更新设置中的工作时间
    const settings = store.get('settings', {});
    settings.workDuration = (settings.workDuration || 25) + minutes;
    store.set('settings', settings);
  }
});

// 处理提醒超时
ipcMain.on('reminder-timeout', () => {
  if (reminderWindow) {
    reminderWindow.destroy();
    reminderWindow = null;
  }
  // 不需要额外处理，让原有的倒计时结束逻辑执行
});

// 处理显示提醒窗口的请求
ipcMain.on('show-reminder', () => {
  console.log('=== 主进程收到显示提醒窗口请求 ===');
  try {
    createReminderWindow();
  } catch (error) {
    console.error('处理显示提醒窗口请求时出错:', error);
  }
});

// 添加错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('未处理的 Promise 拒绝:', reason);
});

// 处理进度窗口显示状态更新
ipcMain.on('update-progress-window', (event, shouldShow) => {
  console.log('更新进度窗口显示状态:', shouldShow);
  try {
    if (shouldShow) {
      if (!progressWindow || progressWindow.isDestroyed()) {
        createProgressWindow();
      }
    } else {
      if (progressWindow && !progressWindow.isDestroyed()) {
        progressWindow.destroy();
        progressWindow = null;
      }
    }
  } catch (error) {
    console.error('更新进度窗口状态时出错:', error);
  }
});

// 创建进度窗口
function createProgressWindow() {
  const { workArea } = screen.getPrimaryDisplay();
  
  try {
    if (progressWindow) {
      progressWindow.destroy();
      progressWindow = null;
    }

    progressWindow = new BrowserWindow({
      width: 200,
      height: 40,
      x: Math.round(workArea.x + (workArea.width - 200) / 2),
      y: workArea.y,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      focusable: false,
      hasShadow: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
        webSecurity: false
      }
    });

    // 设置窗口忽略所有鼠标事件
    progressWindow.setIgnoreMouseEvents(true, { forward: true });

    // 监听 IPC 消息来切换鼠标事件状态
    ipcMain.on('set-progress-ignore-mouse', (event, ignore) => {
      if (progressWindow && !progressWindow.isDestroyed()) {
        progressWindow.setIgnoreMouseEvents(ignore, { forward: true });
      }
    });

    const progressUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:9000/progress.html'
      : `file://${path.join(__dirname, '../dist/progress.html')}`;

    console.log('加载进度窗口URL:', progressUrl);

    progressWindow.loadURL(progressUrl).catch(err => {
      console.error('加载进度窗口时出错:', err);
    });

    // 恢复保存的位置，但确保不会超出屏幕
    const savedPosition = store.get('progressWindowPosition');
    if (savedPosition) {
      const newX = Math.max(
        workArea.x,
        Math.min(savedPosition.x, workArea.x + workArea.width - 200)
      );
      const newY = Math.max(
        workArea.y,
        Math.min(savedPosition.y, workArea.y + workArea.height - 40)
      );
      progressWindow.setPosition(newX, newY);
    }

  } catch (error) {
    console.error('创建进度窗口时出错:', error);
  }
}

// 处理显示主窗口的请求
ipcMain.on('show-main-window', () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});