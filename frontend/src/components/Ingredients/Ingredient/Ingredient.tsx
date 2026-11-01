import { Link, useParams } from "react-router-dom";
import { useDeleteIngredient, useIngredient } from "../../../hooks/useIngredients";

function Ingredient() {
  const { ingredientId } = useParams();

  const { data: ingredient, isLoading, isError, error, isFetching } = useIngredient(ingredientId ? parseInt(ingredientId) : undefined);
  // TODO?: Make a unique delete button component if it makes sens visually
  const deleteIngredient = useDeleteIngredient();
    
  if (isLoading) return <div className="spinner">Loading...</div>
  if (isError) return <div className="error">Error : {error.message}</div>

  return (
    <>
      {isFetching && <span className="refetch-indicator">Mise à jour...</span>}
      {ingredient ? 
        <>
          <div>
            <h1>{ingredient.name}</h1>
            {/* TODO?: Make a unique delete button component if it makes sens visually */}
            <button type="button" onClick={() => deleteIngredient.mutate(ingredient.id)}>X</button>
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
