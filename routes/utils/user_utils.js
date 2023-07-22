const axios = require("axios");
const { param } = require("../user");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");
const recipe_utils = require("./recipes_utils");


/**
 * Marks a recipe as a favorite for the specified user.
 * @param {number} user_id - The ID of the user marking the recipe as favorite.
 * @param {number} recipe_id - The ID of the recipe to mark as favorite.
 * @param {string} recipe_type - The type of the recipe (e.g., 'API', 'personal', 'family').
 * @returns {Promise<void>} - A promise that resolves when the recipe is marked as a favorite.
 */
async function markAsFavorite(user_id, recipe_id, recipe_type){
    await DButils.execQuery(`insert into FavoriteRecipes values (${user_id}, ${recipe_id},'${recipe_type}')`);
    return;
}


/**
 * Gets the favorite recipes of the specified user.
 * @param {number} user_id - The ID of the user to retrieve favorite recipes for.
 * @returns {Promise<Array<{recipe_id: number, recipe_type: string}>>} - A promise that resolves with an array of objects containing recipe IDs and types.
 */
async function getFavoriteRecipes(user_id) {
    const recipes_id = await DButils.execQuery(
      `SELECT recipe_id, recipe_type FROM FavoriteRecipes WHERE user_id='${user_id}'`
    );
    return recipes_id;
}


/**
 * Gets the personal recipes of the specified user.
 * @param {number} user_id - The ID of the user to retrieve personal recipes for.
 * @returns {Promise<Array<{recipe_id: number}>>} - A promise that resolves with an array of objects containing recipe IDs.
 */
async function getPersonalRecipes(user_id){
    const recipes_id = await DButils.execQuery(`SELECT recipe_id from PersonalRecipes WHERE user_id='${user_id}'`);
    const ids = recipes_id.map(item => item.recipe_id);
    const result = await recipe_utils.handlePersonalRecipeById(ids);
    return result;
}


/**
 * Gets the family recipes of the specified user.
 * @param {number} user_id - The ID of the user to retrieve family recipes for.
 * @returns {Promise<Array<{recipe_id: number}>>} - A promise that resolves with an array of objects containing recipe IDs.
 */
async function getFamilyRecipes(user_id){
    const recipes_id = await DButils.execQuery(`SELECT recipe_id from FamilyRecipes WHERE user_id='${user_id}'`);
    const ids = recipes_id.map(item => item.recipe_id)
    const result = await recipe_utils.handleFamilyRecipeById(ids);
    return result;
}


/**
 * Gets the viewed recipes of the specified user.
 * @param {number} user_id - The ID of the user to retrieve viewed recipes for.
 * @param {number} [amount=0] - The number of viewed recipes to retrieve (default is 0, which retrieves all viewed recipes).
 * @returns {Promise<Array<{recipe_id: number, recipe_type: string}>>} - A promise that resolves with an array of objects containing recipe IDs and types.
 */
async function getViewedRecipes(user_id,amount=0){
    recipes=[];
    if (amount==0){
        recipes = await DButils.execQuery(`SELECT recipe_id, recipe_type from ViewedRecipes where user_id='${user_id}'`);
    }  
    else{
        recipes = await DButils.execQuery(`SELECT recipe_id, recipe_type
        FROM ViewedRecipes
        WHERE user_id = '${user_id}'
        ORDER BY date_time DESC
        LIMIT 3;`);

    }
    return recipes;
}


/**
 * Updates the viewed recipes for the specified user.
 * @param {number} user_id - The ID of the user to update viewed recipes for.
 * @param {number} recipe_id - The ID of the recipe to update viewed status.
 * @param {string} recipe_type - The type of the recipe (e.g., 'API', 'personal', 'family').
 * @returns {Promise<void>} - A promise that resolves when the viewed recipes are updated.
 */
async function putViewedRecipes(user_id,recipe_id, recipe_type){

    const insertQuery = `INSERT INTO ViewedRecipes (user_id, recipe_id, recipe_type, date_time) VALUES ('${user_id}', '${recipe_id}', '${recipe_type}', CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE date_time = CURRENT_TIMESTAMP`;
    await DButils.execQuery(insertQuery);
    test_put_viewed = await DButils.execQuery(`SELECT * FROM ViewedRecipes`);
    console.log(test_put_viewed);
    return; 
  
}


/**
 * Creates a personal recipe for the specified user.
 * @param {number} user_id - The ID of the user to create the personal recipe for.
 * @param {string} recipe_name - The name of the personal recipe.
 * @param {number} prepare_time - The preparation time of the personal recipe (in minutes).
 * @param {number} likes - The number of likes for the personal recipe.
 * @param {string} is_vegan - Indicates whether the personal recipe is vegan ('true' or 'false').
 * @param {string} is_veget - Indicates whether the personal recipe is vegetarian ('true' or 'false').
 * @param {string} is_glutenFree - Indicates whether the personal recipe is gluten-free ('true' or 'false').
 * @param {number} portions - The number of portions the personal recipe serves.
 * @param {string} image_recipe - The URL of the image for the personal recipe.
 * @param {Array<{ingredient_name: string, amount: number, unitLong: string}>} RecipesIngredients - An array of objects representing the ingredients of the personal recipe.
 * @param {Array<string>} RecipesInstructions - An array of strings representing the instructions of the personal recipe.
 * @returns {Promise<number>} - A promise that resolves with the ID of the created personal recipe.
 */
