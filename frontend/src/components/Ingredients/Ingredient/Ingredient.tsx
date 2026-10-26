import { Link, useParams } from "react-router-dom";

function Ingredient() {
  const { ingredientId } = useParams();
  const ingredient = { id: ingredientId, name: "Tomato", onSeason: true };

  return (
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
  )
}

export default Ingredient
