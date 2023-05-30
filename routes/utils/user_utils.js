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
    return; 
  
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getViewedRecipes = getViewedRecipes;
exports.putViewedRecipes = putViewedRecipes;
