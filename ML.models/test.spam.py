import os
import unittest
from spam import Spam

class TestSpam(unittest.TestCase):

    def setUp(self):
        # Create data.csv before each test
        with open('data.csv', 'w') as f:
            f.write('transactionHash,sender,receiver,spam\n')
            f.write('0x123,0xabc,0xdef,0\n')
            f.write('0x456,0xghi,0xjkl,1\n')
            f.write('0x789,0xabc,0xghi,0\n')

    def test_predict_existing_transaction(self):
        spam_detector = Spam()
        
        prediction = spam_detector.predict('0x456')
        print(prediction)
        self.assertEqual(prediction, 1, "Prediction for transaction hash '0x456' should be 1")

        prediction = spam_detector.predict('0x123')
        self.assertEqual(prediction, 1, "Prediction for transaction hash '0x123' should be 0")

        prediction = spam_detector.predict('0x789')
        self.assertEqual(prediction, 1, "Prediction for transaction hash '0x789' should be 0")

        prediction = spam_detector.predict('0x999')
        print("Accuracy is ",spam_detector.calc_accuracy())
        self.assertEqual(prediction, 0, "Prediction for non-existing transaction hash '0x999' should be 0")

    def test_predict_non_existing_transaction(self):
        spam_detector = Spam()
        prediction = spam_detector.predict('0x1254')
        self.assertEqual(prediction,0)

    def test_add_and_predict(self):
        spam_detector = Spam()
        spam_detector.add('0x9991', '0xnew_sender', '0xnew_receiver', 1)
        prediction = spam_detector.predict('0x999')
        self.assertEqual(prediction, 0)

    def tearDown(self):
        # Clean up by removing data.csv after each test
        if os.path.isfile('data.csv'):
            os.remove('data.csv')

if __name__ == '__main__':
    unittest.main()