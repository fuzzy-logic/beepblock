import React from 'react'
import moment from 'moment'

export default function TransactionListItem(props) {
  const {
    showFrom,
    showTo,
    transaction
  } = props;
  return (
    <tr>
      <td>
        {moment(transaction.timestamp*1000).format('llll')}
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
