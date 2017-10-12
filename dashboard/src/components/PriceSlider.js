import React from 'react'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
const PriceSlider = (props) => {
  return(
    <tr>
      <td style={{verticalAlign: 'middle'}}>
        {props.buyValue}
      </td>
      <td>
        {props.title}
        <div style={{height: '40px', width:'300px'}}>
          <Slider
            min={props.min}
            max={props.max}
            value={props.value}
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

export default PriceSlider
