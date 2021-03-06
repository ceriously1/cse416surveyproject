import './transactions.css'

// https://dev.to/abdulbasit313/an-easy-way-to-create-a-customize-dynamic-table-in-react-js-3igg
function TransactionTable(props) {
    function header() {
        return <tr>
            <th>Transaction Id</th>
            <th>Type</th>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
            <th>Time</th>
            <th>Algorand Transaction Success</th>
        </tr>
    }

    function row(transaction) {
        const date = new Date(transaction.time);
        return <tr>
            <td>{transaction._id}</td>
            <td>{transaction.type}</td>
            <td>{transaction.from_name}</td>
            <td>{transaction.to_name}</td>
            <td>{transaction.amount}</td>
            <td>{date.toLocaleDateString() + ' - ' + date.toLocaleTimeString()}</td>
            <td>{(transaction.type === 'withdraw' || transaction.type === 'deposit') ? (transaction.success ? 'true': 'false') : 'N/A'}</td>
        </tr>
    }

    return <div>
        <div className='pad'>Transaction Table:</div>
        {(props.transactions.length < 1) ? <div>No transactions.</div> : null}
        <table>
            <tbody>
            {header()}
            {props.transactions.map(transaction => {return row(transaction);})}
            </tbody>
        </table>
    </div>
}

export default TransactionTable;