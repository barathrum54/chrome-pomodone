document.getElementById('submit').addEventListener('click', () => {
    const log = document.getElementById('log').value;
    chrome.runtime.sendMessage({ type: 'pauseMessage', message: log });

    const API_URL = `http://localhost:3000/logs`;
    // API isteği yap
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: log })
    })

        .then(data => {
            console.log('API isteği başarılı:', data);
            // İsteği takiben diğer işlemleri burada yapabilirsiniz.
            displayMessage("success", "Log kaydedildi.");
            setTimeout(() => {
                window.close();
            }, 1500);
        })
        .catch(error => {
            console.error('API isteği sırasında hata oluştu:', error);
            displayMessage("error", "Log kaydedilirken hata oluştu.");
        });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "errorMessage") {
        const errorDiv = document.querySelector("#error-message");
        if (!errorDiv) {
            const newErrorDiv = document.createElement("div");
            newErrorDiv.setAttribute("id", "error-message");
            newErrorDiv.classList.add("bg-red-200", "text-red-700", "p-2", "rounded");
            newErrorDiv.innerText = "Pomodoro zaten duraklatılmış durumda.";
            document.querySelector(".pmd-container").appendChild(newErrorDiv);
        }

        // Check if the pause tab is active and create it if it's not
        chrome.tabs.query({ url: chrome.runtime.getURL("pause.html") }, (tabs) => {
            if (tabs.length === 0) {
                createPauseTab();
            } else {
                chrome.tabs.update(tabs[0].id, { active: true });
            }
        });
    } else if (request.type === "logMessage") {
        sendLog(request.message);

        // Check if the logs tab is active and create it if it's not
        chrome.tabs.query({ url: chrome.runtime.getURL("logs.html") }, (tabs) => {
            if (tabs.length === 0) {
                createLogsTab();
            } else {
                chrome.tabs.update(tabs[0].id, { active: true });
            }
        });
    }
});

function sendLog(message) {
    chrome.runtime.sendMessage({ type: 'log', message: message });
}

function displayMessage(type, message) {
    const messageContainer = document.getElementById("messageContainer");

    // Önceki mesajları temizle
    messageContainer.innerHTML = "";

    const messageElement = document.createElement("div");
    messageElement.innerText = message;

    if (type === "error") {
        messageElement.classList.add("bg-red-200", "text-red-700", "p-2", "rounded");
    } else if (type === "success") {
        messageElement.classList.add("bg-green-200", "text-green-700", "p-2", "rounded");
    }

    messageContainer.appendChild(messageElement);
}
