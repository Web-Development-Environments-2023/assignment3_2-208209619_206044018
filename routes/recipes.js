var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a recipe by its id
 */
// router.get("/:recipeId", async (req, res, next) => {
//   try {
//     const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
//     // res.send("im not here")
//     res.send(recipe);
//   } catch (error) {
//     next(error);
//   }
// });

router.get("/generalRandomRecipes", async (req, res, next) => {
  try {
    const recipes = await recipes_utils.RandomRecipe(3);
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});


//TODO EXAMPLE
router.get("/searchRecipes/{amount_recipes}/{recipe_name}/{cuisine}/{diet}/{intolerance}", async (req, res, next) => {
  try {
    const amount_recipes = req.params.amount_recipes
    const recipe_name = req.params.recipe_name
    const cuisine = req.params.cuisine
    const diets = req.params.diets
    const intolerance = req.params.intolerance
    const recipe = await recipes_utils.searchRecipes(amount_recipes, recipe_name, cuisine, diet, intolerance);
    // res.sendStatus(404);
    // res.send();
    res.status(200);
    res.send({"hello":"dadas","key":recipe})
    // res.send({"res":recipe,"status":res.status});
  } catch (error) {
    next(error);
  }
});

module.exports = router;
