// API used: MealDB https://www.themealdb.com/api.php 


document.getElementById("fridgeBtn").addEventListener("click", () => {
    // filtering endpoint for MealDB filter.php?c for categories.php 
    fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert")

    // 01 fetch() sends a request and returns a promise -resolves-> Response object.

        // Response is builtin class from fetch, response is the object i use 
        .then(response => response.json())

        // 02 .json() method returns a promise -resolves-> parsed usable JS object.

        // response stored in data 
        .then(data => {
            console.log(data);
            showRecipe(data);
        })

        // 03 data is the real Object, who properties are put to use 
        .catch(error => console.log(error));
});

document.getElementById("ovenBtn").addEventListener("click", () => {
    // filtering endpoint for MealDB filter.php?i for main ingredients.php 
    fetch("https://www.themealdb.com/api/json/v1/1/filter.php?i=baking_powder")
        .then(response => response.json())
        .then(data => {
            console.log(data);
            showRecipe(data);
        })
        .catch(error => console.error(error));
});

document.getElementById("stoveBtn").addEventListener("click", () => {
    // endpoint for random 
    fetch("https://www.themealdb.com/api/json/v1/1/random.php")
        .then(response => response.json())
        .then(data => {
            console.log(data);
            showRecipe(data);
        })
        .catch(error => console.error(error));
});

// function to show random recipe 
function showRecipe(data) {
    if (!data.meals || data.meals.length==0) return;

    const randomInx = Math.floor(Math.random()*data.meals.length);
    const randomMeal = data.meals[randomInx];

    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${randomMeal.idMeal}`)
        .then(response => response.json())
        .then(data => {
            // meals is an array and the expected result is the only element in it 
            display(data.meals[0])
        })
        .catch(error => console.error(error));
}

// function to display the recipe 
function display(data) {
    const result = document.getElementById("recipe-card");
    result.innerHTML = `
        <h2>${data.strMeal}</h2>
        <img src="${data.strMealThumb}" alt="${data.strMeal}" style="width:200px">
        <p>${data.strInstructions}...</p>
    `;
}

