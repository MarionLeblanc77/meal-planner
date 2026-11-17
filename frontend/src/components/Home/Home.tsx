import IngredientForm from '../Ingredients/IngredientForm/IngredientForm'
import RecipeForm from '../Recipes/RecipeForm/RecipeForm'
import RecipeSearch from '../Recipes/RecipeSearch/RecipeSearch'

function Home() {
  return (
    <div>
      <h1>Meal Planner</h1>
      <RecipeSearch/>
      <h2>Add a Recipe</h2>
      <RecipeForm/>
      <h2>Add a Ingredient</h2>
      <IngredientForm/>
    </div>
  )
}

export default Home
