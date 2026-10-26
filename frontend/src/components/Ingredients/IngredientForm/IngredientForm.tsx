import { useParams, useNavigate } from "react-router-dom";

function IngredientForm() {
  const navigate = useNavigate();
  const { ingredientId } = useParams();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    // fetch('/some-api', { method: form.method, body: formData });

    const formJson = Object.fromEntries(formData.entries());
    console.log(formJson);
    navigate('/ingredients');
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div>
        <label>Name of the ingredient:
          <input type="text" name="name" id="name" required />
        </label>
      </div>
      <div>
        <label>Is it on season?
          <input type="checkbox" name="onSeason" id="onSeason" defaultChecked={true}/>
        </label>
      </div>      
      <button>Add this ingredient</button>
    </form>
  )
}

export default IngredientForm
