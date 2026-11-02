
// ========================================
// 1. SELECT HTML ELEMENTS
// ========================================

const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");

const sourceLanguage = document.getElementById("sourceLanguage");
const targetLanguage = document.getElementById("targetLanguage");

const translateButton = document.getElementById("translateButton");
const buttonText = document.getElementById("buttonText");

const charCount = document.getElementById("charCount");
const message = document.getElementById("message");
const resultStatus = document.getElementById("resultStatus");

const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");
const speakButton = document.getElementById("speakButton");


// ========================================
// 2. UPDATE CHARACTER COUNT
// ========================================

inputText.addEventListener("input", () => {
    charCount.textContent = `${inputText.value.length} / 500`;
});


// ========================================
// 3. SHOW MESSAGE
// ========================================

function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = `message ${type}`;
}

function clearMessage() {
    message.textContent = "";
    message.className = "message";
}


// ========================================
// 4. TRANSLATION API FUNCTION
// ========================================

async function translateText(text, from, to) {

    const url = new URL(
        "https://api.mymemory.translated.net/get"
    );

    url.searchParams.set("q", text);
    url.searchParams.set("langpair", `${from}|${to}`);

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            "Translation service is temporarily unavailable."
        );
    }

    const data = await response.json();

    if (
        data.responseStatus !== 200 ||
        !data.responseData ||
        !data.responseData.translatedText
    ) {
        throw new Error(
            data.responseDetails || "Unable to translate this text."
        );
    }

    return data.responseData.translatedText;
}


// ========================================
// 5. TRANSLATE BUTTON
// ========================================

translateButton.addEventListener("click", async () => {

    const text = inputText.value.trim();
    const from = sourceLanguage.value;
    const to = targetLanguage.value;

    clearMessage();

    // Check empty input

    if (!text) {
        showMessage("Please enter some text to translate.");
        inputText.focus();
        return;
    }

    // Same language check

    if (from === to) {
        showMessage("Please select a different target language.");
        return;
    }

    // Loading state

    translateButton.disabled = true;
    buttonText.textContent = "Translating...";
    resultStatus.textContent = "Connecting to translation API...";

    outputText.textContent = "Please wait while we translate your text.";

    copyButton.disabled = true;
    speakButton.disabled = true;

    try {

        // Wait for the API response

        const translatedText = await translateText(
            text,
            from,
            to
        );

        // Update the page dynamically

        outputText.textContent = translatedText;

        resultStatus.textContent = "Translation completed";

        copyButton.disabled = false;
        speakButton.disabled = false;

        showMessage(
            "Your translation is ready!",
            "success"
        );

    } catch (error) {

        console.error("Translation error:", error);

        outputText.textContent =
            "Your translation could not be completed.";

        resultStatus.textContent = "Translation failed";

        showMessage(
            error.message ||
            "Something went wrong. Please try again."
        );

    } finally {

        // Restore the button even if an error occurs

        translateButton.disabled = false;
        buttonText.textContent = "Translate now";

    }

});


// ========================================
// 6. CLEAR INPUT AND OUTPUT
// ========================================

clearButton.addEventListener("click", () => {

    inputText.value = "";

    charCount.textContent = "0 / 500";

    outputText.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">文</div>
            <p>Your translation will appear here.</p>
            <span>Choose a language and get started.</span>
        </div>
    `;

    resultStatus.textContent = "Ready to translate";

    copyButton.disabled = true;
    speakButton.disabled = true;

    clearMessage();

    inputText.focus();

});


// ========================================
// 7. COPY TRANSLATION
// ========================================

copyButton.addEventListener("click", async () => {

    const translatedText = outputText.textContent.trim();

    if (!translatedText) {
        return;
    }

    try {

        await navigator.clipboard.writeText(translatedText);

        showMessage("Translation copied to clipboard!", "success");

    } catch (error) {

        showMessage(
            "Unable to copy. Please select and copy the text manually."
        );

    }

});


// ========================================
// 8. LISTEN TO TRANSLATION
// ========================================

speakButton.addEventListener("click", () => {

    const translatedText = outputText.textContent.trim();

    if (!translatedText || !("speechSynthesis" in window)) {

        showMessage(
            "Text-to-speech is not supported in this browser."
        );

        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(
        translatedText
    );

    speech.lang = targetLanguage.value;

    speech.rate = 0.9;

    window.speechSynthesis.speak(speech);

});


// ========================================
// 9. ENTER KEY SHORTCUT
// ========================================

inputText.addEventListener("keydown", (event) => {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {
        event.preventDefault();
        translateButton.click();
    }

});


// ========================================
// 10. INITIAL STATE
// ========================================

console.log("LinguaX Translator is ready!");
