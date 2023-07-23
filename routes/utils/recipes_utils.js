const axios = require("axios");
const { param } = require("../user");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");


/**
 * Extracts relevant recipe data from the spoonacular response for preview.
 * @param {Array} recipes_info - The list of recipe objects from the spoonacular response.
 * @returns {Promise<Array>} - A promise that resolves with an array of recipe objects with relevant data for preview.
 */
async function getRecipeDetailsAPI(recipes_list) {
    const promises = recipes_list.map(async (recipe) => {
      const { id, title, readyInMinutes, image, servings, aggregateLikes, extendedIngredients, analyzedInstructions, vegan, vegetarian, glutenFree } = recipe;
  
      const ingredient_list = extendedIngredients.map((ingredient) => {
        const { name } = ingredient;
        const { amount } = ingredient.measures.us;
        const { unitLong } = ingredient.measures.us;
        return { name, amount, unitLong };
      });
  
      const instruct_list = analyzedInstructions.map((instruction) => {
        const steps = instruction.steps.map((step) => step.step);
        return { steps };
      });
  
      return {
        recipe_id: id,
        recipe_name: title,
        prepare_time: readyInMinutes,
        image_recipe: image,
        portions: servings,
        likes: aggregateLikes,
        is_vegan: vegan,
        is_veget: vegetarian,
        is_glutenFree: glutenFree,
        recipe_ingredient: ingredient_list,
        recipe_instruction: instruct_list
      };
    });
  
    const recipes_final = await Promise.all(promises);
    return recipes_final;
  }
  

  /**
 * Extracts relevant recipe data from the FamilyRecipes table for family recipe preview.
 * @param {Array} recipes_list - The list of recipe objects from the FamilyRecipes table.
 * @returns {Promise<Array>} - A promise that resolves with an array of recipe objects with relevant data for family recipe preview.
 */
  async function getRecipeDetailsFamily(recipes_list) {
    const promises = recipes_list.map(async (recipe) => {
      const result_recipe = recipe[0][0];
      const ingre = recipe[1];
      const steps = [{ "steps": recipe[2].map((step) => step.step_description) }];
      const ingredient_list = ingre.map((ingredient) => {
        const name = ingredient.ingredient_name;
        const amount = ingredient.amount;
        const unitLong = ingredient.unitLong;
        return { name, amount, unitLong };
      });
  
      return {
        recipe_id: result_recipe.recipe_id,
        recipe_name: result_recipe.recipe_name,
        prepare_time: result_recipe.prepare_time,
        image_recipe: result_recipe.image_recipe,
        portions: result_recipe.portions,
        likes: result_recipe.likes,
        is_vegan: result_recipe.is_vegan,
        is_veget: result_recipe.is_veget,
        is_glutenFree: result_recipe.is_glutenFree,
        recipe_ingredient: ingredient_list,
        recipe_instruction: steps,
        recipe_owner: result_recipe.recipe_owner,
        when_prepared: result_recipe.when_prepared
      };
    });
  
    const recipes_final = await Promise.all(promises);
    return recipes_final;
  }
  

  /**
 * Extracts relevant recipe data from the PersonalRecipes table for personal recipe preview.
 * @param {Array} recipes_list - The list of recipe objects from the PersonalRecipes table.
 * @returns {Promise<Array>} - A promise that resolves with an array of recipe objects with relevant data for personal recipe preview.
 */
  async function getRecipeDetailsPersonal(recipes_list) {
    const promises = recipes_list.map(async (recipe) => {
      const result_recipe = recipe[0][0];
      const ingre = recipe[1];
      const steps = [{ "steps": recipe[2].map((step) => step.step_description) }];
      const ingredient_list = ingre.map((ingredient) => {
        const name = ingredient.ingredient_name;
        const amount = ingredient.amount;
        const unitLong = ingredient.unitLong;
        return { name, amount, unitLong };
      });
  
      return {
        recipe_id: result_recipe.recipe_id,
        recipe_name: result_recipe.recipe_name,
        prepare_time: result_recipe.prepare_time,
        image_recipe: result_recipe.image_recipe,
        portions: result_recipe.portions,
        likes: result_recipe.likes,
        is_vegan: result_recipe.is_vegan,
        is_veget: result_recipe.is_veget,
        is_glutenFree: result_recipe.is_glutenFree,
        recipe_ingredient: ingredient_list,
        recipe_instruction: steps
      };
    });
  
    const recipes_final = await Promise.all(promises);
    return recipes_final;
  }


