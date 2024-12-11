import express from 'express';
import cors from 'cors';
import Web3 from 'web3';
const web3 = new Web3("http://127.0.0.1:8545");

const testConnection = async () => {
  try {
      const isListening = await web3.eth.net.isListening();
      console.log("Connected to the network:", isListening);
      return isListening;
  } catch (err) {
      console.log('Error:', err);
      return false;
  }
};

const app = express();
app.use(cors({
  origin : '*',
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

testConnection().then((resp) => {
  if (resp) {
    app.listen(3000, () => {
      console.log('Server running on port 3000');
    });
  } else {
    console.log('Error connecting to the network. Server not started.');
  }
} )

import routes_transactions from './routes/transactions.routes.js';
app.use('/api', routes_transactions);