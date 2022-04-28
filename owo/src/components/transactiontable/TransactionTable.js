// https://dev.to/abdulbasit313/an-easy-way-to-create-a-customize-dynamic-table-in-react-js-3igg
function TransactionTable(props) {
    function header() {
        return <tr>
            <th>Transaction Id</th>
            <th>Type</th>
            <th>From</th>
            <th>Id</th>
            <th>To</th>
            <th>Id</th>
            <th>Amount (mAlgos)</th>
            <th>Time</th>
        </tr>
    }

    function row(transaction) {
        const date = new Date(transaction.time);
        return <tr>
            <td>{transaction._id}</td>
            <td>{transaction.type}</td>
            <td>{transaction.from_name}</td>
            <td>{transaction.from}</td>
            <td>{transaction.to_name}</td>
            <td>{transaction.to}</td>
            <td>{transaction.amount}</td>
            <td>{date.toLocaleDateString() + ' - ' + date.toLocaleTimeString()}</td>
        </tr>
    }

    return <div>
        Transaction Table:
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