import React from 'react'

export default function TransactionListItem(props) {
  const { 
    showFrom,
    showTo,
    transaction
  } = props;
  return (
    <tr>
      <td>
        {convertDate(transaction.timestamp)}
      </td>
      {
        showFrom ?
          <td>
            {transaction.from}
          </td>
          : null
      }
      {
        showTo ?
          <td>
            {transaction.to}
          </td>
          : null
      }
      <td className="text-right">
        £{transaction.amount}
      </td>
    </tr>
  )
}

function convertDate(timestamp) {
  var d = new Date(timestamp * 1000) //x1000 to convert from seconds to milliseconds 
  var s = d.toUTCString();
  s = s.substring(0, s.indexOf("GMT")) + "UTC" //change the confusing 'GMT' to 'UTC' s
  return s;
}
