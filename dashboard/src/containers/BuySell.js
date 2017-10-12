import React, {Component} from 'react'
import { connect } from 'react-redux'
import {
  getGridPrice,
  getZeroTo10Price,
  getTenTo20Price,
  getTwentyTo30Price,
  getThirtyTo40Price,
  getFourtyTo50Price,
  getFiftyTo60Price,
  getSixtyTo70Price,
  getSeventyTo80Price,
  getEightyTo90Price,
  getNinetyTo100Price
} from '../reducers'
import {
  changeNinetyTo100Price,
  changeEightyTo90Price,
  changeSeventyTo80Price,
  changeSixtyTo70Price,
  changeFiftyTo60Price,
  changeFortyTo50Price,
  changeThirtyTo40Price,
  changeTwentyTo30Price,
  changeTenTo20Price,
  changeZeroTo10Price
} from '../actions'
import PriceSlider from '../components/PriceSlider'
import PriceRange from '../components/PriceRange'

class BuySell extends Component {

  render = () => {
    const {
      gridPrice,
      zeroTo10Price,
      tenTo20Price,
      twentyTo30Price,
      thirtyTo40Price,
      fourtyTo50Price,
      fiftyTo60Price,
      sixtyTo70Price,
      seventyTo80Price,
      eightyTo90Price,
      ninetyTo100Price,
      changeNinetyTo100Price,
      changeEightyTo90Price,
      changeSeventyTo80Price,
      changeSixtyTo70Price,
      changeFiftyTo60Price,
      changeFortyTo50Price,
      changeThirtyTo40Price,
      changeTwentyTo30Price,
      changeTenTo20Price,
      changeZeroTo10Price
    } = this.props
    return (
      <div style={{textAlign: '-webkit-center'}}>
        <h3>Buy & Sell Prices</h3>
        <hr />
        <table
          style={{ textAlign: 'center', height: '100%'}}>
          <tbody>
            <tr>
              <td>
                <h4>BUY</h4>
                <p>Grid Price: {gridPrice.buy}</p>
              </td>
              <td></td>
              <td>
                <h4>SELL</h4>
                <p>Grid Price: {gridPrice.sell}</p>
              </td>
            </tr>

            <PriceSlider
              buyValue={'N/A'}
              sellValue={ninetyTo100Price.sell}
              title={'90% - 100%'}
              onChange={(value)=>changeNinetyTo100Price(value)}
              max={gridPrice.sell}
              min={gridPrice.buy}
              value={ninetyTo100Price.sell}
            />

            <PriceRange
              buyValue={eightyTo90Price.buy}
              sellValue={eightyTo90Price.sell}
              title={'80% - 90%'}
              onChange={(value)=>changeEightyTo90Price(value)}
              max={gridPrice.sell}
              min={gridPrice.buy}
            />
            <PriceRange
              buyValue={seventyTo80Price.buy}
              sellValue={seventyTo80Price.sell}
              title={'70% - 80%'}
              onChange={(value)=>changeSeventyTo80Price(value)}
              max={gridPrice.sell}
              min={gridPrice.buy}
            />
            <PriceRange
              buyValue={sixtyTo70Price.buy}
              sellValue={sixtyTo70Price.sell}
              title={'60% - 70%'}
              onChange={(value)=>changeSixtyTo70Price(value)}
              max={gridPrice.sell}
              min={gridPrice.buy}
            />
            <PriceRange
              buyValue={fiftyTo60Price.buy}
              sellValue={fiftyTo60Price.sell}
              title={'50% - 60%'}
              onChange={(value)=>changeFiftyTo60Price(value)}
              max={gridPrice.sell}
              min={gridPrice.buy}
            />
            <PriceRange
              buyValue={fourtyTo50Price.buy}
              sellValue={fourtyTo50Price.sell}
              title={'40% - 50%'}
              onChange={(value)=>changeFortyTo50Price(value)}
              max={gridPrice.sell}
              min={gridPrice.buy}
            />
            <PriceRange
              buyValue={thirtyTo40Price.buy}
              sellValue={thirtyTo40Price.sell}
              title={'30% - 40%'}
              onChange={(value)=>changeThirtyTo40Price(value)}
              max={gridPrice.sell}
              min={gridPrice.buy}
            />
            <PriceRange
              buyValue={twentyTo30Price.buy}
              sellValue={twentyTo30Price.sell}
              title={'20% - 30%'}
              onChange={(value)=>changeTwentyTo30Price(value)}
              max={gridPrice.sell}
              min={gridPrice.buy}
            />
            <PriceRange
              buyValue={tenTo20Price.buy}
              sellValue={tenTo20Price.sell}
              title={'10% - 20%'}
              onChange={(value)=>changeTenTo20Price(value)}
              max={gridPrice.sell}
              min={gridPrice.buy}
            />

            <PriceSlider
              sellValue={'N/A'}
              buyValue={zeroTo10Price.buy}
              title={'0% - 10%'}
              onChange={(value)=>changeZeroTo10Price(value)}
              max={gridPrice.sell}
              min={gridPrice.buy}
              value={zeroTo10Price.buy}
            />
          </tbody>

        </table>
      </div>
    )
  }
}

const mapStateToProps = (state, { params }) => {
  return {
    gridPrice: getGridPrice(state),
    zeroTo10Price: getZeroTo10Price(state),
    tenTo20Price: getTenTo20Price(state),
    twentyTo30Price: getTwentyTo30Price(state),
    thirtyTo40Price: getThirtyTo40Price(state),
    fourtyTo50Price: getFourtyTo50Price(state),
    fiftyTo60Price: getFiftyTo60Price(state),
    sixtyTo70Price: getSixtyTo70Price(state),
    seventyTo80Price: getSeventyTo80Price(state),
    eightyTo90Price: getEightyTo90Price(state),
    ninetyTo100Price: getNinetyTo100Price(state)
  };
};

export default connect(
  mapStateToProps,
  {
    changeNinetyTo100Price,
    changeEightyTo90Price,
    changeSeventyTo80Price,
    changeSixtyTo70Price,
    changeFiftyTo60Price,
    changeFortyTo50Price,
    changeThirtyTo40Price,
    changeTwentyTo30Price,
    changeTenTo20Price,
    changeZeroTo10Price
  }
)(BuySell)
