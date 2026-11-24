import { Routes, Route } from "react-router-dom";
import './App.css'
import Header from './components/Header/Header'
import Home from "./components/Home/Home";
import Ingredients from "./components/Ingredients/Ingredients";
import Recipe from "./components/Recipes/Recipe/Recipe";
import Ingredient from "./components/Ingredients/Ingredient/Ingredient";
import RecipeForm from "./components/Recipes/RecipeForm/RecipeForm";
import IngredientForm from "./components/Ingredients/IngredientForm/IngredientForm";
import Categories from "./components/Categories/Categories";
import Category from "./components/Categories/Category/Category";
import CategoryForm from "./components/Categories/CategoryForm/CategoryForm";
import RecipeAdd from "./components/Recipes/RecipeAdd/RecipeAdd";

function App() {
  return (
    <>
      <Header />
      <div className="main-content">
        <Routes>
          <Route index element={<Home />} />

          <Route path="recipes">
            <Route path="add" element={<RecipeAdd />} />
            <Route path="import/review" element={<RecipeForm />} />
            <Route path=":recipeId" element={<Recipe />} />
            <Route path=":recipeId/edit" element={<RecipeForm />} />
          </Route>

          <Route path="ingredients">
            <Route index element={<Ingredients />} />
            <Route path=":ingredientId" element={<Ingredient />} />
            <Route path=":ingredientId/edit" element={<IngredientForm />} />
          </Route>

          <Route path="categories">
            <Route index element={<Categories />} />
            <Route path=":categoryId" element={<Category />} />
            <Route path=":categoryId/edit" element={<CategoryForm />} />
          </Route>
        </Routes> 
      </div>
    </>
  )
}

export default App
