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
 * Route to add a recipe to the favorites list of the logged-in user
 */
router.put('/userFavoriteRecipes/:recipe_id/:recipe_type', async (req,res,next) => {
  try{
    // Extract data from request parameters
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipe_id;
    const recipe_type = req.params.recipe_type;

    // Call the utility function to mark the recipe as favorite for the user
    await user_utils.markAsFavorite(user_id,recipe_id, recipe_type);

    // Send a success response
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})


/**
 * Route to get the favorite recipes saved by the logged-in user
 */
router.get('/userFavoriteRecipes', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    // Get the recipes ids that are saved as favorites for the user 
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);

    // Get the preview information for the recipes using the recipe ids
    if(recipes_id.length<=0){
      results=[];
    }
    else{
      results = await recipe_utils.getRecipesPreview(recipes_id);
    }

    // Send the recipes as a response
    res.status(200).send({ "recipes": results });
  } catch (error) {
    next(error); 
  }
});


// /**
//  * This path returns the favorite recipes that were saved by the logged-in user
//  */
// router.get('/userFavoriteRecipes', async (req, res, next) => {
//   try {
//     const user_id = req.session.user_id;
//     const recipes_id = await user_utils.getFavoriteRecipes(user_id);
//     res.status(200).send({ "recipes": results });
//   } catch (error) {
//     next(error); 
//   }
// });

/**
 * Route to get the favorite recipes saved by the logged-in user by id and type
 */
router.get('/userFavoriteRecipesByIdType', async (req, res, next) => {
  try {
    recipe_id_type = [];
    const user_id = req.session.user_id;

    // Get the recipes ids and types that are saved as favorites for the user 
    const recipe_Id_type = await user_utils.getFavoriteRecipes(user_id);

    // Extract the recipe ids and recipe_type into an array
    res.status(200).send({ "recipes": recipe_Id_type});
  } catch (error) {
    next(error); 
  }
});


/**
 * Route to get personal recipes of the logged-in user
 */
router.get('/userPersonalRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    // Get the personal recipes of the user 
    const personal_recipes = await user_utils.getPersonalRecipes(user_id);
    res.status(200).send({"recipes":personal_recipes});
  } catch(error){
    next(error); 
  }
});


/**
 * Route to get family recipes of the logged-in user
 */
router.get('/userFamilyRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    // Get the family recipes of the user 
    const family_recipes = await user_utils.getFamilyRecipes(user_id);
    res.status(200).send({"recipes":family_recipes});
  } catch(error){
    next(error); 
  }
});


/**
 * Route to get the last 3 recipes viewed by the logged-in user
 */
router.get("/userLastViewedRecipes", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    // Get the last 3 viewed recipes by the user 
    const recipes_id_type = await user_utils.getViewedRecipes(user_id,3);

    // Filter out recipes with recipe_type !== "API" and get the recipe_ids
    const filteredRecipesId = recipes_id_type.filter(recipe => recipe.recipe_type === "API");
    const recipeIds = filteredRecipesId.map(recipe => recipe.recipe_id);

    // Get the preview information for the recipes using the recipe ids 
    const recipes = await recipe_utils.handleApiRecipeById(recipeIds);
    res.send({ "recipes": recipes });

  } catch (error) {
    next(error);
  }
});


/**
 * Route to get all the recipes viewed by the logged-in user
 */
router.get("/userViewedRecipes", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;

    // Get all the viewed recipes by the user
    const recipes = await user_utils.getViewedRecipes(user_id,0);
    res.send({"recipes":recipes});
  } catch (error) {
    next(error);
  }
});


/**
 * Route to update the viewed recipes for the logged-in user
 */
router.put("/userViewedRecipes/:recipe_id/:recipe_type", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipe_id;
    const recipe_type = req.params.recipe_type;

    // Update the viewed recipes for the user 
    await user_utils.putViewedRecipes(user_id,recipe_id, recipe_type);
    res.status(200).send('Put operation of userViewedRecipes succeeded');
  } catch (error) {
    next(error);
  }
});

const { body, validationResult } = require('express-validator');

/**
 * Route to create and save a personal recipe for the logged-in user
 */
router.post(
  '/createPersonalRecipe',
  [
    body('recipe_name').isString().isLength({ max: 750 }),
    body('prepare_time').isInt({ min: 1 }),
    body('likes').isInt({ min: 0 }),
    body('is_vegan').isIn(['true', 'false']),
    body('is_veget').isIn(['true', 'false']),
    body('is_glutenFree').isIn(['true', 'false']),
    body('portions').isInt({ min: 1 }),
    body('image_recipe').isString().isLength({ max: 750 }),
    body('RecipesIngredients.*.ingredient_name').isString().isLength({ max: 700 }),
    body('RecipesIngredients.*.amount').isInt({ min: 1, max: 1000 }),
    body('RecipesIngredients.*.unitLong').isString().isLength({ max: 50 }),
    body('RecipesInstructions.*').isString().isLength({ max: 750 }),
  ],
  async (req, res, next) => {
    // Check for validation errors in the request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
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

    // Call the utility function to create and save the personal recipe 
    await user_utils.createPersonalRecipe(user_id,recipe_name,prepare_time,likes,is_vegan,is_veget,is_glutenFree,portions,image_recipe,RecipesIngredients, RecipesInstructions);
    res.status(200).send("The Recipe successfully created as personal recipe");
    } catch(error){
    next(error);
  }
})



/**
 * Route to create and save a family recipe for the logged-in user
 */
router.post(
  '/createFamilyRecipe',
  [
    body('recipe_name').isString().isLength({ max: 750 }),
    body('prepare_time').isInt({ min: 1 }),
    body('likes').isInt({ min: 0 }),
    body('is_vegan').isIn(['true', 'false']),
    body('is_veget').isIn(['true', 'false']),
    body('is_glutenFree').isIn(['true', 'false']),
    body('portions').isInt({ min: 1, max: 1000 }),
    body('image_recipe').isString().isLength({ max: 750 }),
    body('recipe_owner').isString().isLength({ max: 750 }),
    body('when_prepared').isString().isLength({ max: 750 }),
    body('RecipesIngredients.*.ingredient_name').isString().isLength({ max: 700 }),
    body('RecipesIngredients.*.amount').isInt({ min: 1, max: 1000 }),
    body('RecipesIngredients.*.unitLong').isString().isLength({ max: 50 }),
    body('RecipesInstructions.*').isString().isLength({ max: 750 }),
  ],
  async (req, res, next) => {
    // Check for validation errors in the request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
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

    // Call the utility function to create and save the family recipe 
    await user_utils.createFamilyRecipe(user_id,recipe_name,prepare_time,likes,is_vegan,is_veget,is_glutenFree,portions,image_recipe,recipe_owner,when_prepared,RecipesIngredients, RecipesInstructions);
    res.status(200).send("The Recipe successfully created as family recipe");
    } catch(error){
    next(error);
  }
})

/**
 * Route to get the user_id of the logged-in user
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
