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
router.put('/userFavoriteRecipes/:recipe_id/:recipe_type', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipe_id;
    const recipe_type = req.params.recipe_type;

    await user_utils.markAsFavorite(user_id,recipe_id, recipe_type);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/userFavoriteRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push([element.recipe_id, element.recipe_type])); //extracting the recipe ids and recipe_type into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    console.log({"recipes":[results][0].API[0].recipe_instruction});
    res.status(200).send({"recipes":[results]});
  } catch(error){
    next(error); 
  }
});

router.get('/userPersonalRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    
    const personal_recipes = await user_utils.getPersonalRecipes(user_id);
    res.status(200).send({"recipes":personal_recipes});
  } catch(error){
    next(error); 
  }
});


router.get('/userFamilyRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    
    const family_recipes = await user_utils.getFamilyRecipes(user_id);
    res.status(200).send({"recipes":family_recipes});
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
    const recipes_id_type = await user_utils.getViewedRecipes(user_id,3);
    
    const filteredRecipesId = recipes_id_type.filter(recipe => recipe.recipe_type === "API");
    const recipeIds = filteredRecipesId.map(recipe => recipe.recipe_id);

    const recipes = await recipe_utils.handleApiRecipeById(recipeIds);
    res.send({ "recipes": recipes });

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
    res.send({"recipes":recipes});
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
    res.status(200).send("The Recipe successfully created as personal recipe");
    } catch(error){
    next(error);
  }
})



/**
 * This path gets body with recipe details creates and save this recipe in the FamilyRecipes table of the logged-in user
 */
router.post('/createFamilyRecipe', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_name = req.body.recipe_name;
    const prepare_time = req.body.prepare_time;
    const likes = req.body.likes;
    const is_vegan = req.body.is_vegan;
    const is_veget = req.body.is_veget;
    const is_glutenFree = req.body.is_glutenFree;
    const portions = req.body.portions;
    const image_recipe = req.body.image_recipe;
    const recipe_owner = req.body.recipe_owner;
    const when_prepared = req.body.when_prepared;
    const RecipesIngredients = req.body.RecipesIngredients;
    const RecipesInstructions = req.body.RecipesInstructions;


    await user_utils.createFamilyRecipe(user_id,recipe_name,prepare_time,likes,is_vegan,is_veget,is_glutenFree,portions,image_recipe,recipe_owner,when_prepared,RecipesIngredients, RecipesInstructions);
    res.status(200).send("The Recipe successfully created as family recipe");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the user_id of the logged-in user
 */
router.get("/getUserId", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    res.send({"user_id": user_id});
  } catch (error) {
    next(error);
  }
});
module.exports = router;