/**
 * Extracts relevant recipe data from the recipe_array for preview.
 * @param {Array} recipe_array - The list of recipe objects from different sources (API, PersonalRecipes, FamilyRecipes).
 * @returns {Promise<Object>} - A promise that resolves with an object containing recipes preview from different sources.
 */
async function getRecipesPreview(recipe_array) {
    const API_id_list = [];
    const Personal_id_list = [];
    const Family_id_list = [];
  
    for (let i = 0; i < recipe_array.length; i++) {
      const recipe_type = recipe_array[i].recipe_type;
      const recipe_id = recipe_array[i].recipe_id;
  
      if (recipe_type === 'API') {
        API_id_list.push(recipe_id);
      } else if (recipe_type === 'personal') {
        Personal_id_list.push(recipe_id);
      } else if (recipe_type === 'family') {
        Family_id_list.push(recipe_id);
      }
    }
  
    const [rec_api, rec_family, rec_personal] = await Promise.all([
      handleApiRecipeById(API_id_list),
      handleFamilyRecipeById(Family_id_list),
      handlePersonalRecipeById(Personal_id_list)
    ]);
  
    return {
      API: rec_api,
      personal: rec_personal,
      family: rec_family
    };
  }


  /**
 * Retrieves family recipes details by their IDs from the FamilyRecipes table.
 * @param {Array} recipes_id_list - The list of family recipe IDs.
 * @returns {Promise<Array>} - A promise that resolves with an array of recipe objects with relevant data for family recipes.
 */
  async function handleFamilyRecipeById(recipes_id_list) {
    const promises = recipes_id_list.map((recipe_id) => {
      const result_recipe = DButils.execQuery(`SELECT * FROM FamilyRecipes WHERE recipe_id=${recipe_id}`);
      const result_ingre = DButils.execQuery(`SELECT ingredient_name, amount, unitLong FROM RecipesIngredients WHERE recipe_id=${recipe_id} AND recipe_type='family'`);
      const result_steps = DButils.execQuery(`SELECT step_description FROM RecipesInstructions WHERE recipe_id=${recipe_id} AND recipe_type='family' ORDER BY step_number`);
      return Promise.all([result_recipe, result_ingre, result_steps]);
    });
  
    const recipes_f_list = await Promise.all(promises);
    const final_recipes = await getRecipeDetailsFamily(recipes_f_list);
    return final_recipes;
  }
  

  /**
 * Retrieves personal recipes details by their IDs from the PersonalRecipes table.
 * @param {Array} recipes_id_list - The list of personal recipe IDs.
 * @returns {Promise<Array>} - A promise that resolves with an array of recipe objects with relevant data for personal recipes.
 */
  async function handlePersonalRecipeById(recipes_id_list) {
    const promises = recipes_id_list.map((recipe_id) => {
      const result_recipe = DButils.execQuery(`SELECT * FROM PersonalRecipes WHERE recipe_id=${recipe_id}`);
      const result_ingre = DButils.execQuery(`SELECT ingredient_name, amount, unitLong FROM RecipesIngredients WHERE recipe_id=${recipe_id} AND recipe_type='personal'`);
      const result_steps = DButils.execQuery(`SELECT step_description FROM RecipesInstructions WHERE recipe_id=${recipe_id} AND recipe_type='personal' ORDER BY step_number`);
      return Promise.all([result_recipe, result_ingre, result_steps]);
    });
  
    const recipes_p_list = await Promise.all(promises);
    const final_recipes = await getRecipeDetailsPersonal(recipes_p_list);
    return final_recipes;
  }
  

  /**
 * Retrieves API recipes details by their IDs using the spoonacular API.
 * @param {Array} recipes_id_list - The list of API recipe IDs.
 * @returns {Promise<Array>} - A promise that resolves with an array of recipe objects with relevant data for API recipes.
 */
  async function handleApiRecipeById(recipes_id_list) {
    const idString = recipes_id_list.join(',');
    const response = await handleInfoBulk(idString);
    const recipes = await getRecipeDetailsAPI(response.data);
    return recipes;
  }
  

  /**
 * Retrieves recipe information for multiple recipe IDs from the spoonacular API.
 * @param {string} id_string - Comma-separated string of recipe IDs.
 * @returns {Promise<Object>} - A promise that resolves with the response data containing information for multiple recipes.
 */
  async function handleInfoBulk(id_string) {
    return axios.get(`${api_domain}/informationBulk`, {
      headers: {
        "x-api-key": process.env.APIKEYSPOON
      },
      params: {
        "ids": id_string
      }
    });
  }
  

