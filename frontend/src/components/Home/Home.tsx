import IngredientForm from '../Ingredients/IngredientForm/IngredientForm'
import RecipeForm from '../Recipes/RecipeForm/RecipeForm'
import Search from '../Search/Search'
import { useRecipes } from '../../hooks/useRecipes'

function Home() {
  return (
    <div>
      <RecipeForm/>
      <IngredientForm/>
      <Search fetchHook={useRecipes()} emptySearchMsg="No recipes found"/>
    </div>
  )
}

export default Home
