import type { Category, CategoryInput } from "../../types/category";
import "./CategoryChip.css"

interface CategoryChipProps {
  category: Category;
  setSearchedCategoriesList: React.Dispatch<React.SetStateAction<CategoryInput[]>>
  isActive: boolean;
}


function CategoryChip({ category, setSearchedCategoriesList, isActive }: CategoryChipProps) {
  return (
    <button
      type="button"
      className={`chip ${isActive ? 'active' : ''}`}
      onClick={() => {
        if(isActive) {
          setSearchedCategoriesList((prev) => prev.filter((c) => c.id !== category.id))
        } else {
          setSearchedCategoriesList((prev) => [...prev, category])
        }
      }}
    >
      <span>{category.name}</span>
    </button>
  )
}

export default CategoryChip
