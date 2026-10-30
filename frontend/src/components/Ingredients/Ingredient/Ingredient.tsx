import { Link, useParams } from "react-router-dom";
import { useIngredient } from "../../../hooks/useIngredients";

function Ingredient() {
  const { ingredientId } = useParams();

  const { data: ingredient, isLoading, isError, error, isFetching } = useIngredient(ingredientId ? parseInt(ingredientId) : undefined);
    
  if (isLoading) return <div className="spinner">Loading...</div>
  if (isError) return <div className="error">Error : {error.message}</div>

  return (
    <>
      {isFetching && <span className="refetch-indicator">Mise à jour...</span>}
      {ingredient ? 
        <>
          <div>
            <h1>{ingredient.name}</h1>
            <p> On Season ? 
              {ingredient.onSeason ? 
                <span style={{ backgroundColor: "lightgreen" }}>Yes</span> 
                : 
                <span style={{ backgroundColor: "lightcoral" }}>No</span>}
            </p>
          </div>          
          <Link to={`/ingredients/${ingredient.id}/edit`}>Change this ingredient</Link>    
        </>
      : <div>Ingredient not found</div>
      }
    </>
  )
}

export default Ingredient
