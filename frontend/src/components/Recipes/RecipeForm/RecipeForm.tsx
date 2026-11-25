import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSearchIngredients } from "../../../hooks/useIngredients";
import { useCreateOrEditRecipe, useRecipe } from "../../../hooks/useRecipes";
import { useCategories, useCreateOrEditCategory } from "../../../hooks/useCategories";
import type { Recipe } from "../../../types/recipe";
import type { IngredientInput } from "../../../types/ingredient";
import type { Category } from "../../../types/category";
import type { ImportReviewState } from "../../../types/importer";
import CustomSearch from "../../CustomDesignFeatures/CustomSearch/CustomSearch";
import CustomOnOffChip from "../../CustomDesignFeatures/CustomChips/CustomOnOffChip";
import "../RecipeAdd/RecipeImport/RecipeImport.css";
import CustomDeletableChip from "../../CustomDesignFeatures/CustomChips/CustomDeletableChip";

function RecipeForm() {
  const navigate = useNavigate();
  const { recipeId } = useParams();
  // Set when arriving from the import page (/recipes/import/review).
  const importState = useLocation().state as ImportReviewState | null;
  const draft = importState?.importDraft;
  const [useTranslation, setUseTranslation] = useState(false);
  const draftText = useTranslation && draft?.translation ? draft.translation : draft;

  const { data: recipe, isLoading, isError, error, isFetching } = useRecipe(recipeId ? parseInt(recipeId) : undefined);
  const createOrEditRecipe = useCreateOrEditRecipe(recipeId ? parseInt(recipeId) : undefined);

  // TODO!: factorize ingredients and categories search and add to a custom hook to avoid code duplication
  const [ingredients, setIngredients] = useState<Recipe['ingredients']>(recipe?.ingredients ?? draft?.ingredients ?? []);
  const [searchedIngredient, setSearchedIngredient] = useState<string>('')
  const { data : ingredientsData, isLoading: isLoadingIngredientSearch, isError: isErrorIngredientSearch, error: errorIngredientSearch } = useSearchIngredients({ name: searchedIngredient.trim().toLowerCase() }, ingredients);
  const ingredientList = ingredientsData ?? []

  const addIngredient = ({searchedIngredientID, searchedIngredient}: {searchedIngredientID: number | undefined, searchedIngredient: string}) => {
    if (searchedIngredient.trim() !== '') {
      const newIngredient: IngredientInput = { id: searchedIngredientID, name: searchedIngredient.trim() };
      setIngredients([...ingredients, newIngredient]);      
    }
  }

  const [categories, setCategories] = useState<Category[]>(recipe?.categories ?? []);

  const { data : existingCategoriesData, isLoading: isLoadingExistingCategories, isError: isErrorExistingCategories, error: errorExistingCategories } = useCategories()
  const existingCategories = existingCategoriesData ?? [];

  const [newCategory, setNewCategory] = useState<string>('');
  const createOrEditCategory = useCreateOrEditCategory();

  const addNewCategory = (newCategory : string) => {
    const cleanedNewCategorie = newCategory.trim().toLowerCase()
    const alreadyExistingCategory = existingCategories.find((category) => category.name == cleanedNewCategorie)
    if (categories.find((category) => category.name == cleanedNewCategorie)){
      //TODO! add a already selected message
    } else if (alreadyExistingCategory) {
        setCategories((prev)=> [...prev, alreadyExistingCategory])
    } else {
      createOrEditCategory.mutate({
        id: undefined,
        categoryData : {
          name: cleanedNewCategorie
        }
      },
      {
        onSuccess: (createdCategory)=>{
          setCategories((prev)=> [...prev, createdCategory])
        }
      })
    }
    setNewCategory('')
  }

  if (isLoading) return <div className="spinner">Loading...</div>
  if (isError) return <div className="error">Error : {error.message}</div>

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget);
    createOrEditRecipe.mutate({
      name: formData.get('name') as Recipe['name'],
      instructions: formData.get('instructions') as Recipe['instructions'],
      basePortions: formData.get('basePortions') ? parseInt(formData.get('basePortions') as string) : 0 as Recipe['basePortions'],
      status: formData.get('status') as Recipe['status'],
      ingredients: ingredients,
      categories: categories
    })
    navigate(importState?.returnTo ?? '/recipes');
  }

  return (
    <>
      {isFetching && <span className="refetch-indicator">Mise à jour...</span>}
      {importState && (
        <div className="import-banner">
          <strong>Imported recipe — please check it before saving.</strong>
          <div>
            Source: {importState.imported.source.url
              ? <a href={importState.imported.source.url} target="_blank" rel="noreferrer">{importState.imported.source.url}</a>
              : importState.imported.source.filename}
          </div>
          {draft?.translation && (
            <div>
              Text language:{" "}
              <label>
                <input type="radio" name="draftLanguage" checked={!useTranslation} onChange={() => setUseTranslation(false)} />
                Original ({importState.imported.language})
              </label>{" "}
              <label>
                <input type="radio" name="draftLanguage" checked={useTranslation} onChange={() => setUseTranslation(true)} />
                {draft.translation.language === "en" ? "English" : draft.translation.language}
              </label>
              {useTranslation && <div><em>Machine-translated — check the wording. Switching language resets the name and instructions fields.</em></div>}
            </div>
          )}
        </div>
      )}
      <form className="form" onSubmit={handleSubmit}>
        <div>
          <label>Name of the recipe:
            <input type="text" name="name" id="name" key={`name-${useTranslation}`} defaultValue={recipe?.name || draftText?.name || ''} required />
          </label>
        </div>
        <div>
          <label>Instructions:
            <textarea id="instructions" name="instructions" key={`instructions-${useTranslation}`} rows={draft ? 15 : 5} cols={draft ? 60 : 33} defaultValue={recipe?.instructions || draftText?.instructions || ''} />
          </label>
        </div>
        <div>
          <label>Base Portions:
            <input type="number" name="basePortions" id="basePortions" defaultValue={recipe?.basePortions || draft?.basePortions || 4} />
          </label>
        </div>
        <div>
          <label>Status:
            <select name="status" id="status" defaultValue={recipe?.status || "0"}>
              <option value="0">To Try</option>
              <option value="1">To Try Again</option>
              <option value="2">OK</option>
            </select>
          </label>
        </div>
        <div>
          <label>Ingredients:
            <CustomSearch 
              searchItem={searchedIngredient} 
              setSearchItem={setSearchedIngredient} 
              isLoading={isLoadingIngredientSearch} 
              isError={isErrorIngredientSearch} 
              error={errorIngredientSearch} 
              searchResult={ingredientList} 
              emptySearchMsg="No ingredients found" 
              onSelectItem={({searchItemID, searchItem}) => addIngredient({searchedIngredientID : searchItemID, searchedIngredient : searchItem})} 
              inputProps={{ name: "ingredient", id: "ingredient" }}
              addOption={true}
              resultsOnTop={true}
             />
            <ul className="chip_list">
              {ingredients.map((ingredient, index) => (
                <li key={index}>
                  <CustomDeletableChip
                    object={ingredient}
                    deleteAction={() => setIngredients(ingredients.filter((_, i) => i !== index))}
                    />
                  {ingredient.isNew && <span className="ingredient-new" title="Will be created as a new ingredient">new</span>}
                  {(ingredient.quantity || ingredient.originalName || ingredient.group) && (
                    <span className="ingredient-detail">
                      {[ingredient.quantity, ingredient.originalName && `"${ingredient.originalName}"`, ingredient.group].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </label>
        </div>
        <div>
          <label>Categories:</label>
          {isLoadingExistingCategories && <div className="spinner">Loading...</div>}
          {isErrorExistingCategories && <div className="error">Error : {errorExistingCategories?.message}</div>}
          <ul id="recipe_search_criteria_categories_list" className="chip_list">
            {existingCategories.map((category) => (
              <li key={category.id}>
                <CustomOnOffChip 
                  object={category} 
                  onClickAction={setCategories} 
                  isActive={categories.some((selected) => selected.id === category.id)} />
              </li>
            ))}
          </ul>
          <label> Add a new category ?
            <input 
              type="text" 
              name="category_name" 
              id="category_name" 
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter'){
                  e.preventDefault()
                  if (newCategory.trim() !== '') {
                    addNewCategory(newCategory)
                  }
                }
              }}
            />
            <button 
              type="button"   
              onMouseDown={event => event.preventDefault()}
              onClick={() => {
                if (newCategory.trim() !== '') {
                  addNewCategory(newCategory)
                }                
              }}
            >
              +
            </button>
          </label>
        </div>
        <button>{window.location.href.includes('edit') ? 'Update this recipe' : 'Add this recipe'}</button>
      </form>
    </>
  )
}

export default RecipeForm
