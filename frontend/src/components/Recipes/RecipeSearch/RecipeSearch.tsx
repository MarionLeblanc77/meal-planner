import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { useSearchRecipes } from "../../../hooks/useRecipes";
import Search from "../../Search/Search"

function RecipeSearch() {
  const navigate = useNavigate();

  const [searchItem, setSearchItem] = useState<string>('')
  const { data, isLoading: isLoadingSearch, isError: isErrorSearch, error: errorSearch } = useSearchRecipes({ name: searchItem.trim().toLowerCase() })
  const items = data ?? []

  return (
    <>
      <Search 
        searchItem={searchItem} 
        setSearchItem={setSearchItem} 
        isLoading={isLoadingSearch} 
        isError={isErrorSearch} 
        error={errorSearch} 
        searchResult={items} 
        emptySearchMsg="No recipes found" 
        onClickLabel={({searchItemID}) => navigate(`/recipes/${searchItemID}`)} 
        inputProps={{ name: "recipe", id: "recipe" }} />
    </>
  )
}

export default RecipeSearch
