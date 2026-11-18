import { Link, useParams } from "react-router-dom";
import { useDeleteCategory, useCategory } from "../../../hooks/useCategories.js";

function Category() {
  const { categoryId } = useParams();

  const { data: category, isLoading, isError, error, isFetching } = useCategory(categoryId ? parseInt(categoryId) : undefined);
  // TODO?: Make a unique delete button component if it makes sens visually
  const deleteCategory = useDeleteCategory();
    
  if (isLoading) return <div className="spinner">Loading...</div>
  if (isError) return <div className="error">Error : {error.message}</div>

  return (
    <>
      {isFetching && <span className="refetch-indicator">Mise à jour...</span>}
      {category ? 
        <>
          <div>
            <h1>{category.name}</h1>
            {/* TODO?: Make a unique delete button component if it makes sens visually */}
            <button type="button" onClick={() => deleteCategory.mutate(category.id)}>X</button>
          </div>          
          <Link to={`/categories/${category.id}/edit`}>Change this category</Link>    
        </>
      : <div>Category not found</div>
      }
    </>
  )
}

export default Category
