import { useParams, useNavigate } from "react-router-dom";
import { useCreateOrEditRecipe, useRecipe } from "../../../hooks/useRecipes";
import type { Recipe } from "../../../types/recipe";

function RecipeForm() {
  const navigate = useNavigate();
  const { recipeId } = useParams();

  const { data: recipe, isLoading, isError, error, isFetching } = useRecipe(recipeId ? parseInt(recipeId) : undefined);

  const createOrEditRecipe = useCreateOrEditRecipe(recipeId ? parseInt(recipeId) : undefined);

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
          //TODO: add a way to select ingredients for the recipe
        </div>
        <button>{window.location.href.includes('edit') ? 'Update this recipe' : 'Add this recipe'}</button>
      </form>
    </>
  )
}

export default RecipeForm
