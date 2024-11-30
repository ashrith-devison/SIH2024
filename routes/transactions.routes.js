
import { getTransactionsByAddress, sendEther, getBalance, convertBigIntToString  } from '../controllers/transaction.controllers.js';

import express from 'express';
const router = express.Router();

router.get('/transaction/:accountId', async (req, res) => {
    const { accountId } = req.params;
    try {
        const transactions= await getTransactionsByAddress(accountId);
        const transactions_DTO = convertBigIntToString(transactions);
        res.send(transactions_DTO);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/send', async (req, res) => {
    const { sender, recipient, amountInEther, privateKey } = req.body;
    try {
        const receipt = await sendEther(sender, recipient, amountInEther, privateKey);
        res.send(convertBigIntToString(receipt));
    } catch (error) {
        console.error('Error sending transaction:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/balance/:address', async (req, res) => {
    const { address } = req.params;
    try {
        const balance = await getBalance(address);
        res.json({ balance : balance, address : address }); 
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
