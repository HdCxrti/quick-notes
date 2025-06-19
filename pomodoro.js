// Pomodoro Timer functionality
class PomodoroTimer {
  constructor() {
    this.workTime = 25; // Default 25 minutes
    this.shortBreakTime = 5; // Default 5 minutes
    this.longBreakTime = 15; // Default 15 minutes
    this.sessionsBeforeLongBreak = 4;
    this.timeLeft = this.workTime * 60; // In seconds
    this.isRunning = false;
    this.isPaused = false;
    this.isWorkSession = true;
    this.completedSessions = 0;
    this.timerInterval = null;
    this.onTick = null;
    this.onSessionComplete = null;
    this.audio = new Audio();
    this.audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...'; // Shortened for brevity
    this.notifications = this.areNotificationsSupported();
  }

  areNotificationsSupported() {
    return "Notification" in window;
  }

  requestNotificationPermission() {
    if (!this.areNotificationsSupported()) {
      return Promise.resolve(false);
    }
    
    return Notification.requestPermission().then(permission => {
      return permission === 'granted';
    });
  }

  showNotification(title, body) {
    if (this.areNotificationsSupported() && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: 'favicon.ico' // You can add an icon for your app
      });
      
      notification.onclick = function() {
        window.focus();
        notification.close();
      };
    }
  }

  updateSettings(workTime, shortBreakTime, longBreakTime, sessionsBeforeLongBreak) {
    this.workTime = workTime;
    this.shortBreakTime = shortBreakTime;
    this.longBreakTime = longBreakTime;
    this.sessionsBeforeLongBreak = sessionsBeforeLongBreak;
    
    if (!this.isRunning) {
      this.resetTimer();
    }
    
    this.saveSettings();
  }

  saveSettings() {
    localStorage.setItem('pomodoroSettings', JSON.stringify({
      workTime: this.workTime,
      shortBreakTime: this.shortBreakTime,
      longBreakTime: this.longBreakTime,
      sessionsBeforeLongBreak: this.sessionsBeforeLongBreak
    }));
  }

  loadSettings() {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.workTime = settings.workTime || this.workTime;
      this.shortBreakTime = settings.shortBreakTime || this.shortBreakTime;
      this.longBreakTime = settings.longBreakTime || this.longBreakTime;
      this.sessionsBeforeLongBreak = settings.sessionsBeforeLongBreak || this.sessionsBeforeLongBreak;
    }
    
    this.resetTimer();
  }

  resetTimer(isWorkSession = true) {
    this.isWorkSession = isWorkSession;
    
    if (this.isWorkSession) {
      this.timeLeft = this.workTime * 60;
    } else {
      // Determine if it's time for a long break
      const isLongBreak = this.completedSessions > 0 && this.completedSessions % this.sessionsBeforeLongBreak === 0;
      this.timeLeft = (isLongBreak ? this.longBreakTime : this.shortBreakTime) * 60;
    }
    
    if (this.onTick) {
      this.onTick(this.formatTime(this.timeLeft));
    }
  }

  start() {
    if (this.isRunning && !this.isPaused) {
      return;
    }
    
    this.isRunning = true;
    this.isPaused = false;
    
    clearInterval(this.timerInterval);
    
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      
      if (this.onTick) {
        this.onTick(this.formatTime(this.timeLeft));
      }
      
      if (this.timeLeft <= 0) {
        this.completeSession();
      }
    }, 1000);
  }

  pause() {
    if (!this.isRunning || this.isPaused) {
      return;
    }
    
    clearInterval(this.timerInterval);
    this.isPaused = true;
  }

  reset() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.isPaused = false;
    this.resetTimer(true);
    this.completedSessions = 0;
  }

  skip() {
    this.completeSession();
  }

  completeSession() {
    clearInterval(this.timerInterval);
    this.audio.play();
    
    if (this.isWorkSession) {
      this.completedSessions++;
      this.showNotification('Work Session Complete', 'Time for a break!');
    } else {
      this.showNotification('Break Complete', 'Time to focus!');
    }
    
    if (this.onSessionComplete) {
      this.onSessionComplete(this.isWorkSession, this.completedSessions);
    }
    
    // Toggle session type
    this.resetTimer(!this.isWorkSession);
    
    // Auto-start next session
    this.start();
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

// Export the timer class
window.PomodoroTimer = PomodoroTimer;
