import { useIngredients, useDeleteIngredient, useCreateOrEditIngredient } from "../../hooks/useIngredients";
import type { Ingredient } from "../../types/ingredient";
import './Ingredients.css'
import AppSwitch from "../DesignFeatures/AppSwitch/AppSwitch";

function Ingredients() {
  const { data, isLoading, isError, error, isFetching } = useIngredients()
  // TODO?: Make a unique delete button component if it makes sens visually
  const deleteIngredient = useDeleteIngredient();
  const editIngredient = useCreateOrEditIngredient();

  if (isLoading) return <div className="spinner">Loading...</div>
  if (isError) return <div className="error">Error : {error.message}</div>

  return (
    <>
      {isFetching && <span className="refetch-indicator">Mise à jour...</span>}
      <table>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">On Season ?</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((ingredient: Ingredient) => (
            <tr key={ingredient.id}>
              <td>{ingredient.name}</td>
              <td>
                <AppSwitch
                  textLeft="No"
                  textRight="Yes"
                  checkedValue={ingredient.onSeason ?? true}
                  checkedSetter={(checked : boolean) => 
                    editIngredient.mutate({
                      id: ingredient.id,
                      ingredientData: {onSeason: checked}
                    })
                  }
                  />
              </td>
              {/* TODO?: Make a unique delete button component if it makes sens visually */}
              <td>
                <button type="button" onClick={() => deleteIngredient.mutate(ingredient.id)}>X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>      
    </>
  )
}

export default Ingredients
