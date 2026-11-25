import {useState } from 'react'
import type { Searchable } from '../../../types/search'
import './CustomSearch.css'

interface SearchComponentProps<Searchable> {
  searchItem: string;
  setSearchItem: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  searchResult: Searchable[];
  emptySearchMsg: string;
  onCreateItem?: ({searchItemID, searchItem}: {searchItemID: number | undefined, searchItem: string}) => void | undefined | Promise<void>;
  onSelectItem?: ({searchItemID, searchItem}: {searchItemID: number, searchItem: string}) => void | undefined | Promise<void>;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  addOption?: boolean;
  isAlwaysVisible?: boolean;
  resultsOnTop?: boolean;
  style?: string;
}

function CustomSearch<T extends Searchable>({ 
  searchItem, setSearchItem, isLoading, isError, error, searchResult = [], emptySearchMsg = 'No items found', onCreateItem = undefined, onSelectItem = undefined, inputProps = {}, addOption = false, isAlwaysVisible = false, resultsOnTop = false, style }: SearchComponentProps<T>) {
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
        onKeyDown={e => {
          if (e.key === 'Enter'){
            e.preventDefault()
            if (searchItem.trim() !== '' && addOption) {
              onCreateItem?.({searchItemID: undefined, searchItem})
              setSearchItem('')
            }
          }
        }}
        placeholder='Type to search'
        {...inputProps}
      />
      {addOption && isActive && searchItem.trim() !== '' && (
        <button 
          type="button"   
          onMouseDown={event => event.preventDefault()}
          onClick={() => {
            onCreateItem?.({searchItemID: undefined, searchItem})
            setSearchItem('')
          }}
        >
          +
        </button>
      )}
      <div className={`${resultsOnTop ? 'results top' : 'results'}`}>
        {isActive && searchResult.length === 0
          ? <p>{emptySearchMsg}</p>
          : (isAlwaysVisible || isActive) && (
            <ul className={`search_results ${style === 'select' ? 'search_results_select' : '' }`}>
              {searchResult.map(item =>
                <li key={item.id}>
                  <button
                    className={`search_results_item ${style === 'select' ? 'search_results_item_select' : '' }`}
                    type="button"   
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => {
                      onSelectItem?.({searchItemID: item.id, searchItem: item.name})
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
    </div>
  )
}

export default CustomSearch