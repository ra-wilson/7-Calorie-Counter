// // Import and configure Firebase
// import firebase from 'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js';
// import 'https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js';
// import 'https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js';

// Replace the configuration object with your own Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBRj9v5HWIXL_QEAMv2Qrx645mkEphe6Rw",
  authDomain: "calorie-counter-b8b8c.firebaseapp.com",
  projectId: "calorie-counter-b8b8c",
  storageBucket: "calorie-counter-b8b8c.appspot.com",
  messagingSenderId: "726787238895",
  appId: "1:726787238895:web:b2e26d7cc4fe3515dbe41a",
  measurementId: "G-FL5ET271Q4",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Variables to store calorie data
let calorieGoal = 0;
let dailyCalories = {
  breakfast: 0,
  lunch: 0,
  dinner: 0,
  snacks: 0,
};

// Set calorie goal
$("#calorie-goal-form").submit(function (event) {
  event.preventDefault();
  calorieGoal = parseInt($("#calorie-goal").val());
  $("#daily-goal").text(calorieGoal);
  $("#submit-goal").text("Edit goal");
});

// Add meal input
$(".meal-form").on("submit", async function (e) {
  e.preventDefault();

  // Get the currently selected date from the datepicker
  const selectedDate = $("#datepicker").datepicker("getDate");
  const formattedDate = selectedDate.toISOString().split("T")[0];
  // Check if the selected date is in the future
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  if (selectedDate > currentDate) {
    alert("You cannot add meals to future dates.");
    return;
  }

  if (!firebase.auth().currentUser) {
    alert("Please log in to add meals.");
    return;
  }

  const userId = firebase.auth().currentUser.uid;
  const mealType = $(this).data("meal-type");
  const foodItems = $(this)
    .find("input")
    .val()
    .split(",")
    .map((item) => item.trim());
  const foodItemsContainer = $(this).find(".food-items-container");

  const caloriesPromises = foodItems.map((item) => getCaloriesFromAPI(item));

  Promise.all(caloriesPromises)
    .then(async (caloriesArray) => {
      const totalCalories = caloriesArray.reduce((a, b) => a + b, 0);
      dailyCalories[mealType] += totalCalories;
      updateCalorieSummary();
      saveDailyCalories();

      // Save meal data to Firestore
      // Save meal data to Firestore
      try {
        await db.collection("users").doc(userId).collection("meals").add({
          date: formattedDate, // Save the meal with the selected date
          mealType,
          foodItems,
          calories: totalCalories,
        });
      } catch (error) {
        console.error("Error adding meal data to Firestore:", error);
      }

      // Add the input food items to the container
      foodItems.forEach((foodItem, index) => {
        const foodItemElement = $("<p>").text(
          `${foodItem} (${caloriesArray[index]} calories)`
        );
        const deleteIcon = $("<i>").addClass("fas fa-trash-alt delete-icon");
        foodItemElement.append(deleteIcon);
        foodItemsContainer.append(foodItemElement);

        deleteIcon.on("click", () => {
          dailyCalories[mealType] -= caloriesArray[index];
          updateCalorieSummary();
          foodItemElement.remove();
        });
      });

      // Clear the input field
      $(this).find("input").val("");
    })
    .catch((error) => {
      console.error("Error fetching calorie data:", error);
    });
});

// Function to make AJAX call to Ninja Nutrition API
function getCaloriesFromAPI(query) {
  return new Promise((resolve, reject) => {
    $.ajax({
      method: "GET",
      url: "https://api.api-ninjas.com/v1/nutrition?query=" + query,
      headers: { "X-Api-Key": "i5PsWsLfdY890euq8xNxCg==gDrteQ1qs1O03zXG" },
      contentType: "application/json",
      success: function (result) {
        console.log(result);
        const calories = Math.round(result[0].calories);
        resolve(calories);
      },
      error: function (jqXHR) {
        console.error("Error: ", jqXHR.responseText);
        reject(jqXHR);
      },
    });
  });
}

async function loadMealsForDate(date) {
  const userId = firebase.auth().currentUser.uid;
  const mealsSnapshot = await db
    .collection("users")
    .doc(userId)
    .collection("meals")
    .where("date", "==", date)
    .get();

  // Clear the current meal data in the meal sections
  $(".food-items-container").empty();

  // Iterate through the meal documents and update the meal sections
  mealsSnapshot.forEach((doc) => {
    const mealData = doc.data();
    const mealType = mealData.mealType;
    const foodItemsContainer = $(`.meal-form[data-meal-type="${mealType}"]`).find(".food-items-container");

    mealData.foodItems.forEach((foodItem, index) => {
      const foodItemElement = $("<p>").text(`${foodItem} (${mealData.calories} calories)`);
      const deleteIcon = $("<i>").addClass("fas fa-trash-alt delete-icon");
      foodItemElement.append(deleteIcon);
      foodItemsContainer.append(foodItemElement);

      deleteIcon.on("click", () => {
        // Add logic to remove the meal from Firestore and update the UI
      });
    });
  });
}


$("#login-form").submit(function (event) {
  event.preventDefault();
  const email = $("#login-username").val();
  const password = $("#login-password").val();

  auth
    .signInWithEmailAndPassword(email, password)
    .then((result) => {
      console.log(result);
      loginUser(); // Call loginUser() after a successful login
    })
    .catch((error) => {
      console.error("Error: ", error.message);
    });
});

// Update the registration function
$("#register-form").submit(function (event) {
  event.preventDefault();
  const email = $("#register-username").val();
  const password = $("#register-password").val();

  auth
    .createUserWithEmailAndPassword(email, password)
    .then((result) => {
      console.log(result);
      alert("Registration successful! You can now log in.");
    })
    .catch((error) => {
      console.error("Error: ", error.message);
    });
});

