const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'POST, GET');
    return res.sendStatus(200);
  }
  next();
});

// Инициализация таймера
const timerState = {
  startTime: Date.now(),
  isRunning: true,
  elapsedSeconds: 0,
  lastPauseTime: null,
};

// Создаем папку logs
const logsDir = path.join('/app/logs');
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('Создана папка /app/logs');
  }
} catch (err) {
  console.error('Ошибка создания /app/logs:', err);
}

// Проверяем session.json
const sessionPath = path.join('/app/logs', 'session.json');
if (fs.existsSync(sessionPath)) {
  try {
    const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
    console.log('Загружен session.json:', sessionData);
  } catch (err) {
    console.error('Ошибка чтения session.json:', err);
  }
}

// Сохранение состояния таймера
function saveTimerState() {
  const timerPath = path.join('/app/logs', 'timer.json');
  try {
    fs.writeFileSync(timerPath, JSON.stringify(timerState, null, 2));
  } catch (err) {
    console.error('Ошибка сохранения таймера:', err);
  }
}

// Обновление таймера
setInterval(() => {
  if (timerState.isRunning) {
    const now = Date.now();
    timerState.elapsedSeconds = Math.floor((now - timerState.startTime) / 1000);
    saveTimerState();
  }
}, 1000);

// Логи
app.post('/log', (req, res) => {
  const logData = req.body;
  const logPath = path.join('/app/logs', 'logs.txt');
  console.log('Получен лог:', logData);
  try {
    fs.appendFileSync(logPath, JSON.stringify(logData) + '\n');
    console.log('Лог записан в:', logPath);
    res.sendStatus(200);
  } catch (err) {
    console.error('Ошибка записи лога:', err);
    res.status(500).send('Ошибка записи лога');
  }
});

app.get('/logs', (req, res) => {
  const logPath = path.join('/app/logs', 'logs.txt');
  console.log('Запрос логов:', logPath);
  try {
    const logs = fs.readFileSync(logPath, 'utf-8');
    const logLines = logs.split('\n').filter(Boolean).map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);
    res.json(logLines);
  } catch (err) {
    console.log('Логов нет или ошибка:', err);
    res.json([]);
  }
});

// Управление таймером
app.post('/timer/pause', (req, res) => {
  if (timerState.isRunning) {
    timerState.isRunning = false;
    timerState.lastPauseTime = Date.now();
    timerState.elapsedSeconds = Math.floor((timerState.lastPauseTime - timerState.startTime) / 1000);
    saveTimerState();
    console.log('Таймер на паузе:', timerState);
  }
  res.sendStatus(200);
});

app.post('/timer/resume', (req, res) => {
  if (!timerState.isRunning) {
    const now = Date.now();
    timerState.startTime += (now - timerState.lastPauseTime);
    timerState.isRunning = true;
    timerState.lastPauseTime = null;
    saveTimerState();
    console.log('Таймер возобновлен:', timerState);
  }
  res.sendStatus(200);
});

app.get('/timer', (req, res) => {
  res.json({
    isRunning: timerState.isRunning,
    elapsedSeconds: timerState.elapsedSeconds,
  });
});

app.listen(3002, () => console.log('Сервер логов запущен на порту 3002'));