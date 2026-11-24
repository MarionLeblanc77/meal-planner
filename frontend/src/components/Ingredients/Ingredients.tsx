import { useState } from "react";
import { MdCheck, MdClose, MdDeleteForever, MdEdit } from "react-icons/md";
import { useIngredients, useDeleteIngredient, useCreateOrEditIngredient } from "../../hooks/useIngredients";
import type { Ingredient } from "../../types/ingredient";
import AppSwitch from "../DesignFeatures/AppSwitch/AppSwitch";
import './Ingredients.css'

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
            <tr className="ingredients_line" key={ingredient.id}>
              <td className="ingredients_name">
                {ingredient.id === onGoingEditingIngredientId ?
                <div className="ingredients_name_edit_field">
                  <input 
                    type="text"
                    value={onGoingDraftIngredientName}
                    onChange={(e)=>setOnGoingDraftIngredientName(e.currentTarget.value)}
                  />
                  <button
                    className="naked_button"
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
                    <MdCheck size={"1.3rem"} color="green"/>
                  </button>
                  <button
                    className="naked_button"
                    onClick={(e)=>{
                      e.preventDefault()
                      setOnGoingDraftIngredientName('');
                      setOnGoingEditingIngredientId(null)
                    }}
                  >
                    <MdClose size={"1.3rem"} color="red"/>
                  </button>
                </div>
                : <p>{ingredient.name}</p>
                }
                <button
                  className={`naked_button ${ingredient.id === onGoingEditingIngredientId ? "button_ongoing_ingredient" : ""}`}
                  type="button" 
                  onClick={(e)=>{
                    e.preventDefault()
                    setOnGoingDraftIngredientName(ingredient.name);
                    setOnGoingEditingIngredientId(ingredient.id)
                  }}
                >
                  <MdEdit size={"1.3rem"}/>
                </button>
                <button 
                  className={`naked_button ${ingredient.id === onGoingEditingIngredientId ? "button_ongoing_ingredient" : ""}`}
                  type="button" 
                  onClick={() => deleteIngredient.mutate(ingredient.id)}>
                  <MdDeleteForever size={"1.3rem"}/>
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
            </tr>
          ))}
        </tbody>
      </table>      
    </>
  )
}

export default Ingredients
