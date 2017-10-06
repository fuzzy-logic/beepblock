import React from 'react'

export default function TransactionListItem(props) {
  const { transaction } = props;
  return (
    <li>
      {transaction.from} - {transaction.to}: £{transaction.amount}
    </li>
  )
}