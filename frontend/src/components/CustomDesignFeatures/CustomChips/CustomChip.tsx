import type { ChipItem } from "../../../types/custom-design-feature";
import "./CustomChip.css"

interface CustomDeletableChipProps<T extends ChipItem> {
  object: T;
}


function CustomDeletableChip<T extends ChipItem>({ object }: CustomDeletableChipProps<T>) {
  return (
    <button
      type="button"
      className="chip"
    >
      <span>
        {object.name}
      </span>
    </button>
  )
}

export default CustomDeletableChip