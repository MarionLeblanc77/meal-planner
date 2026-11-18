import { useState } from "react"
import { useNavigate } from "react-router-dom";
import Switch from '@mui/material/Switch';
import { useSearchRecipes } from "../../../hooks/useRecipes";
import type { IngredientInput } from "../../../types/ingredient";
import Search from "../../Search/Search"
import "./RecipeSearch.css"
import { useSearchIngredients } from "../../../hooks/useIngredients";
import type { CategoryInput } from "../../../types/category";

function RecipeSearch() {
  const navigate = useNavigate();

  const [ingredientChecked, setIngredientChecked] = useState<boolean>(false);
  const [searchedIngredientsList, setSearchedIngredientsList] = useState<IngredientInput[]>([])
  const [categoryChecked, setCategoryChecked] = useState<boolean>(false);
  const [searchedCategoriesList, setSearchedCategoriesList] = useState<CategoryInput[]>([])

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
      hasAllCategories: categoryChecked
    }
  )
  const recipes = recipesData ?? []

  const [searchIngredient, setSearchIngredient] = useState<string>('')
  const { data : ingredientsData, isLoading: isLoadingIngredientSearch, isError: isErrorIngredientSearch, error: errorIngredientSearch } = useSearchIngredients({ name: searchIngredient.trim().toLowerCase() })
  const ingredients = ingredientsData ?? []

  const [searchCategory, setSearchCategory] = useState<string>('')
  const { data : categoriesData, isLoading: isLoadingCategorySearch, isError: isErrorCategorySearch, error: errorCategorySearch } = useSearchIngredients({ name: searchCategory.trim().toLowerCase() })
  const categories = categoriesData ?? []

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
            <div className="switch">
              <p>Or</p>
              <Switch 
                checked={ingredientChecked} 
                onChange={(e) => setIngredientChecked(e.target.checked)} 
              />
              <p>And</p>
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
          <div id="recipe_search_criteria_categories" className="recipe_search_criteria_item">
            <h3>With this/those category(ies):</h3>
            <Search 
              searchItem={searchCategory} 
              setSearchItem={setSearchCategory} 
              isLoading={isLoadingCategorySearch} 
              isError={isErrorCategorySearch} 
              error={errorCategorySearch} 
              searchResult={categories} 
              emptySearchMsg="No categories found" 
              onClickLabel={({searchItemID, searchItem}) => {setSearchedCategoriesList([...searchedCategoriesList, {name: searchItem, id: searchItemID}])}} 
              inputProps={{ name: "category", id: "category" }}
             />
            <div className="switch">
              <p>Or</p>
              <Switch 
                checked={categoryChecked} 
                onChange={(e) => setCategoryChecked(e.target.checked)} 
              />
              <p>And</p>
            </div>
            <ul id="recipe_search_criteria_categories_list">
              {searchedCategoriesList.map((category) => (
                <li key={category.id}>
                  {category.name}
                  <button onClick={() => setSearchedCategoriesList(searchedCategoriesList.filter((c) => c.id !== category.id))}>X</button>
                </li>
              ))}
            </ul>
          </div>  
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
