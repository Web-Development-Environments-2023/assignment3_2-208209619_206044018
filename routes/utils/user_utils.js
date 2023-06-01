const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}


async function getViewedRecipes(user_id,amount=0){
    if (amount==0){
        const recipes = await DButils.execQuery(`select recipe_id from ViewedRecipes where user_id='${user_id}'`);

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
    console.log("user_utils -> inside createPersonalRecipe");

    const insertRecipeQuery = `INSERT INTO PersonalRecipes (user_id, recipe_name, prepare_time, likes, is_vegan, is_veget, is_glutenFree, portions, image_recipe) 
                               VALUES (${user_id}, '${recipe_name}', ${prepare_time}, ${likes}, '${is_vegan}', '${is_veget}', '${is_glutenFree}', ${portions}, '${image_recipe}')`;

    const insertRecipeResult = await DButils.execQuery(insertRecipeQuery);
    const recipe_id = insertRecipeResult.insertId;
    console.log("Inserted insertRecipeResult:", insertRecipeResult);

    const values = [];
    for (let i = 0; i < RecipesIngredients.length; i++) {
      const ingredient_name = RecipesIngredients[i].ingredient_name;
      const amount = RecipesIngredients[i].amount;
      values.push(`(${recipe_id}, 'personal', '${ingredient_name}', ${amount})`);
    }

    const insertIngredientsQuery = `INSERT INTO RecipesIngredients (recipe_id, recipe_type, ingredient_name, amount) VALUES ${values.join(", ")}`;

    const insertIngredientsResult = await DButils.execQuery(insertIngredientsQuery);
    console.log(insertIngredientsResult);

    const steps = RecipesInstructions.map((step_description, index) => `(${index + 1}, ${recipe_id}, 'personal', '${step_description}')`);
    const insertInstructionsQuery = `INSERT INTO RecipesInstructions (step_number, recipe_id, recipe_type, step_description) VALUES ${steps.join(", ")}`;

    const insertInstructionsResult = await DButils.execQuery(insertInstructionsQuery);
    console.log(insertInstructionsResult);

    console.log("Inserted recipe_id: ", recipe_id);
    return recipe_id;

}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getViewedRecipes = getViewedRecipes;
exports.putViewedRecipes = putViewedRecipes;
exports.createPersonalRecipe = createPersonalRecipe;