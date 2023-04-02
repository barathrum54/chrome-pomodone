document.getElementById('submit').addEventListener('click', () => {
    const message = document.getElementById('message').value;
    chrome.runtime.sendMessage({ type: 'pauseMessage', message: message });
    window.close();
});
