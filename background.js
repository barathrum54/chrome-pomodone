let isRunning = false;
let intervalId;
let currentTime = 25 * 60;
let pauseTabId;

chrome.action.onClicked.addListener((tab) => {
    if (isRunning) {
        clearInterval(intervalId);

        // Open pause.html and show a pause notification
        chrome.tabs.create({ url: 'pause.html' }, (newTab) => {
            pauseTabId = newTab.id;
        });
        showPauseNotification();
    } else {
        if (pauseTabId) {
            chrome.tabs.get(pauseTabId, (tab) => {
                if (chrome.runtime.lastError) {
                    // The tab doesn't exist anymore, so it's safe to start the timer
                    intervalId = setInterval(updateTimer, 1000);
                } else {
                    // The pause tab still exists, so focus on it instead of starting the timer
                    chrome.tabs.update(pauseTabId, { active: true });
                }
            });
        } else {
            intervalId = setInterval(updateTimer, 1000);
        }
    }
    isRunning = !isRunning;
    updateBadge();
});

chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === pauseTabId) {
        pauseTabId = null;
    }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'pauseMessage') {
        const message = request.message;
        showPauseNotification(message);
    }
});
function showPauseNotification() {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: 'Pomodoro Durduruldu',
        message: 'Pomodoro zamanlayıcısı durduruldu.'
    });
}

function showPomodoroCompleteNotification() {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: 'Pomodoro Tamamlandı',
        message: 'Bir Pomodoro tamamlandı. Şimdi mola zamanı!'
    });
}

function updateTimer() {
    if (currentTime <= 0) {
        clearInterval(intervalId);
        isRunning = false;
        currentTime = 25 * 60;
        showPomodoroCompleteNotification();
        updatePomodoroHistory();
    } else {
        currentTime--;
    }
    updateBadge();
}

function updateBadge() {
    chrome.action.setBadgeBackgroundColor({ color: isRunning ? "green" : "red" });
    chrome.action.setBadgeTextColor({ color: "white" });

    if (!isRunning) {
        let pauseText = "-" + formatTime(currentTime).toString()
        chrome.action.setBadgeText({ text: pauseText });
    } else {
        chrome.action.setBadgeText({ text: formatTime(currentTime).toString() });

    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updatePomodoroHistory() {
    const today = new Date().toISOString().split("T")[0];

    chrome.storage.local.get("pomodoroHistory", (data) => {
        let pomodoroHistory = data.pomodoroHistory || [];

        const existingEntry = pomodoroHistory.find((entry) => entry.date === today);
        if (existingEntry) {
            existingEntry.pomodoros++;
        } else {
            pomodoroHistory.push({ date: today, pomodoros: 1 });
        }

        chrome.storage.local.set({ pomodoroHistory });
    });
}
