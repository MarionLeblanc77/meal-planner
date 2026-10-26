import { Link } from "react-router-dom";

function Recipes() {
  const recipes = [
    { id: 1, name: "Spaghetti Bolognese" },
    { id: 2, name: "Chicken Curry" },
    { id: 3, name: "Vegetable Stir Fry" },
  ];

  return (
    <ul>
      {recipes.map((recipe) => (
        <li key={recipe.id} style={{ listStyleType: "none"}}>
          <Link to={`/recipes/${recipe.id}`}>
            {recipe.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default Recipes
