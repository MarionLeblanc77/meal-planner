import {useState } from 'react'
import type { Searchable } from '../../types/search'

interface SearchComponentProps<Searchable> {
  searchItem: string;
  setSearchItem: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  searchResult: Searchable[];
  emptySearchMsg: string;
  onClickLabel?: ({searchItemID, searchItem}: {searchItemID: number | undefined, searchItem: string}) => void | undefined | Promise<void>;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  addOption?: boolean;
  isAlwaysVisible?: boolean;
}

function Search<T extends Searchable>({ 
  searchItem, setSearchItem, isLoading, isError, error, searchResult = [], emptySearchMsg = 'No items found', onClickLabel = undefined, inputProps = {}, addOption = false, isAlwaysVisible = false }: SearchComponentProps<T>) {
  const [isActive, setIsActive] = useState<boolean>(false)

  return (
    <div>
      {isLoading && <div className="spinner">Loading...</div>}
      {isError && <div className="error">Error : {error?.message}</div>}
      <input
        type="text"
        value={searchItem}
        onChange={e => setSearchItem(e.target.value)}        
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        placeholder='Type to search'
        {...inputProps}
      />
      {addOption && isActive && searchItem.trim() !== '' && (
        <button 
          type="button"   
          onMouseDown={event => event.preventDefault()}
          onClick={() => {
            onClickLabel?.({searchItemID: undefined, searchItem})
            setSearchItem('')
          }}
        >
          +
        </button>
      )}
      {searchResult.length === 0
        ? <p>{emptySearchMsg}</p>
        : (isAlwaysVisible || isActive) && (
          <ul>
            {searchResult.map(item =>
              <li key={item.id}>
                <button 
                  type="button"   
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => {
                    onClickLabel?.({searchItemID: item.id, searchItem: item.name})
                    setSearchItem('')
                  }}
                >
                  {item.name}
                </button>
              </li>
            )}
          </ul>
        )
      }
    </div>
  )
}

export default Search