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
function createLogElement(log) {
    const logElement = document.createElement("div");
    logElement.classList.add("log", "bg-white", "p-3", "rounded", "shadow", "w-full", "cursor-pointer", "hover:opacity-100", "transition", "duration-300", "ease-in-out", "hover:shadow-lg");

    const messageElement = document.createElement("p");
    messageElement.innerText = log.message;
    logElement.appendChild(messageElement);

    const timestampElement = document.createElement("small");
    timestampElement.classList.add("block", "text-gray-500", "mt-2");
    timestampElement.innerText = new Date(log.createdAt).toLocaleString();
    logElement.appendChild(timestampElement);
    logElement.addEventListener("click", () => {
        window.location.href = `/pages/log-detail/log-detail.html?id=${log._id}`;
    });
    let logWrap = document.createElement("div");
    logWrap.classList.add('log', "p-1", "lg:w-1/6", "md:w-1/2", "mb-4", "opacity-90");
    logWrap.appendChild(logElement);

    return logWrap;
}

// API'nizle ilgili aşağıdaki URL'yi güncelleyin
const API_URL = "http://localhost:3000/logs";

fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
        if (data.success && data.logs) {
            const logsContainer = document.getElementById("logsContainer");
            data.logs.forEach((log) => {
                const logElement = createLogElement(log);
                logsContainer.appendChild(logElement);
            });
            displayMessage("success", "Logs fetched successfully.")
        } else {
            console.error("Error fetching logs:", data.error);
            displayMessage("error", "Error fetching logs: " + data.error);
        }
    })
    .catch((error) => {
        console.error("Error fetching logs:", error);
        displayMessage("error", "Error fetching logs: " + error);
    });
