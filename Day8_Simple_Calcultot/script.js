
function calculate() {

    // Variables
    let num1 = Number(document.getElementById("num1").value);
    let num2 = Number(document.getElementById("num2").value);
    let operator = document.getElementById("operator").value;

    // Store calculation result
    let result;

    // Basic Logic
    if (operator === "+") {
        result = num1 + num2;
    }
    else if (operator === "-") {
        result = num1 - num2;
    }
    else if (operator === "*") {
        result = num1 * num2;
    }
    else if (operator === "/") {

        if (num2 === 0) {
            document.getElementById("result").innerText =
                "Cannot divide by zero!";
            return;
        }

        result = num1 / num2;
    }

    // Display Result
    document.getElementById("result").innerText =
        "Result: " + result;
}
