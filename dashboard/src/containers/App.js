import React, { Component } from 'react'
import { connect } from 'react-redux'
import GridContainer from '../components/GridContainer'
import GridItem from '../components/GridItem'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BuySell from './BuySell'
import Generation from './Generation'
import Consume from './Consume'
import Battery from './Battery'
import { updateBattery } from '../actions'
import { getConsumptionRate, getCreationRate } from '../reducers'

class App extends Component {

  componentDidMount = () => {
    this.interval = setInterval(() => this.drain(), 1000);
  }

  componentWillUnmount = () => {
    clearInterval(this.interval)
  }

  drain = () => {
    const { consumeRate, createRate, updateBattery} = this.props
    let drain = (createRate-consumeRate)/(3600)
    updateBattery(drain)
  }

  render = () => {
    return (
      <GridContainer rowTemplate='1fr 10fr 1fr'
        columnTemplate={`2fr 1fr 1fr 1fr`}
        style={{ textAlign: 'center', height: '100%'}}>

        <GridItem columns='1 / 5' rows='1 / 2' style={{ backgroundColor: 'whitesmoke'}} >
          <Header />
        </GridItem>

        <GridItem columns='1 / 2' rows='2 / 3' style={{ backgroundColor: '#43952a'}}>
          <BuySell />
        </GridItem>
        <GridItem columns='2 / 3' rows='2 / 3' style={{ backgroundColor: '#a4c93f'}}>
          <Generation />
        </GridItem>
        <GridItem columns='3 / 4' rows='2 / 3' style={{ backgroundColor: '#fffd54'}}>
          <Consume />
        </GridItem>
        <GridItem columns='4 / 5' rows='2 / 3' style={{ backgroundColor: '#363636', color: 'white', textAlign: 'center'}}>
          <Battery />
        </GridItem>

        <GridItem columns='1 / 5' rows='3 / 4' style={{ backgroundColor: 'whitesmoke'}}>
          <Footer />
        </GridItem>
      </GridContainer>
    );
  }

}

const mapStateToProps = (state, { params }) => {
  return {
    consumeRate: getConsumptionRate(state),
    createRate: getCreationRate(state)
  };
};

export default connect(
  mapStateToProps,
  {
    updateBattery
  }
)(App)
