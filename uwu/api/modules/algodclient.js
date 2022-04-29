// https://developer.algorand.org/docs/sdks/javascript/
// https://developer.purestake.io/code-samples
const algosdk = require('algosdk');

const algodToken = {'X-API-KEY': process.env.PURESTAKE_API_KEY};
const algodServer = 'https://testnet-algorand.api.purestake.io/ps2';
const algodPort = '';
let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

module.exports = algodClient;
