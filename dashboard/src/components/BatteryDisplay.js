import React from 'react'

const BatteryDisplay = (props) => {
  const { charge } = props

  const fullStyle = {
    backgroundColor: 'white',
    padding: '2px'
  }

  let rows = [];
  for (var i = 10; i > 0; i--) {
    if (Math.floor(charge/10) === i) {
      rows.push(<tr style={{height:'11px'}}><td className='currentLevel'></td></tr>);
    } else if ((charge/10) > i) {
      rows.push(<tr style={{height:'11px'}}><td style={fullStyle}></td></tr>);
    } else {
      rows.push(<tr style={{height:'11px'}}><td></td></tr>);
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
