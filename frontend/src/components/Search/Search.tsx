import {useState } from 'react'
import type { SearchProps, Searchable } from '../../types/search'

interface SearchComponentProps<T extends Searchable> {
  fetchHook: SearchProps<T>['fetchHook'];
  emptySearchMsg: string;
  onClickLabel?: ((searchItem: string) => void) | undefined;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

function Search<T extends Searchable>({ fetchHook, emptySearchMsg = 'No items found', onClickLabel = undefined, inputProps = {} }: SearchComponentProps<T>) {
  const [isActive, setIsActive] = useState<boolean>(false)
  const [searchItem, setSearchItem] = useState<string>('')
  const { data, isLoading, isError, error } = fetchHook  
  const items = data ?? []
  const searchTerm = searchItem.trim().toLowerCase()
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm)
  )

  if (isLoading) return <div className="spinner">Loading...</div>
  if (isError) return <div className="error">Error : {error.message}</div>

  return (
    <div>      
      <input
        type="text"
        value={searchItem}
        onChange={e => setSearchItem(e.target.value)}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        placeholder='Type to search'
        {...inputProps}
      />
      {isActive && searchItem.trim() !== '' && (
        <button 
          type="button"   
          onMouseDown={event => event.preventDefault()}
          onClick={() => onClickLabel?.(searchItem)}
        >
          +
        </button>
      )}
      {isActive && filteredItems.length === 0
        ? <p>{emptySearchMsg}</p>
        : isActive && (
          <ul>
            {filteredItems.map(item => 
              <li key={item.id}>
                <button 
                  type="button"   
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => onClickLabel?.(item.name)}
                >
                  + {item.name}
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