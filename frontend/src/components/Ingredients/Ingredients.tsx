import { useIngredients, useDeleteIngredient, useCreateOrEditIngredient } from "../../hooks/useIngredients";
import type { Ingredient } from "../../types/ingredient";
import './Ingredients.css'
import AppSwitch from "../DesignFeatures/AppSwitch/AppSwitch";
import { useState } from "react";

function Ingredients() {
  const { data, isLoading, isError, error, isFetching } = useIngredients()
  // TODO?: Make a unique delete button component if it makes sens visually
  const deleteIngredient = useDeleteIngredient();
  const editIngredient = useCreateOrEditIngredient();

  const [onGoingEditingIngredientId, setOnGoingEditingIngredientId] = useState<number | null>(null);
  const [onGoingDraftIngredientName, setOnGoingDraftIngredientName] = useState('');

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
              <td>
                {ingredient.id === onGoingEditingIngredientId ?
                <div>
                  <input 
                    type="text"
                    value={onGoingDraftIngredientName}
                    onChange={(e)=>setOnGoingDraftIngredientName(e.currentTarget.value)}
                  />
                  <button
                    onClick={(e)=>{
                      e.preventDefault()
                      editIngredient.mutate({
                        id: ingredient.id,
                        ingredientData: {name: onGoingDraftIngredientName}
                      })
                      setOnGoingDraftIngredientName('');
                      setOnGoingEditingIngredientId(null)
                    }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={(e)=>{
                      e.preventDefault()
                      setOnGoingDraftIngredientName('');
                      setOnGoingEditingIngredientId(null)
                    }}
                  >
                    No
                  </button>
                </div>
                : <p>{ingredient.name}</p>
                }
                <button
                  onClick={(e)=>{
                    e.preventDefault()
                    setOnGoingDraftIngredientName(ingredient.name);
                    setOnGoingEditingIngredientId(ingredient.id)
                  }}
                >
                  Edit
                </button>
              </td>
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
