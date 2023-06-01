var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

/**
 * This path returns the last 3 recepies that were viewed by the logged-in user
 */
router.get("/userLastViewedRecipes", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes = await user_utils.getViewedRecipes(user_id,3);
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});
/**
 * This path returns all the recepies that were viewed by the logged-in user
 */
router.get("/userViewedRecipes", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes = await user_utils.getViewedRecipes(user_id,0);
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});


/**
 * This path updates the viewed recepies that were viewed by the logged-in user
 */
router.put("/userViewedRecipes/:recipe_id/:recipe_type", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipe_id;
    const recipe_type = req.params.recipe_type;

    await user_utils.putViewedRecipes(user_id,recipe_id, recipe_type);
    res.status(200).send('Put operation of userViewedRecipes succeeded');
  } catch (error) {
    next(error);
  }
});

/**
 * This path gets body with recipe details creates and save this recipe in the PersonalRecipes table of the logged-in user
 */
router.post('/createPersonalRecipe', async (req,res,next) => {
  try{
    console.log("user ->inside createPersonalRecipe");
    console.log("body params: ", req.body);
    const user_id = req.session.user_id;
    const recipe_name = req.body.recipe_name;
    const prepare_time = req.body.prepare_time;
    const likes = req.body.likes;
    const is_vegan = req.body.is_vegan;
    const is_veget = req.body.is_veget;
    const is_glutenFree = req.body.is_glutenFree;
    const portions = req.body.portions;
    const image_recipe = req.body.image_recipe;
    const RecipesIngredients = req.body.RecipesIngredients;
    const RecipesInstructions = req.body.RecipesInstructions;

    await user_utils.createPersonalRecipe(user_id,recipe_name,prepare_time,likes,is_vegan,is_veget,is_glutenFree,portions,image_recipe,RecipesIngredients, RecipesInstructions);
    res.status(200).send("The Recipe successfully created as personal");
    } catch(error){
    next(error);
  }
})

module.exports = router;
