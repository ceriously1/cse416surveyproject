const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    from: {type: String, required: true}, // Not quite sure how algorand will be intergated. This is a placeholder for wallet address
    to: {type: String, required: true},
    date: {type: Date, required: true},
    status: {type: Number, required: true},
}, {versionKey: false});

module.exports = mongoose.model('Transaction', transactionSchema, 'Transactions');
