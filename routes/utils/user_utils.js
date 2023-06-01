const DButils = require("./DButils");
const rec_utils = require("./utils/recipes_utils");

async function markAsFavorite(user_id, recipe_id, recipe_type){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id}, ${recipe_type})`);
    return;
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`SELECT recipe_id, recipe_type from FavoriteRecipes WHERE user_id='${user_id}'`);
    return recipes_id;
}

async function getPersonalRecipes(user_id){
    const recipes_id = await DButils.execQuery(`SELECT recipe_id from PersonalRecipes WHERE user_id='${user_id}'`);
    
    return await rec_utils.handlePersonalRecipeById(recipes_id);
}

async function getFamilyRecipes(user_id){
    const recipes_id = await DButils.execQuery(`SELECT recipe_id from FamilyRecipes WHERE user_id='${user_id}'`);
    return await rec_utils.handleFamilyRecipeById(recipes_id);
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

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getViewedRecipes = getViewedRecipes;
exports.putViewedRecipes = putViewedRecipes;
exports.getFamilyRecipes = getFamilyRecipes;
exports.getPersonalRecipes = getPersonalRecipes;

