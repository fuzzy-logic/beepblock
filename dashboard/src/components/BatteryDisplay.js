import React from 'react'

const BatteryDisplay = (props) => {
  const { charge, direction } = props

  const fullStyle = {
    backgroundColor: 'white',
    padding: '2px'
  }

  let rows = [];
  for (var i = 9; i >= 0 ; i--) {
    if (Math.round(charge*100) === 10000) {
      rows.push(<tr key={i} style={{height:'11px'}}><td style={fullStyle}></td></tr>);
    } else if(Math.round(charge*100) === 0) {
      rows.push(<tr key={i} style={{height:'11px'}}><td></td></tr>);
    } else if (Math.floor(charge/10) === i) {

      switch (direction) {
        case 'up':
          rows.push(<tr key={i} style={{height:'11px'}}><td className='currentUp'></td></tr>);
          break;
        case 'down':
          console.log('here')
          rows.push(<tr key={i} style={{height:'11px'}}><td className='currentDown'></td></tr>);
          break;
        default:
          rows.push(<tr key={i} style={{height:'11px'}}><td className='currentLevel'></td></tr>);
      }

    } else if ((charge/10) > i) {
      rows.push(<tr key={i} style={{height:'11px'}}><td style={fullStyle}></td></tr>);
    } else {
      rows.push(<tr key={i} style={{height:'11px'}}><td></td></tr>);
    }
  }
  return(
    <div>
      <div style={{ width: '16px', height: '12px', backgroundColor: 'white' }} />
      <table style={{
        width:'60px',
        borderColor:'white',
        borderWidth:'2px',
        borderStyle: 'solid'
      }}>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  )
}

export default BatteryDisplay
