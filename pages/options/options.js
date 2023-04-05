$(document).ready(function () {
    // Get elements from DOM
    const presetSelect = $('#preset-select');
    const customSettings = $('#custom-settings');
    const workDurationInput = $('#work-duration-input');
    const breakDurationInput = $('#break-duration-input');
    const startButton = $('#start-button');
    const saveButton = $('#save-button');
    // Load user settings from storage or initialize with default values
    const workDuration = parseInt(localStorage.getItem('workDuration'), 10) || 25;
    const breakDuration = parseInt(localStorage.getItem('breakDuration'), 10) || 5;

    setTimeout(() => {
        workDurationInput.val(workDuration);
        breakDurationInput.val(breakDuration);
        console.log(breakDurationInput)
    }, 100);
    // Load user settings from storage or initialize with default values
    chrome.storage.sync.get(['workDuration', 'breakDuration'], function (result) {
        if (chrome.runtime.lastError) {
            showError('An error occurred while loading user settings. Please try again later.');
            return;
        }

        const workDuration = result.workDuration || 25;
        const breakDuration = result.breakDuration || 5;

        workDurationInput.val(workDuration);
        breakDurationInput.val(breakDuration);
    });

    // Initialize select2 plugin on preset select element
    presetSelect.select2();

    // Handle preset select change event
    presetSelect.on('change', function () {
        if (presetSelect.val() === 'custom') {
            customSettings.addClass('active');
        } else {
            customSettings.removeClass('active');
        }
    });

    // Handle start button click event
    startButton.on('click', function () {
        let workDuration, breakDuration;

        // If a preset is selected, use its values
        if (presetSelect.val() !== 'custom') {
            const presetValues = presetSelect.val().split(',');
            workDuration = parseInt(presetValues[0], 10);
            breakDuration = parseInt(presetValues[1], 10);
        } else {
            // Otherwise, use custom values
            workDuration = parseInt(workDurationInput.val(), 10);
            breakDuration = parseInt(breakDurationInput.val(), 10);
        }

        // Validate input values
        if (isNaN(workDuration) || workDuration <= 0 || isNaN(breakDuration) || breakDuration <= 0) {
            showError('Please enter valid values for work duration and break duration.');
            return;
        }

        // Save user settings to storage
        chrome.storage.sync.set({ workDuration: workDuration, breakDuration: breakDuration }, function () {
            if (chrome.runtime.lastError) {
                showError('An error occurred while saving user settings. Please try again later.');
                return;
            }

            // Redirect to Pomodone website
            chrome.tabs.create({ url: 'https://pomodoneapp.com/' });
        });
    });
    saveButton.on('click', function () {
        saveSettingsAndExit();
    });

    // Wizard functionality
    let currentCardIndex = 0;
    const wizardCards = $('.wizard-card');
    const wizardNextBtns = $('.wizard-next-btn');
    const wizardPrevBtns = $('.wizard-prev-btn');

    function showCard(cardIndex) {
        // Hide all cards and show the card with the given index
        wizardCards.hide();
        wizardCards.eq(cardIndex).show();

        // Disable the previous button if we're on the first card, enable otherwise
        if (cardIndex === 0) {
            wizardPrevBtns.prop('disabled', true);
        } else {
            wizardPrevBtns.prop('disabled', false);
        }

        // If we're on the last card, change the text of the next button to "Finish"
        if (cardIndex === wizardCards.length - 1) {
            wizardNextBtns.text('Finish');
        } else {
            wizardNextBtns.text('Next');
        }
    }

    function handleNextClick() {
        // If we're on the last card, save the user's settings and exit the wizard
        if (currentCardIndex === wizardCards.length - 1) {
            saveSettingsAndExit();
            return;
        }
        // Move to the next card
        currentCardIndex++;
        showCard(currentCardIndex);
    }

    function handlePrevClick() {
        // Move to the previous card
        currentCardIndex--;
        showCard(currentCardIndex);
    }

    function saveSettingsAndExit() {
        let workDuration, breakDuration;
        // If a preset is selected, use its values
        if (presetSelect.val()) {
            const presetValues = presetSelect.val().split(',');
            workDuration = parseInt(presetValues[0], 10);
            breakDuration = parseInt(presetValues[1], 10);
        } else {
            // Otherwise, use custom values
            workDuration = parseInt(workDurationInput.val(), 10);
            breakDuration = parseInt(breakDurationInput.val(), 10);
        }

        // Validate input values
        if (isNaN(workDuration) || workDuration <= 0 || isNaN(breakDuration) || breakDuration <= 0) {
            showError('Please enter valid values for work duration and break duration.');
            return;
        }

        // Save user settings to local storage
        localStorage.setItem('workDuration', workDuration);
        localStorage.setItem('breakDuration', breakDuration);

        // Show success message
        showSuccess("Settings saved successfully!")
    }
    function removeAfterDelay(element, delay) {
        setTimeout(function () {
            element.remove();
        }, delay);
    }
    function showSuccess(message) {
        const successMessage = $('<div>').addClass('success-message').text(message);
        $('body').append(successMessage);
        removeAfterDelay(successMessage, 3000);

    }
    function showError(message) {
        const errorMessage = $('<div>').addClass('error-message').text(message);
        $('body').append(errorMessage);
        removeAfterDelay(errorMessage, 3000);

    }

    // Show the first card of the wizard
    showCard(currentCardIndex);
    // Helper function to generate random pastel colors
    function setWizardContainerGradient() {
        const colors = [
            '#FDE2E4',
            '#F5E5D1',
            '#E7D8D8',
            '#D4E0D4',
            '#E4DB9F',
            '#C2DFFF',
            '#FBE8C8',
            '#FFD3B5',
            '#B5EAD7',
            '#F3C3E3'
        ];

        const startColor = colors[Math.floor(Math.random() * colors.length)];
        const endColor = colors[Math.floor(Math.random() * colors.length)];

        const gradientStyle = `linear-gradient(to bottom right, ${startColor}, ${endColor})`;

        $('.wizard-container').css('background', gradientStyle);
    }
    function getRandomPastelColor() {
        const hue = Math.floor(Math.random() * 360);
        const pastel = '80%';
        const saturation = Math.floor(Math.random() * 40) + 50;
        const lightness = Math.floor(Math.random() * 40) + 60;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    const wizardContainer = $('.wizard-container');
    const color1 = getRandomPastelColor();
    const color2 = getRandomPastelColor();
    wizardContainer.css('background', `linear-gradient(45deg, ${color1}, ${color2})`);
    // Add click event listeners to next and previous bsttons
    setWizardContainerGradient();

    wizardNextBtns.on('click', handleNextClick);
    wizardPrevBtns.on('click', handlePrevClick);
});
