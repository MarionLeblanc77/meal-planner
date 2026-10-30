import { Link, useParams } from "react-router-dom";
import { useRecipe } from "../../../hooks/useRecipes";
import recipeStatusLabels from "../../../types/recipe";

function Recipe() {
  const { recipeId } = useParams();
  const { data: recipe, isLoading, isError, error, isFetching } = useRecipe(recipeId ? parseInt(recipeId) : undefined);
    
  if (isLoading) return <div className="spinner">Loading...</div>
  if (isError) return <div className="error">Error : {error.message}</div>

  console.log("Recipe data:", recipe); // Log the recipe data for debugging

  return (
    <>
      {isFetching && <span className="refetch-indicator">Mise à jour...</span>}
      {recipe ?
        <>
          <div>
              <h1>{recipe.name}</h1>
              <p> Base Portions: {recipe.basePortions}</p>
              <p> Status: {recipeStatusLabels[recipe.status]}</p>
          </div>
          <Link to={`/recipes/${recipe.id}/edit`}>Change this recipe</Link>
        </>
      : <div>Recipe not found</div>
      }
    </>
  )
}

export default Recipe
