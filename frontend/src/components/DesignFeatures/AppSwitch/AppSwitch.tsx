import Switch from '@mui/material/Switch';

interface AppSwitchProps {
  textLeft?: string,
  textRight?: string,
  checkedValue : boolean,
  checkedSetter : (checked:boolean) => void
}
            
function AppSwitch({textLeft, textRight, checkedValue, checkedSetter} : AppSwitchProps) {
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

export default AppSwitch
            