import { useParams, useNavigate } from "react-router-dom";
import { useIngredient, useCreateOrEditIngredient } from "../../../hooks/useIngredients";
import type { Ingredient } from "../../../types/ingredient";

function IngredientForm() {
  const navigate = useNavigate();
  const { ingredientId } = useParams();
  const { data: ingredient, isLoading, isError, error, isFetching } = useIngredient(ingredientId ? parseInt(ingredientId) : undefined);
  
  const createOrEditIngredient = useCreateOrEditIngredient(ingredientId ? parseInt(ingredientId) : undefined);

  if (isLoading) return <div className="spinner">Loading...</div>
  if (isError) return <div className="error">Error : {error.message}</div>

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget);
    createOrEditIngredient.mutate({
      name: formData.get('name') as Ingredient['name'],
      onSeason: formData.get('onSeason') === "on" ? true : false as Ingredient['onSeason'],
    })
    navigate('/ingredients');
  }

  return (
    <>
      {isFetching && <span className="refetch-indicator">Mise à jour...</span>}
      <form className="form" onSubmit={handleSubmit}>
        <div>
          <label>Name of the ingredient:
            <input type="text" name="name" id="name" defaultValue={ingredient?.name || ''} required />
          </label>
        </div>
        <div>
          <label>Is it on season?
            <input type="checkbox" name="onSeason" id="onSeason" defaultChecked={ingredient?.onSeason || true}/>
          </label>
        </div>      
        <button type="submit" disabled={createOrEditIngredient.isPending}>
          {createOrEditIngredient.isPending ? 
            window.location.href.includes('edit') ? 
              'Updating...' : 'Creating...'
              : window.location.href.includes('edit') ?
                'Update this ingredient' : 'Add this ingredient'}
        </button>
        {createOrEditIngredient.isError && <p className="error">{createOrEditIngredient.error.message}</p>}
        {createOrEditIngredient.isSuccess && <p className="success">
          {window.location.href.includes('edit') ? 'Ingredient updated' : 'Ingredient created'}
        </p>}
      </form>
    </>
  )
}

export default IngredientForm
