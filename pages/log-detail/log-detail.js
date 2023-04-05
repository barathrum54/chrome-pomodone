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

function displayLogDetails(log) {
    const logDetails = document.getElementById("logDetails");

    const messageElement = document.createElement("p");
    messageElement.innerText = `Message: ${log.message}`;
    logDetails.appendChild(messageElement);

    const timestampElement = document.createElement("small");
    timestampElement.classList.add("block", "text-gray-500", "mt-2");
    timestampElement.innerText = `Timestamp: ${new Date(log.createdAt).toLocaleString()}`;
    logDetails.appendChild(timestampElement);
}

// URL'deki id parametresini alın
const urlParams = new URLSearchParams(window.location.search);
const logId = urlParams.get("id");

// API'nizle ilgili aşağıdaki URL'yi güncelleyin
const API_URL = `http://localhost:3000/logs/${logId}`;

// Log detaylarını API'den alın
fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
        if (data.success && data.log) {
            displayLogDetails(data.log);
            displayMessage("success", "Log details fetched successfully.");
        } else {
            console.error("Error fetching log details:", data.error);
            displayMessage("error", "Error fetching log details: " + data.error);
        }
    })
    .catch((error) => {
        console.error("Error fetching log details:", error);
        displayMessage("error", "Error fetching log details: " + error);
    });
