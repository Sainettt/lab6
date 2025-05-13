const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const http = require('http');
const { PORT } = require('./config');

let mainWindow;
let serverProcess;

function createWindow() {
  console.log('Creating window...');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadURL(`http://localhost:${PORT}`).then(() => {
    console.log('URL loaded successfully');
  }).catch((error) => {
    console.error('Error loading URL:', error);
  })
}

function waitForServerToStart(callback) {
  console.log('Server try to start server...');
  const interval = setInterval(() => {
    console.log(`Checking server status at http://localhost:${PORT}...`);
    http.get(`http://localhost:${PORT}`, (res) => {
      if (res.statusCode === 200) {
        clearInterval(interval);
        console.log('Server started successfully!');
        callback();
      }
    }).on('error', () => {
      console.log('Server not yet available, retrying...');
    });
  }, 1000);
}

app.whenReady().then(() => {
  console.log('Server process started');
  serverProcess = exec('npm start', (error, stdout, stderr) => {
    if (error) {
      console.error(`Server startup error: ${error.message}`);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
  });

  waitForServerToStart(createWindow);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) serverProcess.kill();
    app.quit();
  }
});