$("#show-login").on("click", function (e) {
  e.preventDefault();
  $("#register-container").hide();
  $("#login-container").show();
});

$("#show-register").on("click", function (e) {
  e.preventDefault();
  $("#login-container").hide();
  $("#register-container").show();
});

$("#datepicker").datepicker({
  onSelect: async function (dateText, inst) {
    const selectedDate = dateText.split("/").reverse().join("-");
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const pickedDate = new Date(selectedDate);

    // Disable the meal input forms if the picked date is in the future
    if (pickedDate > currentDate) {
      $(".meal-form input[type='text']").prop("disabled", true);
      $(".meal-form button[type='submit']").prop("disabled", true);
      $(".food-items-container").empty();
      alert("You cannot add meals to future dates.");
    } else {
      $(".meal-form input[type='text']").prop("disabled", false);
      $(".meal-form button[type='submit']").prop("disabled", false);
      const meals = await fetchMealDataForDate(selectedDate);
      updateMealDisplay(meals);
    }
  },
});

async function fetchMealDataForDate(date) {
  const userId = firebase.auth().currentUser.uid;
  const userDocRef = firebase.firestore().collection("users").doc(userId);
  const querySnapshot = await userDocRef
    .collection("meals")
    .where("date", "==", firebase.firestore.Timestamp.fromDate(new Date(date)))
    .get();

  if (!querySnapshot.empty) {
    let meals = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      meals[data.mealType].push({
        id: doc.id,
        foodItems: data.foodItems,
        calories: data.calories,
      });
    });

    return meals;
  } else {
    return {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };
  }
}

function saveDailyCalories() {
  const userId = firebase.auth().currentUser.uid;
  const date = dailyCalories.date;
  const userDocRef = firebase.firestore().collection("users").doc(userId);
  userDocRef.collection("calories").doc(date).set(dailyCalories);
}

function resetDailyCalories() {
  dailyCalories = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 0,
  };
}

// Function to update calorie summary

function updateCalorieSummary() {
  const totalCalories = Object.values(dailyCalories)
    .filter((value) => typeof value === "number")
    .reduce((a, b) => a + b, 0);

  // Update the calorie goal and total calories display
  $("#total-calories").text(totalCalories);
  $("#calorie-goal").text(calorieGoal);

  // Get the user's weight goal selection
  const weightGoal = $('input[name="weight-goal"]:checked').val();

  // Change the color based on the goal status and user selection
  if (weightGoal === "deficit" && totalCalories < calorieGoal) {
    $("#total-calories").removeClass("goal-not-met").addClass("goal-met");
  } else if (
    weightGoal === "surplus" &&
    totalCalories >= calorieGoal - 200 &&
    totalCalories <= calorieGoal + 300
  ) {
    $("#total-calories").removeClass("goal-not-met").addClass("goal-met");
  } else {
    $("#total-calories").removeClass("goal-met").addClass("goal-not-met");
  }
}

function updateMealDisplay(meals) {
  // Clear the current meal display
  $(".food-items-container").empty();

  // Add the fetched meal data to the display
  for (const mealType in meals) {
    const mealForm = $(`.meal-form[data-meal-type="${mealType}"]`);
    const foodItemsContainer = mealForm.find(".food-items-container");

    meals[mealType].forEach((meal) => {
      meal.foodItems.forEach((foodItem, index) => {
        const foodItemElement = $("<p>").text(
          `${foodItem} (${meal.calories[index]} calories)`
        );
        const deleteIcon = $("<i>").addClass("fas fa-trash-alt delete-icon");
        foodItemElement.append(deleteIcon);
        foodItemsContainer.append(foodItemElement);

        deleteIcon.on("click", () => {
          // Update dailyCalories, remove the food item, and update the UI
        });
      });
    });
  }
}

const SESSION_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

// Check if the user is already logged in when the page is loaded
$(document).ready(function () {
  const loginState = localStorage.getItem("loggedIn");
  const lastActivity = localStorage.getItem("lastActivity");
  const currentTime = new Date().getTime();

  if (
    loginState === "true" &&
    currentTime - lastActivity < SESSION_EXPIRY_TIME
  ) {
    showMainContainer();
    updateActivity();
  } else {
    localStorage.setItem("loggedIn", "false");
    localStorage.removeItem("lastActivity");
    showAuthContainer();
  }
});

// Update the user's last activity timestamp
function updateActivity() {
  const currentTime = new Date().getTime();
  localStorage.setItem("lastActivity", currentTime);
}

// Log the user in and update the session
function loginUser() {
  localStorage.setItem("loggedIn", "true");
  updateActivity();
  showMainContainer();
}

// Log the user out and clear the session

function logoutUser() {
  auth
    .signOut()
    .then(() => {
      localStorage.setItem("loggedIn", "false");
      localStorage.removeItem("lastActivity");
      showAuthContainer();
      alert("You have been logged out.");
    })
    .catch((error) => {
      console.error("Error: ", error.message);
      alert("Failed to log out. Please try again.");
    });
}

// Set up event listeners for login and logout buttons
$(document).on("click", "#login-button", loginUser);
$(document).on("click", "#logout-button", logoutUser);

// Update the last activity timestamp whenever the user interacts with the page
$(document).on("mousemove keydown click", updateActivity);

// Show and hide the auth container and main container
function showAuthContainer() {
  $("#auth-container").show();
  $("#main-container").hide();
  $("#logout-button").hide(); // Hide the logout button when showing the auth container
}

function showMainContainer() {
  $("#auth-container").hide();
  $("#main-container").show();
  $("#logout-button").show(); // Show the logout button when showing the main container
}
