import { Link } from "react-router-dom";
import { useIngredients } from "../../hooks/useIngredients";
import type { Ingredient } from "../../types/ingredient";
import './Ingredients.css'

function Ingredients() {
  const { data, isLoading, isError, error, isFetching } = useIngredients()

  if (isLoading) return <div className="spinner">Loading...</div>
  if (isError) return <div className="error">Error : {error.message}</div>

  return (
    <>
      {isFetching && <span className="refetch-indicator">Mise à jour...</span>}
      <table>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">On Season ?</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((ingredient: Ingredient) => (
            <tr key={ingredient.id}>
              <td>
                <Link to={`/ingredients/${ingredient.id}`}>
                  {ingredient.name}
                </Link>
              </td>
              <td className={ingredient.onSeason ? "on-season" : "not-season"}>{ingredient.onSeason ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>      
    </>
  )
}

export default Ingredients
