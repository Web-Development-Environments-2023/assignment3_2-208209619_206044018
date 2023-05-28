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
        const recipes = await DButils.execQuery(`SELECT recipe_id
        FROM ViewedRecepies
        WHERE user_id = '${user_id}'
        ORDER BY date DESC
        LIMIT 3;`);

    }
    return recipes;
}

async function putViewedRecipes(user_id,recipe_id){
    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Check if the user_id and recipe_id combination already exists
    const query = `SELECT * FROM ViewedRecipes WHERE user_id = '${user_id}' AND recipe_id = '${recipe_id}'`;
    const existingRows = await DButils.execQuery(query);
  
    if (existingRows.length > 0) {
      // If the combination exists, update the date to the current date
      const updateQuery = `UPDATE ViewedRecipes SET date = '${currentDate}' WHERE user_id = '${user_id}' AND recipe_id = '${recipe_id}'`;
      await DButils.execQuery(updateQuery);
    } else {
      // If the combination doesn't exist, add a new row
      const insertQuery = `INSERT INTO ViewedRecipes (user_id, recipe_id, date) VALUES ('${user_id}', '${recipe_id}', '${currentDate}')`;
      await DButils.execQuery(insertQuery);
    }

    return; 
  
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getViewedRecipes = getViewedRecipes;
exports.putViewedRecipes = putViewedRecipes;
