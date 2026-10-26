import { Link } from "react-router-dom";
import './Ingredients.css'

function Ingredients() {
  const ingredients = [
    { id: 1, name: "Tomato", onSeason: true },
    { id: 2, name: "Potato", onSeason: false },
    { id: 3, name: "Carrot", onSeason: true },
  ];

  return (
    <ul>
      <table>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">On Season ?</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => (
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
    </ul>
  )
}

export default Ingredients
