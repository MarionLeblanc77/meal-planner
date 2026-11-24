import { Routes, Route } from "react-router-dom";
import './App.css'
import Header from './components/Header/Header'
import Home from "./components/Home/Home";
import RecipeAdd from "./components/Recipes/RecipeAdd/RecipeAdd";
import RecipeForm from "./components/Recipes/RecipeForm/RecipeForm";
import Recipe from "./components/Recipes/Recipe/Recipe";
import Ingredients from "./components/Ingredients/Ingredients";
import Categories from "./components/Categories/Categories";

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
          </Route>

          <Route path="categories">
            <Route index element={<Categories />} />
          </Route>
        </Routes> 
      </div>
    </>
  )
}

export default App
