import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { useSearchRecipes } from "../../../hooks/useRecipes";
import type { Ingredient } from "../../../types/ingredient";
import CustomSearch from "../../CustomDesignFeatures/CustomSearch/CustomSearch"
import CustomSwitch from "../../CustomDesignFeatures/CustomSwitch/CustomSwitch";
import { useSearchIngredients } from "../../../hooks/useIngredients";
import type { Category } from "../../../types/category";
import { useCategories } from "../../../hooks/useCategories";
import CustomOnOffChip from "../../CustomDesignFeatures/CustomChips/CustomOnOffChip";
import CustomDeletableChip from "../../CustomDesignFeatures/CustomChips/CustomDeletableChip";
import "./RecipeSearch.css"

function RecipeSearch() {
  const navigate = useNavigate();

  const [ingredientChecked, setIngredientChecked] = useState<boolean>(false);
  const [searchedIngredientsList, setSearchedIngredientsList] = useState<Ingredient[]>([])
  const [categoryChecked, setCategoryChecked] = useState<boolean>(false);
  const [searchedCategoriesList, setSearchedCategoriesList] = useState<Category[]>([])
  const [seasonalityChecked, setSeasonalityChecked] = useState<boolean>(false);   

  const [searchRecipe, setSearchRecipe] = useState<string>('')
  const { 
    data : recipesData, 
    isLoading: isLoadingRecipeSearch, 
    isError: isErrorRecipeSearch, 
    error: errorRecipeSearch 
  } = useSearchRecipes(
    { name: searchRecipe.trim().toLowerCase(), 
      ingredientIds: searchedIngredientsList.map((ingredient) => ingredient?.id).filter((id): id is number => !!id),
      hasAllIngredients: ingredientChecked,
      categoryIds: searchedCategoriesList.map((category) => category?.id).filter((id): id is number => !!id),
      hasAllCategories: categoryChecked,
      seasonality: seasonalityChecked
    }
  )
  const recipes = recipesData ?? []

  const [searchIngredient, setSearchIngredient] = useState<string>('')
  const { data : ingredientsData, isLoading: isLoadingIngredientSearch, isError: isErrorIngredientSearch, error: errorIngredientSearch } = useSearchIngredients({ name: searchIngredient.trim().toLowerCase() }, searchedIngredientsList);
  const ingredients = ingredientsData ?? []

  const { data : categoriesData, isLoading: isLoadingCategorySearch, isError: isErrorCategorySearch, error: errorCategorySearch } = useCategories()
  const categories = categoriesData ?? []

  return (
    <>    
      <h2>CustomSearch a Recipe</h2>
      <div id="recipe_search">
        <div id="recipe_search_criteria">
          <h2>Add criteria</h2>
          <div id="recipe_search_criteria_ingredients" className="recipe_search_criteria_item">
            <h3>With this/those ingredient(s):</h3>
            <CustomSearch 
              searchItem={searchIngredient} 
              setSearchItem={setSearchIngredient} 
              isLoading={isLoadingIngredientSearch}
              isError={isErrorIngredientSearch} 
              error={errorIngredientSearch} 
              searchResult={ingredients} 
              emptySearchMsg="No ingredients found" 
              onSelectItem={({searchItemID, searchItem}) => {setSearchedIngredientsList([...searchedIngredientsList, {name: searchItem, id: searchItemID}])}} 
              inputProps={{ name: "ingredient", id: "ingredient" }}
              resultsOnTop={true}
              style='select'
            />
            <CustomSwitch 
              textLeft="Or" 
              textRight="And"
              checkedValue={ingredientChecked}
              checkedSetter={setIngredientChecked}
            />
            <ul id="recipe_search_criteria_ingredients_list" className="chip_list">
              {searchedIngredientsList.map((ingredient) => (
                <li key={ingredient.id}>
                  <CustomDeletableChip
                    object={ingredient}
                    deleteAction={() => setSearchedIngredientsList(searchedIngredientsList.filter((i) => i.id !== ingredient.id))}   
                    />                 
                </li>
              ))}
            </ul>
          </div>
          <div id="recipe_search_criteria_categories" className="recipe_search_criteria_item">
            <h3>With this/those category(ies):</h3>            
            {isLoadingCategorySearch && <div className="spinner">Loading...</div>}
            {isErrorCategorySearch && <div className="error">Error : {errorCategorySearch?.message}</div>}
            <CustomSwitch 
              textLeft="Or" 
              textRight="And"
              checkedValue={categoryChecked}
              checkedSetter={setCategoryChecked}
            />
            <ul id="recipe_search_criteria_categories_list" className="chip_list">
              {categories.map((category) => (
                <li key={category.id}>
                  <CustomOnOffChip 
                    object={category} 
                    onClickAction={setSearchedCategoriesList} 
                    isActive={searchedCategoriesList.some((selected) => selected.id === category.id)} />
                </li>
              ))}
            </ul>
          </div>
          <div id="recipe_search_criteria_season" className="recipe_search_criteria_item">
            <h3>Only show recipes with ingredient(s) in season</h3>
            <CustomSwitch
              textRight="Yes"
              checkedValue={seasonalityChecked}
              checkedSetter={setSeasonalityChecked}
            />
          </div>
        </div>
        <div id="recipe_search_results">
          <CustomSearch 
            searchItem={searchRecipe} 
            setSearchItem={setSearchRecipe} 
            isLoading={isLoadingRecipeSearch} 
            isError={isErrorRecipeSearch} 
            error={errorRecipeSearch} 
            searchResult={recipes} 
            emptySearchMsg="No recipes found" 
            onSelectItem={({searchItemID}) => navigate(`/recipes/${searchItemID}`)} 
            inputProps={{ name: "recipe", id: "recipe" }}
            isAlwaysVisible={true}
          />
        </div>
      </div>
    </>
  )
}

export default RecipeSearch
