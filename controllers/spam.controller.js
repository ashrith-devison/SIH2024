import { spawn } from 'child_process';
import axios from 'axios';
const checkSpam = (text) => {
    return new Promise((resolve, reject) => {
        const process = spawn('python', ['./ML.models/spam.py', text]);

        let result = '';

        process.stdout.on('data', (data) => {
            result += data.toString();
            const lines = result.split('\n');
            const response = {
                spam : lines[1].trim() === '1' ? true : false,
                transaction : lines[0].trim()
            };
            resolve(response);
        });

        process.stderr.on('data', (data) => {
            reject(data.toString());
        });

        process.on('close', (code) => {
            if (code === 0) {
                resolve(result);
            } else {
                reject('Error');
            }
        });
    });
};

const trackHistory = async (sender) => {
    const response = await axios.get(`${process.env.BACKEND_URL}/api/transaction/${sender}`);
    console.log(response.data);
    return response.data;
};

export {
    checkSpam,
    trackHistory,
};

// checkSpam('0x456').then((result) => {
    
//     console.log(response);

// })
// .catch((error) => {
//     console.error(error);
// }
// );
