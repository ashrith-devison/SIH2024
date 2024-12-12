import express from 'express';
import cors from 'cors';
import Web3 from 'web3';
const web3 = new Web3(process.env.blockChainLink);

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

const closeConnection = async () => {
  try {
      const resp = await testConnection();
      if (resp) {
          web3.setProvider(null);
          return "Disconnected from the network";
      } else {
          return "Not connected to the network";
      }
  } catch (err) {
      console.log('Error:', err);
      return "Error disconnecting from the network";
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

app.get('/disconnect', async (req, res) => {
  await closeConnection().then((resp) => {
    console.log(resp);
    res.send(resp);
  });
});

import routes_transactions from './routes/transactions.routes.js';
app.use('/api', routes_transactions);