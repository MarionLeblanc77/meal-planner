import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { importErrorMessage, useImportRecipe, useLastImport } from "../../../../hooks/useImporter"
import type { ImportResult, ImportReviewState } from "../../../../types/importer"
import "./RecipeImport.css"

const ACCEPTED_FILES = "image/jpeg,image/png,image/webp,image/gif,application/pdf"
const MAX_FILE_MB = 32

function RecipeImport() {
  const navigate = useNavigate()
  const importRecipe = useImportRecipe()
  const { data: lastImport } = useLastImport()
  const [url, setUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const result: ImportResult | null | undefined = importRecipe.data ?? lastImport

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null
    setFileError(
      picked && picked.size > MAX_FILE_MB * 1024 * 1024
        ? `This file is ${(picked.size / 1024 / 1024).toFixed(1)} MB — the limit is ${MAX_FILE_MB} MB.`
        : null,
    )
    setFile(picked)
  }

  const submitUrl = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (url.trim()) importRecipe.mutate({ url: url.trim() })
  }

  const submitFile = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (file && !fileError) importRecipe.mutate({ file })
  }

  const review = (index: number) => {
    if (!result) return
    const { draft, imported } = result.recipes[index]
    const state: ImportReviewState = {
      importDraft: draft,
      imported,
      returnTo: result.recipes.length > 1 ? "/recipes/import" : "/recipes",
    }
    navigate("/recipes/import/review", { state })
  }

  const busy = importRecipe.isPending
  const totalCost = result?.usage.reduce((sum, u) => sum + (u.cost ?? 0), 0) ?? 0

  return (
    <div className="recipe-import">
      <form className="form" onSubmit={submitUrl}>
        <label>
          From a web page:
          <input
            type="url"
            name="url"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={busy}
            required
          />
        </label>
        <button disabled={busy || !url.trim()}>Import</button>
      </form>

      <form className="form" onSubmit={submitFile}>
        <label>
          From a photo or PDF:
          <input type="file" name="file" accept={ACCEPTED_FILES} onChange={onFileChange} disabled={busy} />
        </label>
        <button disabled={busy || !file || !!fileError}>Import</button>
        {fileError && <div className="error">{fileError}</div>}
      </form>

      {busy && (
        <div className="spinner">Reading the recipe… this can take up to 30 seconds.</div>
      )}
      {importRecipe.isError && (
        <div className="error">{importErrorMessage(importRecipe.error)}</div>
      )}

      {!busy && result && (
        <section className="import-results">
          <h2>
            {result.recipes.length === 1
              ? "1 recipe found"
              : `${result.recipes.length} recipes found — review each one you want to keep`}
          </h2>
          <ul>
            {result.recipes.map(({ imported, draft }, index) => (
              <li key={index}>
                {imported.images[0] && (
                  <img src={imported.images[0]} alt="" className="import-thumb" />
                )}
                <div className="import-info">
                  <strong>{draft.name}</strong>
                  {draft.translation && <span className="import-translation"> — {draft.translation.name}</span>}
                  {imported.summary && <p>{imported.summary}</p>}
                  <small>
                    {draft.ingredients.length} ingredients
                    {draft.ingredients.some((i) => i.isNew) &&
                      ` (${draft.ingredients.filter((i) => i.isNew).length} new)`}
                    {draft.basePortions && ` · for ${draft.basePortions}`}
                  </small>
                </div>
                <button type="button" onClick={() => review(index)}>Review</button>
              </li>
            ))}
          </ul>
          {window.APP_CONFIG?.APP_ENV === "dev" && (
            <small className="import-cost">
              {result.usage.map((u) => u.model).join(", ") || "no model call"} · ${totalCost.toFixed(4)}
            </small>
          )}
        </section>
      )}
    </div>
  )
}

export default RecipeImport
