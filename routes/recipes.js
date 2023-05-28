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
    const recipes = await recipes_utils.RandomRecipe(3,3,3);
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});

//TODO EXAMPLE
router.get("/hello", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.test(req.query.z);
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
