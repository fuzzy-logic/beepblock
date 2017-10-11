import React from 'react';
import PropTypes from 'prop-types';

const GridContainer = (props) => {

  const { rowTemplate, columnTemplate, areasTemplate } = props

  const style = {
    display: 'grid',
    gridTemplateRows: rowTemplate,
    gridTemplateColumns: columnTemplate,
    gridTemplateAreas: areasTemplate,
    ...props.style
  }

  return <div style={style}>{props.children}</div>

}

GridContainer.propTypes = {
  rowTemplate: PropTypes.string,
  columnTemplate: PropTypes.string,
  areasTemplate: PropTypes.string,
  children: PropTypes.node,
  style: PropTypes.object
}

export default GridContainer
