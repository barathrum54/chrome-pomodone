document.getElementById('submit').addEventListener('click', () => {
    const message = document.getElementById('message').value;
    chrome.runtime.sendMessage({ type: 'pauseMessage', message: message });
    window.close();
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "errorMessage") {
        const errorDiv = document.querySelector("#error-message");
        if (!errorDiv) {
            const newErrorDiv = document.createElement("div");
            newErrorDiv.setAttribute("id", "error-message");
            newErrorDiv.style.backgroundColor = "red";
            newErrorDiv.style.color = "white";
            newErrorDiv.style.padding = "10px";
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
    }
});
