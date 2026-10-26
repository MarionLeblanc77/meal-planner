import { Link, useParams } from "react-router-dom";

function Recipe() {
  const { recipeId } = useParams();
  const recipe = { id: recipeId, name: "Spaghetti Bolognese", basePortions: 4, textStatus: "To try" };

  return (
    <>
      <div>
          <h1>{recipe.name}</h1>
          <p> Base Portions: {recipe.basePortions}</p>
          <p> Status: {recipe.textStatus}</p>
      </div>
      <Link to={`/recipes/${recipe.id}/edit`}>Change this recipe</Link>
    </>
  )
}

export default Recipe
