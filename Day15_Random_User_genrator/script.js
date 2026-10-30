const generateBtn = document.getElementById("generate-btn");

const userImage = document.getElementById("user-image");
const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");
const userPhone = document.getElementById("user-phone");
const userAge = document.getElementById("user-age");
const userGender = document.getElementById("user-gender");
const userLocation = document.getElementById("user-location");
const userCountry = document.getElementById("user-country");
const statusMessage = document.getElementById("status");

async function generateRandomUser() {
    generateBtn.disabled = true;
    generateBtn.textContent = "Loading...";
    statusMessage.textContent = "Fetching random user data...";

    try {
        // 1. Fetch data from the API
        const response = await fetch("https://randomuser.me/api/");

        // 2. Check whether the request was successful
        if (!response.ok) {
            throw new Error("Failed to fetch user data.");
        }

        // 3. Convert JSON response into JavaScript data
        const data = await response.json();

        // 4. Get the first random user
        const user = data.results[0];

        if (!user) {
            throw new Error("No user data received.");
        }

        // 5. Display user information on the webpage
        userImage.src = user.picture.large;
        userImage.alt = `Profile picture of ${user.name.first}`;

        userName.textContent =
            `${user.name.title} ${user.name.first} ${user.name.last}`;

        userEmail.textContent = user.email;
        userPhone.textContent = user.phone;
        userAge.textContent = user.dob.age;
        userGender.textContent = user.gender;

        userLocation.textContent =
            `${user.location.city}, ${user.location.state}`;

        userCountry.textContent = user.location.country;

        statusMessage.textContent = "Random user generated successfully!";

    } catch (error) {
        // 6. Handle network errors and other failures
        console.error("Error:", error);

        statusMessage.textContent =
            "Unable to load user data. Please check your internet and try again.";

    } finally {
        // 7. Restore the button whether successful or unsuccessful
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate Random User";
    }
}

// Generate a user when the button is clicked
generateBtn.addEventListener("click", generateRandomUser);

// Generate the first user when the page opens
generateRandomUser();