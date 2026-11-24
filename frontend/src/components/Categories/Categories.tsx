import { useCategories, useDeleteCategory } from "../../hooks/useCategories.js";
import type { Category } from "../../types/category.js";

function Categories() {
  const { data, isLoading, isError, error, isFetching } = useCategories()
  // TODO?: Make a unique delete button component if it makes sens visually
  const deleteCategory = useDeleteCategory();

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
            <tr key={category.id}>
              <td>{category.name}</td>
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
