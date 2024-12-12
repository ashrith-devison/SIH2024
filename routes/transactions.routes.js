
import { getTransactionsByAddress, sendEther, getBalance, convertBigIntToString, getHourlyTransactionWithCount  } from '../controllers/transaction.controllers.js';

import express from 'express';
import axios from 'axios';
const router = express.Router();
router.get('/transaction/:accountId', async (req, res) => {
    const { accountId } = req.params;
    try {
        const transactions= await getTransactionsByAddress(accountId);
        console.log(transactions);
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

import {checkSpam, trackHistory } from '../controllers/spam.controller.js';
import { classify, getLocation, locateMyIp } from '../controllers/geolocation.controller.js';

router.get('/spam/:account', async (req, res) => {
    const { account } = req.params;
    try {
        const response = await checkSpam(account);
        res.json(response);
    } catch (error) {
        console.error('Error checking spam:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/history/:sender/:receiver', async (req, res) => {
    const { sender, receiver } = req.params;
    try {
        const senderResp = await trackHistory(sender);
        const receiverResp = await trackHistory(receiver);
        res.json({
            "sender": {
                "senderId" : convertBigIntToString(senderResp),
                "transaction" :  await getHourlyTransactionWithCount(senderResp),
            },
            "recipient":  {
                "recipientId" : convertBigIntToString(receiverResp),
                "transaction" : await getHourlyTransactionWithCount(receiverResp),
            },
         });
    } catch (error) {
        console.error('Error tracking history:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/history/l2/:sender/:receiver', async (req, res) => {
    const { sender, receiver } = req.params;
    try {
        const resp = await axios.get(`${process.env.BACKEND_URL}/api/history/${sender}/${receiver}`);
        // sender prespective
        const senderResp = resp.data.sender;
        const threshold = process.env.threshold;
        let spam = false;
        let message = "";    
        for(let i=0;i<senderResp.transaction.transactions.length;i++){
            console.log(senderResp.transaction.transactions[i].length);
            if(senderResp.transaction.transactions[i].length > threshold){
                spam = true;
                message += "Spam detected because of high frequency of transactions by sender";
                break;
            }
        }
        // receiver prespective
        const receiverResp = resp.data.recipient;
        for(let i=0;i<receiverResp.transaction.transactions.length;i++){
            if(receiverResp.transaction.transactions[i].length > threshold){
                spam = true;
                message += "\nSpam detected because of high frequency of transactions by receiver";
                break;
            }
        }
        res.json({spam : spam, message : message});
    } catch (error) {
        console.error('Error tracking history:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/history/l3', async (req, res) => {
    const result =await classify(await locateMyIp());
    res.send(result);
});

router.get('/ml/level3/:ip', async (req, res) => {
    const { ip } = req.params;
    const result = await classify(await getLocation(ip));
    res.send(result);
});

import { getTransaction, getDailyTransactionsWithCount } from '../controllers/funds.controller.js';
router.get('/history/l4/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params;
    const result = await getTransaction(user1, user2);
    res.send({result});
});

router.get('/checks/:hash/:sender/:receiver', async (req, res) => {
    const { hash, sender, receiver } = req.params;    
    const resHash = await axios.get(`${process.env.BACKEND_URL}/api/spam/${hash}`);
    const resSender = await axios.get(`${process.env.BACKEND_URL}/api/history/l2/${sender}/${receiver}`);
    const ip = await axios.get(`${process.env.BACKEND_URL}/api/history/l3`);
    res.json({ 
        level1 : resHash.data,
        level2 : resSender.data,
        level3 : ip.data
    });
});

export default router;
