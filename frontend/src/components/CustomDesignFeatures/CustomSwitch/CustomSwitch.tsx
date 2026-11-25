import Switch from '@mui/material/Switch';

interface CustomSwitchProps {
  textLeft?: string,
  textRight?: string,
  checkedValue : boolean,
  checkedSetter : (checked:boolean) => void
}
            
function CustomSwitch({textLeft, textRight, checkedValue, checkedSetter} : CustomSwitchProps) {
  return (
  <div className="switch">
    <p>{textLeft}</p>
    <Switch 
      checked={checkedValue} 
      onChange={(e) => checkedSetter(e.target.checked)} 
    />
    <p>{textRight}</p>
  </div>
  )
} 

export default CustomSwitch
            