const axios = require("axios");
const { param } = require("../user");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");
const recipe_utils = require("./recipes_utils");



async function markAsFavorite(user_id, recipe_id, recipe_type){
    await DButils.execQuery(`insert into FavoriteRecipes values (${user_id}, ${recipe_id},'${recipe_type}')`);
    return;
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`SELECT recipe_id, recipe_type from FavoriteRecipes WHERE user_id='${user_id}'`);
    return recipes_id;
}

async function getPersonalRecipes(user_id){
    const recipes_id = await DButils.execQuery(`SELECT recipe_id from PersonalRecipes WHERE user_id='${user_id}'`);
    const ids = recipes_id.map(item => item.recipe_id);
    const result = await recipe_utils.handlePersonalRecipeById(ids);
    return result;
}

async function getFamilyRecipes(user_id){
    const recipes_id = await DButils.execQuery(`SELECT recipe_id from FamilyRecipes WHERE user_id='${user_id}'`);
    const ids = recipes_id.map(item => item.recipe_id)
    const result = await recipe_utils.handleFamilyRecipeById(ids);
    return result;
}


async function getViewedRecipes(user_id,amount=0){
    if (amount==0){
        const recipes = await DButils.execQuery(`SELECT recipe_id from ViewedRecipes where user_id='${user_id}'`);

    }  
    else{
        const recipes = await DButils.execQuery(`SELECT recipe_id, recipe_type
        FROM ViewedRecipes
        WHERE user_id = '${user_id}'
        ORDER BY date_time DESC
        LIMIT 3;`);

    }
    return recipes;
}

async function putViewedRecipes(user_id,recipe_id, recipe_type){

    const insertQuery = `INSERT INTO ViewedRecipes (user_id, recipe_id, recipe_type, date_time) VALUES ('${user_id}', '${recipe_id}', '${recipe_type}', CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE date_time = CURRENT_TIMESTAMP`;
    await DButils.execQuery(insertQuery);
    test_put_viewed = await DButils.execQuery(`SELECT * FROM ViewedRecipes`);
    console.log(test_put_viewed);
    return; 
  
}



async function createPersonalRecipe(user_id,recipe_name,prepare_time,likes,is_vegan,is_veget,is_glutenFree,portions,image_recipe,RecipesIngredients, RecipesInstructions){

    const insertRecipeQuery = `INSERT INTO PersonalRecipes (user_id, recipe_name, prepare_time, likes, is_vegan, is_veget, is_glutenFree, portions, image_recipe) 
                               VALUES (${user_id}, '${recipe_name}', ${prepare_time}, ${likes}, '${is_vegan}', '${is_veget}', '${is_glutenFree}', ${portions}, '${image_recipe}')`;

    const insertRecipeResult = await DButils.execQuery(insertRecipeQuery);
    const recipe_id = insertRecipeResult.insertId;

    const values = [];
    for (let i = 0; i < RecipesIngredients.length; i++) {
      const ingredient_name = RecipesIngredients[i].ingredient_name;
      const amount = RecipesIngredients[i].amount;
      const unitLong = RecipesIngredients[i].unitLong;
      values.push(`(${recipe_id}, 'personal', '${ingredient_name}', ${amount}, '${unitLong}')`);
    }

    const insertIngredientsQuery = `INSERT INTO RecipesIngredients (recipe_id, recipe_type, ingredient_name, amount, unitLong) VALUES ${values.join(", ")}`;

    const insertIngredientsResult = await DButils.execQuery(insertIngredientsQuery);

    const steps = RecipesInstructions.map((step_description) => `( ${recipe_id}, 'personal', '${step_description}')`);
    const insertInstructionsQuery = `INSERT INTO RecipesInstructions (recipe_id, recipe_type, step_description) VALUES ${steps.join(", ")}`;

    const insertInstructionsResult = await DButils.execQuery(insertInstructionsQuery);

    console.log("Inserted recipe_id: ", recipe_id);
    return recipe_id;

}

async function createFamilyRecipe(user_id,recipe_name,prepare_time,likes,is_vegan,is_veget,is_glutenFree,portions,image_recipe,recipe_owner,when_prepared,RecipesIngredients, RecipesInstructions){
    const insertRecipeQuery = `INSERT INTO FamilyRecipes (user_id, recipe_name, prepare_time, likes, is_vegan, is_veget, is_glutenFree, portions, image_recipe,recipe_owner,when_prepared) 
    VALUES (${user_id}, '${recipe_name}', ${prepare_time}, ${likes}, '${is_vegan}', '${is_veget}', '${is_glutenFree}', ${portions}, '${image_recipe}','${recipe_owner}','${when_prepared}')`;
    console.log("here1");
    const insertRecipeResult = await DButils.execQuery(insertRecipeQuery);
    const recipe_id = insertRecipeResult.insertId;
    console.log("here2");

    const values = [];
    for (let i = 0; i < RecipesIngredients.length; i++) {
      const ingredient_name = RecipesIngredients[i].ingredient_name;
      const amount = RecipesIngredients[i].amount;
      const unitLong = RecipesIngredients[i].unitLong;
      values.push(`(${recipe_id}, 'family', '${ingredient_name}', ${amount}, '${unitLong}')`);
    }
    console.log("here3");

    const insertIngredientsQuery = `INSERT INTO RecipesIngredients (recipe_id, recipe_type, ingredient_name, amount, unitLong) VALUES ${values.join(", ")}`;

    const insertIngredientsResult = await DButils.execQuery(insertIngredientsQuery);
    console.log("here4");

    const steps = RecipesInstructions.map((step_description) => `( ${recipe_id}, 'family', '${step_description}')`);
    const insertInstructionsQuery = `INSERT INTO RecipesInstructions (recipe_id, recipe_type, step_description) VALUES ${steps.join(", ")}`;

    const insertInstructionsResult = await DButils.execQuery(insertInstructionsQuery);
    console.log("here5");

    console.log("Inserted recipe_id: ", recipe_id);

    console.log("Tables: ", recipe_id);
    return recipe_id;

}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getViewedRecipes = getViewedRecipes;
exports.putViewedRecipes = putViewedRecipes;
exports.getFamilyRecipes = getFamilyRecipes;
exports.getPersonalRecipes = getPersonalRecipes;
exports.createPersonalRecipe = createPersonalRecipe;
exports.createFamilyRecipe = createFamilyRecipe;