/**
 * Fetches a random number of recipes from the spoonacular API.
 * @param {number} number - The number of random recipes to fetch.
 * @returns {Promise<Array>} - A promise that resolves with an array of recipe objects with relevant data for the random recipes.
 */
async function RandomRecipe(number) {
    let response = await handleRandomRecipe(number);
    let recipes = await getRecipeDetailsAPI(response.data.recipes);
    return recipes;
    
}

/**
 * Retrieves a random number of recipes from the spoonacular API.
 * @param {number} number - The number of random recipes to retrieve.
 * @returns {Promise<Object>} - A promise that resolves with the response data containing the random recipes.
 */
async function handleRandomRecipe(number) {
    return await axios.get(`${api_domain}/random`, {
        headers:{
            "x-api-key":process.env.APIKEYSPOON
        },
        params: {
            "number":number
        }
    });
}


/**
 * Searches for recipes with specified parameters using the spoonacular API.
 * @param {string} recipe_name - The name of the recipe to search for.
 * @param {number} amount_recipes - The number of recipes to retrieve.
 * @param {string} sort - The sorting method for the search results.
 * @param {string} cuisine - The cuisine type to filter recipes.
 * @param {string} diet - The diet type to filter recipes.
 * @param {string} intolerance - The intolerance type to filter recipes.
 * @returns {Promise<Array>} - A promise that resolves with an array of recipe objects with relevant data for the searched recipes.
 */
async function searchRecipes(recipe_name,amount_recipes,sort, cuisine, diet, intolerance) {
    let apiResponse = await handlesearchRecipes(recipe_name,amount_recipes,sort, cuisine, diet, intolerance);

    // Extract the IDs of the searched recipes
    console.log(apiResponse.data.results);
    const idList = apiResponse.data.results.map(result => result.id);
    const idString = idList.map(item => item.toString()).join(',');
    let response = await handleInfoBulk(idString);

    const recipes = await getRecipeDetailsAPI(response.data);
    console.log(recipes);
    return recipes;
    
}


/**
 * Searches for recipes with specified parameters using the spoonacular API.
 * @param {string} recipe_name - The name of the recipe to search for.
 * @param {number} amount_recipes - The number of recipes to retrieve.
 * @param {string} sort - The sorting method for the search results.
 * @param {string} cuisine - The cuisine type to filter recipes.
 * @param {string} diet - The diet type to filter recipes.
 * @param {string} intolerance - The intolerance type to filter recipes.
 * @returns {Promise<Object>} - A promise that resolves with the response data containing the searched recipes.
 */
async function handlesearchRecipes(recipe_name,amount_recipes=5 , sort, cuisine, diet, intolerance) {
    list_arguments = [recipe_name,parseInt(amount_recipes),sort, cuisine, diet, intolerance]
    list_params_name = ["query",  "number", "sort", "cuisine", "diet", "intolerances"]
    params_api = {};

    for(let i=0; i<6; i++){
        if (list_arguments[i] !== 'null'){
            params_api[list_params_name[i]]=list_arguments[i]
        }
    }

    return await axios.get(`${api_domain}/complexSearch`, {
        headers:{
            "x-api-key":process.env.APIKEYSPOON
        },
        params: params_api
    });
}



exports.getRecipeDetailsAPI = getRecipeDetailsAPI;
exports.searchRecipes = searchRecipes;
exports.RandomRecipe = RandomRecipe;
exports.getRecipesPreview = getRecipesPreview;
exports.handlePersonalRecipeById = handlePersonalRecipeById;
exports.handleFamilyRecipeById = handleFamilyRecipeById;
exports.handleApiRecipeById = handleApiRecipeById;

