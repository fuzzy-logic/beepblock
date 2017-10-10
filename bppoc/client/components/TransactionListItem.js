import React from 'react'

export default function TransactionListItem(props) {
  const { transaction } = props;
  return (
    <tr>
      <td>
        {convertDate(transaction.timestamp)}
      </td>
      <td>
        {transaction.from}
      </td>
      <td>
        {transaction.to}
      </td>
      <td>
        £{transaction.amount}
      </td>
    </tr>
  )
}

function convertDate(timestamp) {
  var d = new Date(timestamp * 1000) //x1000 to convert from seconds to milliseconds 
  var s = d.toUTCString();
  s = s.substring(0,s.indexOf("GMT")) + "UTC" //change the confusing 'GMT' to 'UTC' s
  return s;
}
