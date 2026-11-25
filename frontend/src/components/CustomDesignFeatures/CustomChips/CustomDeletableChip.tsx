import { MdClose } from "react-icons/md";
import type { ChipItem } from "../../../types/custom-design-feature";
import "./CustomChip.css"

interface CustomDeletableChipProps<T extends ChipItem> {
  object: T;
  deleteAction: () => void
}


function CustomDeletableChip<T extends ChipItem>({ object, deleteAction }: CustomDeletableChipProps<T>) {
  return (
    <button
      type="button"
      className="chip chip_deletable"
      onClick={deleteAction}
    >
      <span className="chip_deletable_text">
        {object.name}
        <span className="onHover">
          <MdClose />
        </span>
      </span>

    </button>
  )
}

export default CustomDeletableChip