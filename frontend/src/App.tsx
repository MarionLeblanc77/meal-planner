import { Routes, Route } from "react-router-dom";
import './App.css'
import Header from './components/Header/Header'
import Home from "./components/Home/Home";
import Recipes from "./components/Recipes/Recipes";
import Ingredients from "./components/Ingredients/Ingredients";
import Recipe from "./components/Recipes/Recipe/Recipe";
import Ingredient from "./components/Ingredients/Ingredient/Ingredient";
import RecipeForm from "./components/Recipes/RecipeForm/RecipeForm";
import IngredientForm from "./components/Ingredients/IngredientForm/IngredientForm";

function App() {
  return (
    <>
      <Header />
      <div className="main-content">
        <Routes>
          <Route index element={<Home />} />

          <Route path="recipes">
            <Route index element={<Recipes />} />
            <Route path=":recipeId" element={<Recipe />} />
            <Route path=":recipeId/edit" element={<RecipeForm />} />

          </Route>

          <Route path="ingredients">
            <Route index element={<Ingredients />} />
            <Route path=":ingredientId" element={<Ingredient />} />
            <Route path=":ingredientId/edit" element={<IngredientForm />} />
          </Route>
        </Routes> 
      </div>
    </>
  )
}

export default App
