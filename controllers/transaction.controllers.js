import Web3 from 'web3';

// Connect to the local Hardhat network
const web3 = new Web3("http://127.0.0.1:8545");

// Get the list of transactions for an account
const getTransactionsByAddress = async (accountAddress, startBlock = 0, endBlock = 'latest') => {
    try {
        const latestBlock = await web3.eth.getBlockNumber();
        console.log(`Latest Block: ${latestBlock}`);
        //add the transaction into json
        let transactions = [];
        for (let i = startBlock; i <= latestBlock; i++) {
            const block = await web3.eth.getBlock(i, true);
            if (block !== null && block.transactions !== null) {
                block.transactions.forEach(transaction => {
                    if (accountAddress === transaction.from || accountAddress === transaction.to) {
                        // push the transaction hash, from, to, value, and block number, gas used to the array
                        transactions.push({
                            hash: transaction.hash,
                            from: transaction.from,
                            to: transaction.to,
                            value: web3.utils.fromWei(transaction.value, 'ether'),
                            blockNumber: transaction.blockNumber,
                        });
                    }
                });
            }
        }
        return transactions;
    } catch (error) {
        console.log('Error:', error);
    }
};

const sendEther = async (sender, recipient, amountInEther, privateKey) => {
    try {
        // Create the transaction object
        const tx = {
            from: sender,
            to: recipient,
            value: web3.utils.toWei(amountInEther, 'ether'),
            gas: 21000, // Default gas limit for ETH transfer
            gasPrice: await web3.eth.getGasPrice(), // Get the current gas price from the network
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(`Transaction sent! Hash: ${receipt.transactionHash}`);
        return receipt;
    } catch (err) {
        console.log('Error sending transaction:', err);
    }
};
const getBalance = async (address) => {
    try {
        const balance = await web3.eth.getBalance(address);
        return web3.utils.fromWei(balance, 'ether');
    } catch (err) {
        console.log('Error fetching balance:', err);
    }
};

const convertBigIntToString = (obj) => {
    if (typeof obj === 'bigint') {
        return obj.toString();
    } else if (Array.isArray(obj)) {
        return obj.map(convertBigIntToString);
    } else if (typeof obj === 'object' && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, convertBigIntToString(value)])
        );
    } else {
        return obj;
    }
};

export { getTransactionsByAddress, sendEther, getBalance, convertBigIntToString };