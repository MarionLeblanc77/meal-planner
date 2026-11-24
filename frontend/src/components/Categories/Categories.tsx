import { MdCheck, MdClose, MdDeleteForever, MdEdit } from "react-icons/md";
import { useCategories, useCreateOrEditCategory, useDeleteCategory } from "../../hooks/useCategories.js";
import type { Category } from "../../types/category.js";
import { useState } from "react";

function Categories() {
  const { data, isLoading, isError, error, isFetching } = useCategories()
  // TODO?: Make a unique delete button component if it makes sens visually
  const deleteCategory = useDeleteCategory();
  const editCategory = useCreateOrEditCategory();

  const [onGoingEditingCategoryId, setOnGoingEditingCategoryId] = useState<number | null>(null);
  const [onGoingDraftCategoryName, setOnGoingDraftCategoryName] = useState('');

  if (isLoading) return <div className="spinner">Loading...</div>
  if (isError) return <div className="error">Error : {error.message}</div>

  return (
    <>
      {isFetching && <span className="refetch-indicator">Mise à jour...</span>}
      <table>
        <thead>
          <tr>
            <th scope="col">Name</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((category: Category) => (
            <tr className="list_line" key={category.id}>
              <td className="list_line_name">
                {category.id === onGoingEditingCategoryId ?
                  <div className="list_line_name_edit_field">
                    <input 
                      type="text"
                      value={onGoingDraftCategoryName}
                      onChange={(e)=>setOnGoingDraftCategoryName(e.currentTarget.value)}
                    />
                    <button
                      className="naked_button"
                      onClick={(e)=>{
                        e.preventDefault()
                        editCategory.mutate({
                          id: category.id,
                          categoryData: {name: onGoingDraftCategoryName}
                        })
                        setOnGoingDraftCategoryName('');
                        setOnGoingEditingCategoryId(null)
                      }}
                    >
                      <MdCheck size={"1.3rem"} color="green"/>
                    </button>
                    <button
                      className="naked_button"
                      onClick={(e)=>{
                        e.preventDefault()
                        setOnGoingDraftCategoryName('');
                        setOnGoingEditingCategoryId(null)
                      }}
                    >
                      <MdClose size={"1.3rem"} color="red"/>
                    </button>
                  </div>
                  : <p>{category.name}</p>
                }
                <button
                  className={`naked_button ${category.id === onGoingEditingCategoryId ? "button_ongoing" : ""}`}
                  type="button" 
                  onClick={(e)=>{
                    e.preventDefault()
                    setOnGoingDraftCategoryName(category.name);
                    setOnGoingEditingCategoryId(category.id)
                  }}
                >
                  <MdEdit size={"1.3rem"}/>
                </button>
                <button 
                  className={`naked_button ${category.id === onGoingEditingCategoryId ? "button_ongoing_ingredient" : ""}`}
                  type="button" 
                  onClick={() => deleteCategory.mutate(category.id)}>
                  <MdDeleteForever size={"1.3rem"}/>
                </button>
              </td>
              {/* TODO?: Make a unique delete button component if it makes sens visually */}
              <td>
                <button type="button" onClick={() => deleteCategory.mutate(category.id)}>X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>      
    </>
  )
}

export default Categories
