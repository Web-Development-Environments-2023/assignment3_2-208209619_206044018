const axios = require("axios");
const { param } = require("../user");
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



async function getRecipeDetails(recipes_list) {
    recipes_final = []
    for(i=0; i<recipes_list.length; i++){
        let { id, title, readyInMinutes, image, servings, aggregateLikes, extendedIngredients,analyzedInstructions, vegan, vegetarian, glutenFree } = recipes_list[i];


        ingredient_list = extendedIngredients.map((ingredient) => {
            const { name } = ingredient;
            const { amount } = ingredient.measures.us;
            const { unitLong } = ingredient.measures.us;
            return {name, amount, unitLong}
        });

        instruct_list = analyzedInstructions.map((instruction) => {
            const steps = instruction.steps.map((step) => step.step);
          
            return { steps};
          });
     

        recipes_final.push({
            recipe_id: id,
            recipe_name: title,
            prepare_time: readyInMinutes,
            image_recipe: image,
            portions: servings,
            likes: aggregateLikes,
            is_vegan: vegan,
            is_veget: vegetarian,
            is_glutenFree: glutenFree,
            recipe_ingredient: ingredient_list,
            recipe_instruction: instruct_list
            
        })
    }

    return recipes_final
}

async function RandomRecipe(number) {
    let response = await handleRandomRecipe(number);
    let recipes = await getRecipeDetails(response.data.recipes);
    return recipes;
    
}
async function handleRandomRecipe(number) {
    return await axios.get(`${api_domain}/random`, {
        headers:{
            "x-api-key":process.env.APIKEYSPOON
        },
        params: {
            "number":number
        }
    });
}


async function searchRecipes(amount_recipes, recipe_name, cuisine, diet, intolerance) {
    let apiResponse = await handlesearchRecipes(amount_recipes, recipe_name, cuisine, diet, intolerance);

    //the id of the recipes search
    console.log(apiResponse.data.results);
    const idList = apiResponse.data.results.map(result => result.id);
    const idString = idList.map(item => item.toString()).join(',');
    let response = await handleInfoBulk(idString);

    const recipes = await getRecipeDetails(response.data);
    console.log(recipes);
    return recipes;
    
}
async function handlesearchRecipes(amount_recipes=5, recipe_name, cuisine, diet, intolerance) {
    list_arguments = [parseInt(amount_recipes), recipe_name, cuisine, diet, intolerance]
    list_params_name = ["number", "query", "cuisine", "diet", "intolerances"]
    params_api = {};

    for(let i=0; i<5; i++){
        if (list_arguments[i] !== 'null'){
            params_api[list_params_name[i]]=list_arguments[i]
        }
    }

    return await axios.get(`${api_domain}/complexSearch`, {
        headers:{
            "x-api-key":process.env.APIKEYSPOON
        },
        params: params_api
    });
}

async function handleInfoBulk(id_string) {
    return await axios.get(`${api_domain}/informationBulk`, {
        headers:{
            "x-api-key":process.env.APIKEYSPOON
        },
        params: {            
            "ids": id_string
    }
    });
}
    



exports.getRecipeDetails = getRecipeDetails;
exports.searchRecipes = searchRecipes;
exports.RandomRecipe = RandomRecipe;

