import { Link, useParams } from "react-router-dom";
import { useDeleteRecipe, useRecipe } from "../../../hooks/useRecipes";
import recipeStatusLabels from "../../../types/recipe-status";

function Recipe() {
  const { recipeId } = useParams();
  const { data: recipe, isLoading, isError, error, isFetching } = useRecipe(recipeId ? parseInt(recipeId) : undefined);
  // TODO?: Make a unique delete button component if it makes sens visually
  const deleteRecipe = useDeleteRecipe();

  if (isLoading) return <div className="spinner">Loading...</div>
  if (isError) return <div className="error">Error : {error.message}</div>

  return (
    <>
      {isFetching && <span className="refetch-indicator">Mise à jour...</span>}
      {recipe ?
        <>
          <div>
              <h1>{recipe.name}</h1>            
              {/* TODO?: Make a unique delete button component if it makes sens visually */}
              <button type="button" onClick={() => deleteRecipe.mutate(recipe.id)}>X</button>
              <p> Base Portions: {recipe.basePortions}</p>
              <p> Status: {recipeStatusLabels[recipe.status]}</p>
              <ul>
                {recipe.ingredients.map((ingredient) => (
                  <>
                    <li key={ingredient.id}>{ingredient.name}</li>
                  </>
                ))}
              </ul>
          </div>
          <Link to={`/recipes/${recipe.id}/edit`}>Change this recipe</Link>
        </>
      : <div>Recipe not found</div>
      }
    </>
  )
}

export default Recipe
