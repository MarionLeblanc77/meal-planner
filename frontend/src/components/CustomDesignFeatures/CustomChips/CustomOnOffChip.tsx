import type { ChipItem } from "../../../types/custom-design-feature";import "./CustomChip.css"

interface CustomOnOffChipProps<T extends ChipItem> {
  object: T;
  onClickAction: React.Dispatch<React.SetStateAction<T[]>>
  isActive?: boolean;
}


function CustomOnOffChip<T extends ChipItem>({ object, onClickAction, isActive }: CustomOnOffChipProps<T>) {
  return (
    <button
      type="button"
      className={`chip ${isActive ? 'selected_chip' : ''}`}
      onClick={() => {
        if(isActive) {
          onClickAction((prev) => prev.filter((c) => c.id !== object.id))
        } else {
          onClickAction((prev) => [...prev, object])
        }
      }}
    >
      <span>{object.name}</span>
    </button>
  )
}

export default CustomOnOffChip
