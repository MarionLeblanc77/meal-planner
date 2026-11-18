import { useParams, useNavigate } from "react-router-dom";
import { useCategory, useCreateOrEditCategory } from "../../../hooks/useCategories.js";
import type { Category } from "../../../types/category.js";

function CategoryForm() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { data: category, isLoading, isError, error, isFetching } = useCategory(categoryId ? parseInt(categoryId) : undefined);
  
  const createOrEditCategory = useCreateOrEditCategory(categoryId ? parseInt(categoryId) : undefined);

  if (isLoading) return <div className="spinner">Loading...</div>
  if (isError) return <div className="error">Error : {error.message}</div>

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget);
    createOrEditCategory.mutate({ name: formData.get('name') as Category['name'] })
    navigate('/categories');
  }

  return (
    <>
      {isFetching && <span className="refetch-indicator">Mise à jour...</span>}
      <form className="form" onSubmit={handleSubmit}>
        <div>
          <label>Name of the category:
            <input type="text" name="name" id="name" defaultValue={category?.name || ''} required />
          </label>
        </div> 
        <button type="submit" disabled={createOrEditCategory.isPending}>
          {createOrEditCategory.isPending ? 
            window.location.href.includes('edit') ? 
              'Updating...' : 'Creating...'
              : window.location.href.includes('edit') ?
                'Update this category' : 'Add this category'}
        </button>
        {createOrEditCategory.isError && <p className="error">{createOrEditCategory.error.message}</p>}
        {createOrEditCategory.isSuccess && <p className="success">
          {window.location.href.includes('edit') ? 'Category updated' : 'Category created'}
        </p>}
      </form>
    </>
  )
}

export default CategoryForm
