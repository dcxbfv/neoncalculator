
const display = document.getElementById("display");display.classList.add("placeholder-number");
const buttons = document.querySelectorAll(".buttons button");

let currentNumber = "0";
let firstNumber = null;
let operator = null;
let waitingForSecondNumber = false;

let expression = "";

// نمایش عدد روی صفحه

function updateDisplay() {
    display.value = currentNumber;

    if (currentNumber === "0" &&
        firstNumber === null &&
        operator === null) {
        display.value = "عدد";
        display.classList.add("placeholder-number");
    } else {
        display.classList.remove("placeholder-number");
    }
}

// وارد کردن عدد

function addNumber(number) {
    if (waitingForSecondNumber) {
        currentNumber = number;
        waitingForSecondNumber = false;
    } else if (currentNumber === "0") {
        currentNumber = number;
    } else {
        currentNumber += number;
    }

    if (operator !== null && firstNumber !== null) {
        display.value = expression + " " + currentNumber;
    } else {
        display.value = currentNumber;
    }
}

// انتخاب عملیات ریاضی

function chooseOperator(selectedOperator) {
    if (operator !== null && !waitingForSecondNumber) {
    calculate();
}
    firstNumber = Number(currentNumber);
    operator = selectedOperator;

    expression = currentNumber + " " + selectedOperator;
    display.value = expression;

    waitingForSecondNumber = true;
}


// انجام محاسبه
function calculate() {
    if (operator === null || firstNumber === null) {
        return;
    }

    const secondNumber = Number(currentNumber);
    let result;

    switch (operator) {
        case "+":
            result = firstNumber + secondNumber;
            break;

        case "-":
            result = firstNumber - secondNumber;
            break;

        case "×":
            result = firstNumber * secondNumber;
            break;

        case "÷":
            if (secondNumber === 0) {
                currentNumber = "خطا";
                updateDisplay();
                firstNumber = null;
                operator = null;
                return;
            }
            result = firstNumber / secondNumber;
            break;
    }

    currentNumber = String(result);
    firstNumber = null;
    operator = null;
    waitingForSecondNumber = true;

    updateDisplay();
}

// پاک کردن همه چیز
function clearCalculator() {
    currentNumber = "0";
    firstNumber = null;
    operator = null;
    waitingForSecondNumber = false;

    updateDisplay();
}

// پاک کردن آخرین رقم
function deleteLastDigit() {
    if (waitingForSecondNumber || currentNumber === "خطا") {
        return;
    }

    currentNumber = currentNumber.slice(0, -1);

    if (currentNumber === "" || currentNumber === "-") {
        currentNumber = "0";
    }

    updateDisplay();
}

// وصل کردن دکمه ها
buttons.forEach(function(button) {
    button.addEventListener("click", function() {
        const value = button.textContent.trim();
        if (value === "=") {
            playClickSound("equals");
        } else if (value === "C" || value === "⌫") {
            playClickSound("clear");
        } else if (["+", "-", "×", "÷"].includes(value)) {
            playClickSound("operator");
        } else {
            playClickSound("normal");
        }
        if (value >= "0" && value <= "9") {
            addNumber(value);
        } else if (value === ".") {
            if (waitingForSecondNumber) {
                currentNumber = "0.";
                waitingForSecondNumber = false;
                updateDisplay();
            } else if (!currentNumber.includes(".")) {
                currentNumber += ".";
                updateDisplay();
            }
        } else if (value === "C") {
            clearCalculator();
        } else if (value === "⌫") {
            deleteLastDigit();
        } else if (value === "=") {
            calculate();
        } else if (["+", "-", "×", "÷"].includes(value)) {
            chooseOperator(value);
        }
    });
});

const audioContext = new (
    window.AudioContext || window.webkitAudioContext
)();

function playClickSound(type = "normal") {
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    // صدای متفاوت برای دکمه‌های مختلف
    let frequency = 650;
    let duration = 0.07;

    if (type === "operator") {
        frequency = 850;
    } else if (type === "equals") {
        frequency = 1100;
        duration = 0.16;
    } else if (type === "clear") {
        frequency = 300;
        duration = 0.12;
    }

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
        frequency,
        audioContext.currentTime
    );

    gain.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.15,
        audioContext.currentTime + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + duration
    );

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}