async function createPersonalRecipe(user_id,recipe_name,prepare_time,likes,is_vegan,is_veget,is_glutenFree,portions,image_recipe,RecipesIngredients, RecipesInstructions){
    // Insert the personal recipe details into the PersonalRecipes table
    const insertRecipeQuery = `INSERT INTO PersonalRecipes (user_id, recipe_name, prepare_time, likes, is_vegan, is_veget, is_glutenFree, portions, image_recipe) 
                               VALUES (${user_id}, '${recipe_name}', ${prepare_time}, ${likes}, '${is_vegan}', '${is_veget}', '${is_glutenFree}', ${portions}, '${image_recipe}')`;

    const insertRecipeResult = await DButils.execQuery(insertRecipeQuery);
    const recipe_id = insertRecipeResult.insertId;

    // Insert the ingredients of the personal recipe into the RecipesIngredients table 
    const values = [];
    for (let i = 0; i < RecipesIngredients.length; i++) {
      const ingredient_name = RecipesIngredients[i].ingredient_name;
      const amount = RecipesIngredients[i].amount;
      const unitLong = RecipesIngredients[i].unitLong;
      values.push(`(${recipe_id}, 'personal', '${ingredient_name}', ${amount}, '${unitLong}')`);
    } 
    const insertIngredientsQuery = `INSERT INTO RecipesIngredients (recipe_id, recipe_type, ingredient_name, amount, unitLong) VALUES ${values.join(", ")}`;
    await DButils.execQuery(insertIngredientsQuery);

    // Insert the instructions of the personal recipe into the RecipesInstructions table
    const steps = RecipesInstructions.map((step_description) => `( ${recipe_id}, 'personal', '${step_description}')`);
    const insertInstructionsQuery = `INSERT INTO RecipesInstructions (recipe_id, recipe_type, step_description) VALUES ${steps.join(", ")}`;
     await DButils.execQuery(insertInstructionsQuery);

    return recipe_id;
}


/**
 * Creates a family recipe for the specified user.
 * @param {number} user_id - The ID of the user to create the family recipe for.
 * @param {string} recipe_name - The name of the family recipe.
 * @param {number} prepare_time - The preparation time of the family recipe (in minutes).
 * @param {number} likes - The number of likes for the family recipe.
 * @param {string} is_vegan - Indicates whether the family recipe is vegan ('true' or 'false').
 * @param {string} is_veget - Indicates whether the family recipe is vegetarian ('true' or 'false').
 * @param {string} is_glutenFree - Indicates whether the family recipe is gluten-free ('true' or 'false').
 * @param {number} portions - The number of portions the family recipe serves.
 * @param {string} image_recipe - The URL of the image for the family recipe.
 * @param {string} recipe_owner - The name of the owner of the family recipe.
 * @param {string} when_prepared - Information about when the family recipe is usually prepared.
 * @param {Array<{ingredient_name: string, amount: number, unitLong: string}>} RecipesIngredients - An array of objects representing the ingredients of the family recipe.
 * @param {Array<string>} RecipesInstructions - An array of strings representing the instructions of the family recipe.
 * @returns {Promise<number>} - A promise that resolves with the ID of the created family recipe.
 */
async function createFamilyRecipe(user_id,recipe_name,prepare_time,likes,is_vegan,is_veget,is_glutenFree,portions,image_recipe,recipe_owner,when_prepared,RecipesIngredients, RecipesInstructions){
    // Insert the family recipe details into the FamilyRecipes table
    const insertRecipeQuery = `INSERT INTO FamilyRecipes (user_id, recipe_name, prepare_time, likes, is_vegan, is_veget, is_glutenFree, portions, image_recipe,recipe_owner,when_prepared) 
    VALUES (${user_id}, '${recipe_name}', ${prepare_time}, ${likes}, '${is_vegan}', '${is_veget}', '${is_glutenFree}', ${portions}, '${image_recipe}','${recipe_owner}','${when_prepared}')`;

    const insertRecipeResult = await DButils.execQuery(insertRecipeQuery);
    const recipe_id = insertRecipeResult.insertId;

    // Insert the ingredients of the family recipe into the RecipesIngredients table
    const values = [];
    for (let i = 0; i < RecipesIngredients.length; i++) {
      const ingredient_name = RecipesIngredients[i].ingredient_name;
      const amount = RecipesIngredients[i].amount;
      const unitLong = RecipesIngredients[i].unitLong;
      values.push(`(${recipe_id}, 'family', '${ingredient_name}', ${amount}, '${unitLong}')`);
    }
    const insertIngredientsQuery = `INSERT INTO RecipesIngredients (recipe_id, recipe_type, ingredient_name, amount, unitLong) VALUES ${values.join(", ")}`;
    await DButils.execQuery(insertIngredientsQuery);
    
    // Insert the instructions of the family recipe into the RecipesInstructions table
    const steps = RecipesInstructions.map((step_description) => `( ${recipe_id}, 'family', '${step_description}')`);
    const insertInstructionsQuery = `INSERT INTO RecipesInstructions (recipe_id, recipe_type, step_description) VALUES ${steps.join(", ")}`;
    await DButils.execQuery(insertInstructionsQuery);
  
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

