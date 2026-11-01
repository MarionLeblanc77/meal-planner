import { Link } from "react-router-dom";
import { useRecipes, useDeleteRecipe } from '../../hooks/useRecipes'
import type { Recipe } from "../../types/recipe";

function Recipes() {
  const { data, isLoading, isError, error, isFetching } = useRecipes()
  const deleteRecipe = useDeleteRecipe();

  if (isLoading) return <div className="spinner">Loading...</div>
  if (isError) return <div className="error">Error : {error.message}</div>

  return (
    <>
      {isFetching && <span className="refetch-indicator">Mise à jour...</span>}
      <ul>
        {data?.map((recipe: Recipe) => (
          <li key={recipe.id} style={{ listStyleType: "none"}}>
            <Link to={`/recipes/${recipe.id}`}>
              {recipe.name}
            </Link>
            {/* TODO?: Make a unique delete button component if it makes sens visually */}
            <button type="button" onClick={() => deleteRecipe.mutate(recipe.id)}>X</button>
          </li>
        ))}
      </ul>
    </>
  )
}

export default Recipes
