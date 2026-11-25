import { Link, useNavigate, useParams } from "react-router-dom";
import { useDeleteRecipe, useRecipe } from "../../../hooks/useRecipes";
import recipeStatusLabels from "../../../types/recipe-status";
import CustomChip from "../../CustomDesignFeatures/CustomChips/CustomChip";

function Recipe() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
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
              <button type="button" onClick={() => {
                deleteRecipe.mutate(recipe.id)
                navigate('/recipes');
              }} >X</button>
              <p> Base Portions: {recipe.basePortions}</p>
              <p> Status: {recipeStatusLabels[recipe.status]}</p>
              <h3>Ingredients:</h3>
              <ul className="chip_list">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient.id}>
                    <CustomChip
                      object={ingredient}
                      />
                  </li>
                ))}
              </ul>
              <h3>Categories:</h3>
              <ul className="chip_list">
                {recipe.categories.map((category) => (
                  <li key={category.id}>
                    <CustomChip
                      object={category}
                      />
                  </li>
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
