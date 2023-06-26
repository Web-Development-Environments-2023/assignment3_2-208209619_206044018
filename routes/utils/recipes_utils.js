const axios = require("axios");
const { param } = require("../user");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


// async function getRecipeInformation(recipe_id) {
//     return await axios.get(`${api_domain}/${recipe_id}/information`, {
//         params: {
//             includeNutrition: false,
//             apiKey: process.env.spooncular_apiKey
//         }
//     });
// }
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
  
  async function handleApiRecipeById(recipes_id_list) {
    const idString = recipes_id_list.join(',');
    const response = await handleInfoBulk(idString);
    const recipes = await getRecipeDetailsAPI(response.data);
    return recipes;
  }
  
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
  


async function RandomRecipe(number) {
    let response = await handleRandomRecipe(number);
    let recipes = await getRecipeDetailsAPI(response.data.recipes);
    return recipes;
    
}
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


async function searchRecipes(recipe_name,amount_recipes,sort, cuisine, diet, intolerance) {
    let apiResponse = await handlesearchRecipes(recipe_name,amount_recipes,sort, cuisine, diet, intolerance);

    //the id of the recipes search
    console.log(apiResponse.data.results);
    const idList = apiResponse.data.results.map(result => result.id);
    const idString = idList.map(item => item.toString()).join(',');
    let response = await handleInfoBulk(idString);

    const recipes = await getRecipeDetailsAPI(response.data);
    console.log(recipes);
    return recipes;
    
}
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
// exports.getFavoriteRecipes=getFavoriteRecipes;
exports.getRecipesPreview = getRecipesPreview;
exports.handlePersonalRecipeById = handlePersonalRecipeById;
exports.handleFamilyRecipeById = handleFamilyRecipeById;
exports.handleApiRecipeById = handleApiRecipeById;

