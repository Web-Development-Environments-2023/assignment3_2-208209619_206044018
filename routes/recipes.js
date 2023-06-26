var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));



router.get("/generalRandomRecipes", async (req, res, next) => {
  try {
    const recipes = await recipes_utils.RandomRecipe(3);
    console.log(recipes);
    // res.send(recipes);
    res.send({"recipes": recipes});
  } catch (error) {
    next(error);
  }
});


//TODO EXAMPLE
router.get("/searchRecipes/:recipe_name/:amount_recipes/:sort/:cuisine/:diet/:intolerance", async (req, res, next) => {
  try {
    console.log("search params: ",req.params);
    const recipe_name = req.params.recipe_name
    const amount_recipes = req.params.amount_recipes
    const sort = req.params.sort
    const cuisine = req.params.cuisine
    const diet = req.params.diet
    const intolerance = req.params.intolerance
    const recipe = await recipes_utils.searchRecipes(recipe_name,amount_recipes,sort, cuisine, diet, intolerance);
    res.status(200);
    res.send(recipe)
  } catch (error) {
    next(error);
  }
});

module.exports = router;
