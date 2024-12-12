import { getTransactionsByAddress } from "./transaction.controllers.js";
import { trackHistory } from "./spam.controller.js";


const getDailyTransactionsWithCount = (transactions) => {
    const grouped = {}; 
    transactions.forEach((transaction) => {
    const date = new Date(transaction.timestamp); 
    const day = date.toISOString().split('T')[0]; 

    if (!grouped[day]) {
      grouped[day] = []; 
    }
    const dto = {
        timestamp: transaction.timestamp,
        value: transaction.value
    }
    grouped[day].push(dto); 
  });

  const result = {
    dates: Object.keys(grouped),
    transactions: Object.values(grouped)
  };

  return result;
};

const getValue = async (transactionData) =>{
    let value = 0;
    transactionData.forEach((transaction) => {
        value += transaction.value - '0';
    });
    return value;
};

const getTransaction = async (userA, userB) => {
    try {
        const userAT = await getTransactionsByAddress(userA);
        const userBT = await getTransactionsByAddress(userB);
        const valueA = await getDailyTransactionsWithCount(userAT);
        const valueB = await getDailyTransactionsWithCount(userBT);
        const threshold = process.env.EtherMax;
        let cntA = 0;
        let cntB = 0;
        for(let i=0;i<valueA.transactions.length;i++){
            valueA.transactions[i] = await getValue(valueA.transactions[i]);
            if(valueA.transactions[i] > threshold) cntA++;
        }
        for(let i=0;i<valueB.transactions.length;i++){
            valueB.transactions[i] = await getValue(valueB.transactions[i]);
            if(valueB.transactions[i] > threshold) cntB++;
        }
        const spamThreshold = process.env.spamThreshold;
        let spam =  false;
        if(cntA >= spamThreshold) spam = true;
        if(cntB >= spamThreshold) spam = true;
        let message = spam ? "Excess Transaction Values are found ..." : "Please be aware of frauds";
        return {sender : valueA, receiver : valueB, cnt : [cntA, cntB], spam : spam, message : message};
    } catch (error) {
        console.error(`Error fetching transactions: ${error}`);
        throw error;
    }
};


export { getTransaction, getDailyTransactionsWithCount };