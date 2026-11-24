import RecipeForm from "../RecipeForm/RecipeForm"
import RecipeImport from "./RecipeImport/RecipeImport"

function RecipeAdd() {

  return (
    <>
      <h1>Add a recipe</h1>
      <h2>Import a recipe automatically</h2>
      <RecipeImport/>
      <h2>Add a recipe manually</h2>
      <RecipeForm/>
    </>
  )
}

export default RecipeAdd