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
    $("#submit-goal").text('Edit goal');
});


// Add meal input
$(".meal-form").on("submit", function (e) {
  e.preventDefault();
  const mealType = $(this).data("meal-type");
  const foodItems = $(this).find("input").val().split(",").map(item => item.trim());
  const foodItemsContainer = $(this).find(".food-items-container");

  const caloriesPromises = foodItems.map(item => getCaloriesFromAPI(item));

  Promise.all(caloriesPromises)
      .then(caloriesArray => {
          const totalCalories = caloriesArray.reduce((a, b) => a + b, 0);
          dailyCalories[mealType] += totalCalories;
          updateCalorieSummary();

          // Add the input food items to the container
          foodItems.forEach((foodItem, index) => {
              const foodItemElement = $("<p>").text(`${foodItem} (${caloriesArray[index]} calories)`);
              const deleteIcon = $('<i>').addClass('fas fa-trash-alt delete-icon');
              foodItemElement.append(deleteIcon);
              foodItemsContainer.append(foodItemElement);
          

          deleteIcon.on("click", () => {
            dailyCalories[mealType] -= caloriesArray[index];
            updateCalorieSummary();
            foodItemElement.remove();
          })
        });

          // Clear the input field
          $(this).find("input").val("");
      })
      .catch(error => {
          console.error("Error fetching calorie data:", error);
      });
});



// Function to make AJAX call to Ninja Nutrition API (replace with actual API call)
// Function to make AJAX call to Ninja Nutrition API
 function getCaloriesFromAPI(query) {
  return new Promise((resolve, reject) => {
      $.ajax({
          method: 'GET',
          url: 'https://api.api-ninjas.com/v1/nutrition?query=' + query,
          headers: { 'X-Api-Key': 'i5PsWsLfdY890euq8xNxCg==gDrteQ1qs1O03zXG'},
          contentType: 'application/json',
          success: function(result) {
              console.log(result); // Log the API response
              const calories = Math.round(result[0].calories);
              resolve(calories);
          },
          error: function(jqXHR) {
              console.error('Error: ', jqXHR.responseText);
              reject(jqXHR);
          }
      });
  });
} 

// function getCaloriesFromAPI(query) {
//   return new Promise((resolve, reject) => {
//     $.ajax({
//       method: 'POST',
//       url: '/api/nutrition',
//       data: JSON.stringify({ query }),
//       contentType: 'application/json',
//       success: function (result) {
//         console.log(result); // Log the API response
//         const calories = Math.round(result[0].calories);
//         resolve(calories);
//       },
//       error: function (jqXHR) {
//         console.error('Error: ', jqXHR.responseText);
//         reject(jqXHR);
//       },
//     });
//   });
// }


$("#login-form").submit(function (event) {
  event.preventDefault();
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  $.ajax({
    method: 'POST',
    url: '/login',
    data: JSON.stringify({ username, password }),
    contentType: 'application/json',
    success: function (result) {
      console.log(result);
      $("#auth-container").hide();
      $("#main-container").show();
    },
    error: function (jqXHR) {
      console.error('Error: ', jqXHR.responseText);
    },
  });
});


$("#register-form").submit(function (event) {
  event.preventDefault();
  const username = $("#register-username").val();
  const password = $("#register-password").val();

  $.ajax({
    method: 'POST',
    url: '/register',
    data: JSON.stringify({ username, password }),
    contentType: 'application/json',
    success: function (result) {
      console.log(result);
      alert('Registration successful! You can now log in.');
    },
    error: function (jqXHR) {
      console.error('Error: ', jqXHR.responseText);
    },
  });
});





// Function to update calorie summary
function updateCalorieSummary() {
    const totalCalories = Object.values(dailyCalories).reduce((a, b) => a + b, 0);
    // Update the display with the totalCalories and calorieGoal
}


// Initialize datepicker
$("#datepicker").datepicker({
  onSelect: function (dateText, inst) {
      // Fetch calorie data for the selected date and update the display
      // You'll need to implement the logic to fetch data from your database
  },
});

// Function to update calorie summary
// function updateCalorieSummary() {
//   const totalCalories = Object.values(dailyCalories).reduce((a, b) => a + b, 0);
//   const calorieStatus = totalCalories > calorieGoal ? "beyond" : "within";
//   const calorieDifference = Math.abs(totalCalories - calorieGoal);
  
//   const summaryText = `Today's total calories: ${totalCalories} (Goal: ${calorieGoal}). You are ${calorieDifference} calories ${calorieStatus} your goal.`;
//   $("#calorie-summary-text").text(summaryText);
// }


function updateCalorieSummary() {
    const totalCalories = Object.values(dailyCalories).reduce((a, b) => a + b, 0);
    
    // Update the calorie goal and total calories display
    $("#total-calories").text(totalCalories);
    $("#calorie-goal").text(calorieGoal);
  
    // Change the color based on the goal status
    if (totalCalories < calorieGoal) {
      $("#total-calories").removeClass('goal-met').addClass('goal-not-met');    
    } else {
      $("#total-calories").removeClass('goal-not-met').addClass('goal-met');
    }
  }



