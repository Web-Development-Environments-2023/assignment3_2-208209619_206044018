const axios = require("axios");
const { param } = require("../user");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


// async function getRecipeInformation(recipe_id) {
//     return await axios.get(`${api_domain}/${recipe_id}/information`, {
//         params: {
//             includeNutrition: false,
//             apiKey: process.env.spooncular_apiKey
//         }
//     });
// }
async function getRecipeDetailsAPI(recipes_list) {
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

async function getRecipeDetailsFamily(recipes_list) {
    //TODO
    recipes_final = []
    for(i=0; i<recipes_list.length; i++){
        let recipe = recipes_list[i][0];
        let ingre = recipes_list[i][1];
        let steps = recipes_list[i][2];

        ingredient_list = ingre.map((ingredient) => {
            const name = ingredient.ingredient_name;
            const amount= ingredient.amount;
            // const unitLong = ingredient.unitLong;
            return {name, amount}
        });


        recipes_final.push({
            recipe_id: recipe.id,
            recipe_name: recipe.recipe_name,
            prepare_time: recipe.prepare_time,
            image_recipe: recipe.image_recipe,
            portions: recipe.portions,
            likes: recipe.likes,
            is_vegan: recipe.is_vegan,
            is_veget: recipe.is_veget,
            is_glutenFree: recipe.is_glutenFree,
            recipe_ingredient: ingredient_list,
            recipe_instruction: steps,
            recipe_owner: recipe.recipe_owner, 
            when_prepared: recipe.when_prepared
            
        })
    }

    return recipes_final
}

async function getRecipeDetailsPersonal(recipes_list) {
    //TODO
    recipes_final = []
    for(i=0; i<recipes_list.length; i++){
        let recipe = recipes_list[i][0];
        let ingre = recipes_list[i][1];
        let steps = recipes_list[i][2];

        ingredient_list = ingre.map((ingredient) => {
            const name = ingredient.ingredient_name;
            const amount= ingredient.amount;
            // const unitLong = ingredient.unitLong;
            return {name, amount}
        });

        recipes_final.push({
            recipe_id: recipe.id,
            recipe_name: recipe.recipe_name,
            prepare_time: recipe.prepare_time,
            image_recipe: recipe.image_recipe,
            portions: recipe.portions,
            likes: recipe.likes,
            is_vegan: recipe.is_vegan,
            is_veget: recipe.is_veget,
            is_glutenFree: recipe.is_glutenFree,
            recipe_ingredient: ingredient_list,
            recipe_instruction: steps
            
        })
    }

    return recipes_final
}



async function getRecipesPreview(recipe_array) {

    let API_id_list = [];
    let Personal_id_list = [];
    let Family_id_list = [];
    for (i=0; i<recipe_array.length; i++){
        let recipe_type = recipe_array[i][1];
        let recipe_id = recipe_array[i][0];
        if (recipe_type=='API'){
            API_id_list.push(recipe_id);
        }
        else if (recipe_type=='personal'){
            Personal_id_list.push(recipe_id); 
        }
        else if (recipe_type=='family'){
            Family_id_list.push(recipe_id);
        }

    }

    //get the recipes from the API spoon
    rec_api = handleApiRecipeById(API_id_list);

    //TODO - get the recipes from family recipes
    rec_family = handleFamilyRecipeById(Family_id_list);

    //TODO - get the recipes from personal recipes
    rec_personal = handlePersonalRecipeById(Personal_id_list);

    return {"API": rec_api, 
            "personal": rec_personal,
            "family": rec_family}

}

async function handleFamilyRecipeById(recipes_id_list) {
    recipes_f_list=[]
    for(i=0; i<recipes_id_list.length; i++){
        const result_recipe = await DButils.execQuery(`SELECT * from FamilyRecipes WHERE recipe_id='${recipes_id_list[i]}'`);
        const result_ingre = await DButils.execQuery(`SELECT ingredient_name, amount from RecipesIngredients WHERE recipe_id='${recipes_id_list[i]}' AND recipe_type=family`);
        const result_steps = await DButils.execQuery(`SELECT step_description from RecipesInstructions WHERE recipe_id='${recipes_id_list[i]}' AND recipe_type=family ORDER BY step_number`);

        recipes_p_list.push([result_recipe, result_ingre, result_steps]);
    }
    return getRecipeDetailsFamily(recipes_f_list);
}

async function handlePersonalRecipeById(recipes_id_list) {
    recipes_p_list=[]
    for(i=0; i<recipes_id_list.length; i++){
        const result_recipe = await DButils.execQuery(`SELECT * from PersonalRecipes WHERE recipe_id='${recipes_id_list[i]}'`);
        const result_ingre = await DButils.execQuery(`SELECT ingredient_name, amount from from RecipesIngredients WHERE recipe_id='${recipes_id_list[i]}' AND recipe_type=personal`);
        const result_steps = await DButils.execQuery(`SELECT step_description from RecipesInstructions WHERE recipe_id='${recipes_id_list[i]}' AND recipe_type=personal ORDER BY step_number`);
        recipes_p_list.push([result_recipe, result_ingre, result_steps]);
    }
    return getRecipeDetailsPersonal(recipes_p_list);
}

async function handleApiRecipeById(recipes_id_list) {
    const idString = API_id_list.map(item => item.toString()).join(',');
    let response = await handleInfoBulk(idString);
    const recipes = await getRecipeDetailsAPI(response.data);
    return recipes;
}


async function getRecipeDetailsFamily(recipes_list){
    //TODO
    recipes_final = []

}

async function getRecipeDetailsPersonal(recipes_list){
    //TODO
}



async function RandomRecipe(number) {
    let response = await handleRandomRecipe(number);
    let recipes = await getRecipeDetailsAPI(response.data.recipes);
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

    const recipes = await getRecipeDetailsAPI(response.data);
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
    



exports.getRecipeDetailsAPI = getRecipeDetailsAPI;
exports.searchRecipes = searchRecipes;
exports.RandomRecipe = RandomRecipe;
exports.getRecipesPreview = getRecipesPreview;
exports.handlePersonalRecipeById = handlePersonalRecipeById;
exports.handleFamilyRecipeById = handleFamilyRecipeById;

