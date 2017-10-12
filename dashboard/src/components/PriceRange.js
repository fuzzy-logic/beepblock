import React from 'react'
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
const PriceRange = (props) => {
  return(
    <tr>
      <td style={{verticalAlign: 'middle'}}>
        {props.buyValue}
      </td>
      <td>
        {props.title}
        <div style={{height: '40px', width:'300px'}}>
        <Range
          min={props.min}
          max={props.max}
          value={[props.buyValue, props.sellValue]}
          onChange={props.onChange}

        />
        </div>
      </td>
      <td style={{verticalAlign: 'middle'}}>
        {props.sellValue}
      </td>
    </tr>
  )
}

export default PriceRange
