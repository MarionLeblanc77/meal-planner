import { Link } from "react-router-dom";
import { useRecipes } from '../../hooks/useRecipes'
import type { Recipe } from "../../types/recipe";

function Recipes() {
  const { data: recipes, isLoading, isError, error, isFetching } = useRecipes()

  if (isLoading) return <div className="spinner">Loading...</div>
  if (isError) return <div className="error">Error : {error.message}</div>

  return (
    <>
      {isFetching && <span className="refetch-indicator">Mise à jour...</span>}
      <ul>
        {recipes?.map((recipe: Recipe) => (
          <li key={recipe.id} style={{ listStyleType: "none"}}>
            <Link to={`/recipes/${recipe.id}`}>
              {recipe.name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

export default Recipes
