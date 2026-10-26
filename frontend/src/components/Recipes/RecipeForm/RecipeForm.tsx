import { useParams, useNavigate } from "react-router-dom";

function RecipeForm() {
  const navigate = useNavigate();
  const { recipeId } = useParams();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    // fetch('/some-api', { method: form.method, body: formData });

    const formJson = Object.fromEntries(formData.entries());
    console.log(formJson);
    navigate('/recipes');

  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div>
        <label>Name of the recipe:
          <input type="text" name="name" id="name" required />
        </label>
      </div>
      <div>
        <label>Instructions:
          <textarea id="instructions" name="instructions" rows={5} cols={33} />
        </label>
      </div>
      <div>
        <label>Base Portions:
          <input type="number" name="basePortions" id="basePortions" />
        </label>        
      </div>
      <div>
        <label>Status:
          <select name="status" id="status" defaultValue="0">
            <option value="0">To Try</option>
            <option value="1">To Try Again</option>
            <option value="2">OK</option>
          </select>
        </label>
      </div>
      <div>
        //TODO: add a way to select ingredients for the recipe
      </div>
      <button>Add this recipe</button>
    </form>
  )
}

export default RecipeForm
