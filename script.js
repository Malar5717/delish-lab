// API used: MealDB https://www.themealdb.com/api.php 

const button = document.querySelector(".controls");
const resultCard = document.querySelector(".recipe-card");
button.addEventListener("click", () => {
    resultCard.classList.add("active");
})

// target = currently clicked element 
document.body.addEventListener("click", (e) => {
    if (!resultCard.contains(e.target) && !button.contains(e.target)) {
      resultCard.classList.remove("active");
    }
});

document.getElementById("fridgeBtn").addEventListener("click", () => {
    // filtering endpoint for MealDB filter.php?c for categories.php 
    fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert")
        .then(response => response.json())
        .then(data => {
            console.log("DA",data);
            showRecipe(data);
        })
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
    const card = document.querySelector(".recipe-card");
    const description = card.querySelector(".description");
    const instruction = card.querySelector(".instruction");

// list of measure + ingredient 
    let ingredientsHTML = "<ul class='ingredients'>";
    for (let i = 1; i <= 20; i++) {
        const ingredient = data[`strIngredient${i}`];
        const measure = data[`strMeasure${i}`];
        if (ingredient) {
            ingredientsHTML += `<li>${measure} ${ingredient}</li>`;
        }
    }
    ingredientsHTML += "</ul>";

// Description content
    description.innerHTML = `
        <h2>${data.strMeal}</h2>
        <img src="${data.strMealThumb}" alt="${data.strMeal}" style="width:100%; border-radius: 10px; margin: 1vh 0;">
        <h4>Ingredients</h4>
        ${ingredientsHTML}
    `;

// Instructions content
    instruction.innerHTML = `
        <h3>Instructions</h3>
        <p>${data.strInstructions}</p>
    `;
}

