import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSearchIngredients } from "../../../hooks/useIngredients";
import { useCreateOrEditRecipe, useRecipe } from "../../../hooks/useRecipes";
import type { Recipe } from "../../../types/recipe";
import type { IngredientInput } from "../../../types/ingredient";
import type { DraftIngredient, ImportReviewState } from "../../../types/importer";
import Search from "../../Search/Search";
import "../RecipeImport/RecipeImport.css";

/** Display-only fields an imported ingredient carries; stripped before saving. */
type FormIngredient = IngredientInput & Partial<Pick<DraftIngredient, "isNew" | "quantity" | "note" | "group">>;

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
  const [ingredients, setIngredients] = useState<FormIngredient[]>(recipe?.ingredients ?? draft?.ingredients ?? []);

  const [searchItem, setSearchItem] = useState<string>('')
  const { data, isLoading: isLoadingSearch, isError: isErrorSearch, error: errorSearch } = useSearchIngredients({ name: searchItem.trim().toLowerCase() })
  const items = data ?? []

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
      // Imported ingredients carry display-only fields the API doesn't know about.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ingredients: ingredients.map(({ isNew, quantity, note, group, ...ingredient }) => ingredient) as Recipe['ingredients']
    })
    navigate(importState?.returnTo ?? '/recipes');
  }

  const addIngredient = ({searchItemID, searchItem}: {searchItemID: number | undefined, searchItem: string}) => {
    if (searchItem.trim() !== '') {
      const newIngredient: IngredientInput = { id: searchItemID, name: searchItem.trim() };
      setIngredients([...ingredients, newIngredient]);      
    }
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
            <Search 
              searchItem={searchItem} 
              setSearchItem={setSearchItem} 
              isLoading={isLoadingSearch} 
              isError={isErrorSearch} 
              error={errorSearch} 
              searchResult={items} 
              emptySearchMsg="No ingredients found" 
              onClickLabel={({searchItemID, searchItem}) => addIngredient({searchItemID, searchItem})} 
              inputProps={{ name: "ingredient", id: "ingredient" }}
              addOption={true}
             />
            <ul>
              {ingredients.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.name}
                  {ingredient.isNew && <span className="ingredient-new" title="Will be created as a new ingredient">new</span>}
                  {(ingredient.quantity || ingredient.group) && (
                    <span className="ingredient-detail">
                      {[ingredient.quantity, ingredient.group].filter(Boolean).join(" · ")}
                    </span>
                  )}
                  <button type="button" onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))}>X</button>
                </li>
              ))}
            </ul>
          </label>
        </div>
        <button>{window.location.href.includes('edit') ? 'Update this recipe' : 'Add this recipe'}</button>
      </form>
    </>
  )
}

export default RecipeForm
