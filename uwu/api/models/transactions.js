const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    type: {type: String, required: true},    // types: fund/defund/reward
    from: {type: mongoose.Schema.Types.ObjectId, required: true}, // can be survey or user id
    to: {type: mongoose.Schema.Types.ObjectId, required: true}, // can be survey or user id
    from_name: {type: String, required: true},  // user's name or survey title
    to_name: {type: String, required: true},    // user's name or survey title
    amount: {type: Number, required: true, min: 0},
    time: {type: Date, required: true}
}, {versionKey: false});

module.exports = mongoose.model('Transaction', transactionSchema, 'Transactions');
