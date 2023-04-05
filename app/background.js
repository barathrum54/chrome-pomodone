let isRunning = false;
let intervalId;
let currentTime = 25 * 60;
let pauseTabId;

chrome.action.onClicked.addListener(handlePomodoroClick);
chrome.tabs.onRemoved.addListener(handlePauseTabRemove);
chrome.runtime.onMessage.addListener(handlePauseMessage);
chrome.runtime.onInstalled.addListener(() => {
    // Sağ tıklama menüsünde "Pomodone Duraklat" öğesini oluşturun
    chrome.contextMenus.create({
        id: "logs",
        title: "See all logs",
        contexts: ["all"],
    });
});

// Sağ tıklama menüsündeki öğeye tıklanıldığında işlem yap
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "logs") {
        //open a new tab with the logs.html page
        chrome.tabs.create({ url: "pages/logs/logs.html" });
        //set that tab as active
    }
});

function handlePomodoroClick(tab) {
    if (isRunning) {
        pausePomodoro();
    } else {
        startPomodoro();
    }
}

function pausePomodoro() {
    clearInterval(intervalId);
    chrome.tabs.create({ url: 'pages/pause/pause.html' }, handlePauseTabCreated);

    showNotification('Pomodoro Durduruldu', 'Pomodoro zamanlayıcısı durduruldu.');
    isRunning = false;
    updateBadge();
}

function handlePauseTabCreated(newTab) {
    pauseTabId = newTab.id;
}

function handlePauseTabRemove(tabId) {
    if (tabId === pauseTabId) {
        pauseTabId = null;
    }
}

function handlePauseMessage(request, sender, sendResponse) {
    if (request.type === 'pauseMessage') {
        const message = request.message;
        showNotification('Duraklatıldı', message);
    }
    if (request.type === 'errorMessage') {
        showNotification('Hata', 'Durdurma sekmesi hala açık.');
    }
}

function startPomodoro() {
    intervalId = setInterval(updateTimer, 1000);
    isRunning = true;
    updateBadge();
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

function showNotification(title, message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/favicon-128.png'),
        title,
        message
    });
}

function showPomodoroCompleteNotification() {
    showNotification('Pomodoro Tamamlandı', 'Bir Pomodoro tamamlandı. Şimdi mola zamanı!');
}

function updateBadge() {
    chrome.action.setBadgeBackgroundColor({ color: isRunning ? "green" : "red" });
    chrome.action.setBadgeTextColor({ color: "white" });

    chrome.action.setBadgeText({ text: formatTime(currentTime).toString() });
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updatePomodoroHistory() {
    const today = new Date().toISOString().split("T")[0];

    chrome.storage.local.get("pomodoroHistory", ({ pomodoroHistory }) => {
        let updatedPomodoroHistory = pomodoroHistory || [];

        const existingEntry = updatedPomodoroHistory.find((entry) => entry.date === today);
        if (existingEntry) {
            existingEntry.pomodoros++;
        } else {
            updatedPomodoroHistory.push({ date: today, pomodoros: 1 });
        }

        chrome.storage.local.set({ pomodoroHistory: updatedPomodoroHistory });
    });
}
