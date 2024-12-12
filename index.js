import express from 'express';
import cors from 'cors';
import Web3 from 'web3';
<<<<<<< HEAD
const web3 = new Web3("http://172.16.56.124:8545");
=======
const web3 = new Web3("http://127.0.0.1:8545");
>>>>>>> f0f14871f8a2343540925144f6beeb437593db4e

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

<<<<<<< HEAD
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

=======
>>>>>>> f0f14871f8a2343540925144f6beeb437593db4e
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

<<<<<<< HEAD
app.get('/disconnect', async (req, res) => {
  await closeConnection().then((resp) => {
    console.log(resp);
    res.send(resp);
  });
});

=======
>>>>>>> f0f14871f8a2343540925144f6beeb437593db4e
import routes_transactions from './routes/transactions.routes.js';
app.use('/api', routes_transactions);