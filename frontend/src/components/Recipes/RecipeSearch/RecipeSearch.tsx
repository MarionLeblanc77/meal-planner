import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { useSearchRecipes } from "../../../hooks/useRecipes";
import type { IngredientInput } from "../../../types/ingredient";
import Search from "../../Search/Search"
import "./RecipeSearch.css"
import { useSearchIngredients } from "../../../hooks/useIngredients";

function RecipeSearch() {
  const navigate = useNavigate();

  const [searchedIngredientsList, setSearchedIngredientsList] = useState<IngredientInput[]>([])

  const [searchRecipe, setSearchRecipe] = useState<string>('')
  const { 
    data : recipesData, 
    isLoading: isLoadingRecipeSearch, 
    isError: isErrorRecipeSearch, 
    error: errorRecipeSearch 
  } = useSearchRecipes(
    { name: searchRecipe.trim().toLowerCase(), 
      ingredientIds: searchedIngredientsList.map((ingredient) => ingredient?.id).filter((id): id is number => !!id)
    }
  )
  const recipes = recipesData ?? []

  const [searchIngredient, setSearchIngredient] = useState<string>('')
  const { data : ingredientsData, isLoading: isLoadingIngredientSearch, isError: isErrorIngredientSearch, error: errorIngredientSearch } = useSearchIngredients({ name: searchIngredient.trim().toLowerCase() })
  const ingredients = ingredientsData ?? []


  return (
    <>    
      <h2>Search a Recipe</h2>
      <div id="recipe_search">
        <div id="recipe_search_criteria">
          <h2>Add criteria</h2>
          <div id="recipe_search_criteria_ingredients" className="recipe_search_criteria_item">
            <h3>With this/those ingredient(s):</h3>
            <Search 
              searchItem={searchIngredient} 
              setSearchItem={setSearchIngredient} 
              isLoading={isLoadingIngredientSearch} 
              isError={isErrorIngredientSearch} 
              error={errorIngredientSearch} 
              searchResult={ingredients} 
              emptySearchMsg="No ingredients found" 
              onClickLabel={({searchItemID, searchItem}) => {setSearchedIngredientsList([...searchedIngredientsList, {name: searchItem, id: searchItemID}])}} 
              inputProps={{ name: "ingredient", id: "ingredient" }}
             />
          </div>
          <ul id="recipe_search_criteria_ingredients_list">
            {searchedIngredientsList.map((ingredient) => (
              <li key={ingredient.id}>
                {ingredient.name}
                <button onClick={() => setSearchedIngredientsList(searchedIngredientsList.filter((i) => i.id !== ingredient.id))}>X</button>
              </li>
            ))}
          </ul>
        </div>
        <div id="recipe_search_results">
          <Search 
            searchItem={searchRecipe} 
            setSearchItem={setSearchRecipe} 
            isLoading={isLoadingRecipeSearch} 
            isError={isErrorRecipeSearch} 
            error={errorRecipeSearch} 
            searchResult={recipes} 
            emptySearchMsg="No recipes found" 
            onClickLabel={({searchItemID}) => navigate(`/recipes/${searchItemID}`)} 
            inputProps={{ name: "recipe", id: "recipe" }}
            isAlwaysVisible={true}
          />
        </div>
      </div>
    </>
  )
}

export default RecipeSearch
