import React from 'react';
import PropTypes from 'prop-types';

const GridItem = (props) => {

  const { rowStart, rowEnd, columnStart, columnEnd } = props

  const {
    columns = `${columnStart} / ${columnEnd}`,
    rows = `${rowStart} / ${rowEnd}`,
  } = props

  const style = {
    gridColumn: columns,
    gridRow: rows,
    ...props.style
  }

  return <div style={style}>{props.children}</div>
}


GridItem.propTypes = {
  area: PropTypes.string,
  rowStart: PropTypes.number,
  rowEnd: PropTypes.number,
  columnStart: PropTypes.number,
  columnEnd: PropTypes.number,
  columns: PropTypes.string,
  rows: PropTypes.string,
  children: PropTypes.node,
  style: PropTypes.object
}


export default GridItem
