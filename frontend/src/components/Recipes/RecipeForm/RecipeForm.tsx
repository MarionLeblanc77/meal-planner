import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSearchIngredients } from "../../../hooks/useIngredients";
import { useCreateOrEditRecipe, useRecipe } from "../../../hooks/useRecipes";
import type { Recipe } from "../../../types/recipe";
import type { IngredientInput } from "../../../types/ingredient";
import Search from "../../Search/Search";
import { useSearchCategories } from "../../../hooks/useCategories";

function RecipeForm() {
  const navigate = useNavigate();
  const { recipeId } = useParams();
  const { data: recipe, isLoading, isError, error, isFetching } = useRecipe(recipeId ? parseInt(recipeId) : undefined);
  const createOrEditRecipe = useCreateOrEditRecipe(recipeId ? parseInt(recipeId) : undefined);


  // TODO!: factorize ingredients and categories search and add to a custom hook to avoid code duplication
  const [ingredients, setIngredients] = useState<Recipe['ingredients']>(recipe?.ingredients ?? []);
  const [searchedIngredient, setSearchedIngredient] = useState<string>('')
  const { data : ingredientsData, isLoading: isLoadingIngredientSearch, isError: isErrorIngredientSearch, error: errorIngredientSearch } = useSearchIngredients({ name: searchedIngredient.trim().toLowerCase() })
  const ingredientList = ingredientsData ?? []

  const addIngredient = ({searchedIngredientID, searchedIngredient}: {searchedIngredientID: number | undefined, searchedIngredient: string}) => {
    if (searchedIngredient.trim() !== '') {
      const newIngredient: IngredientInput = { id: searchedIngredientID, name: searchedIngredient.trim() };
      setIngredients([...ingredients, newIngredient]);      
    }
  }

  const [categories, setCategories] = useState<Recipe['categories']>(recipe?.categories ?? []);
  const [searchedCategory, setSearchedCategory] = useState<string>('')
  const { data : categoriesData, isLoading: isLoadingCategorySearch, isError: isErrorCategorySearch, error: errorCategorySearch } = useSearchCategories({ name: searchedCategory.trim().toLowerCase() })
  const categoryList = categoriesData ?? []

  const addCategory = ({searchedCategoryID, searchedCategory}: {searchedCategoryID: number | undefined, searchedCategory: string}) => {
    if (searchedCategory.trim() !== '') {
      const newCategory: IngredientInput = { id: searchedCategoryID, name: searchedCategory.trim() };
      setCategories([...categories, newCategory]);      
    }
  }

  if (isLoading) return <div className="spinner">Loading...</div>
  if (isError) return <div className="error">Error : {error.message}</div>

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget);
    createOrEditRecipe.mutate({
      name: formData.get('name') as Recipe['name'],
      instructions: formData.get('instructions') as Recipe['instructions'],
      basePortions: formData.get('basePortions') ? parseInt(formData.get('basePortions') as string) : 0 as Recipe['basePortions'],
      status: formData.get('status') as Recipe['status'],
      ingredients: ingredients
    })
    navigate('/recipes');
  }

  return (
    <>
      {isFetching && <span className="refetch-indicator">Mise à jour...</span>}
      <form className="form" onSubmit={handleSubmit}>
        <div>
          <label>Name of the recipe:
            <input type="text" name="name" id="name" defaultValue={recipe?.name || ''} required />
          </label>
        </div>
        <div>
          <label>Instructions:
            <textarea id="instructions" name="instructions" rows={5} cols={33} defaultValue={recipe?.instructions || ''} />
          </label>
        </div>
        <div>
          <label>Base Portions:
            <input type="number" name="basePortions" id="basePortions" defaultValue={recipe?.basePortions || 4} />
          </label>        
        </div>
        <div>
          <label>Status:
            <select name="status" id="status" defaultValue={recipe?.status || "0"}>
              <option value="0">To Try</option>
              <option value="1">To Try Again</option>
              <option value="2">OK</option>
            </select>
          </label>
        </div>
        <div>
          <label>Ingredients:
            <Search 
              searchItem={searchedIngredient} 
              setSearchItem={setSearchedIngredient} 
              isLoading={isLoadingIngredientSearch} 
              isError={isErrorIngredientSearch} 
              error={errorIngredientSearch} 
              searchResult={ingredientList} 
              emptySearchMsg="No ingredients found" 
              onClickLabel={({searchItemID, searchItem}) => addIngredient({searchedIngredientID : searchItemID, searchedIngredient : searchItem})} 
              inputProps={{ name: "ingredient", id: "ingredient" }}
              addOption={true}
             />
            <ul>
              {ingredients.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.name}
                  <button type="button" onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))}>X</button>
                </li>
              ))}
            </ul>
          </label>
        </div>
        <div>
          <label>Categories:
            <Search 
              searchItem={searchedCategory} 
              setSearchItem={setSearchedCategory} 
              isLoading={isLoadingCategorySearch} 
              isError={isErrorCategorySearch} 
              error={errorCategorySearch} 
              searchResult={categoryList} 
              emptySearchMsg="No categories found" 
              onClickLabel={({searchItemID, searchItem}) => addCategory({searchedCategoryID : searchItemID, searchedCategory : searchItem})} 
              inputProps={{ name: "category", id: "category" }}
              addOption={true}
             />
            <ul>
              {categories.map((category, index) => (
                <li key={index}>
                  {category.name}
                  <button type="button" onClick={() => setCategories(categories.filter((_, i) => i !== index))}>X</button>
                </li>
              ))}
            </ul>
          </label>
        </div>
        <button>{window.location.href.includes('edit') ? 'Update this recipe' : 'Add this recipe'}</button>
      </form>
    </>
  )
}

export default RecipeForm
