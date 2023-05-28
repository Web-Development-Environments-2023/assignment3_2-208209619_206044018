const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    console.log(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}
async function RandomRecipe(number,tag,limitLicense) {
    let response = await handleRandomRecipe(number,tag,limitLicense);
    console.log(response);
    let recipes = response.data;
    return recipes;
    
}
async function handleRandomRecipe(number,tag,limitLicense) {
    return await axios.get(`${api_domain}/random`, {
        headers:{
            "x-api-key":process.env.APIKEYSPOON
        },
        params: {
            "number":number
        }
    });
}


//#todo example
async function test(recipe_id) {
    
    return {
       "id":process.env.APIKEYSPOON
        
    }
}



exports.getRecipeDetails = getRecipeDetails;
exports.test = test;
exports.RandomRecipe = RandomRecipe;

