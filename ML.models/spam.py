import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
class Spam:
    def __init__(self):
        self.data = pd.read_csv('./ML.models/data.csv')
        self.label_encoder = LabelEncoder()
        self.data['sender'] = self.label_encoder.fit_transform(self.data['sender'].astype(str))
        self.data['receiver'] = self.label_encoder.fit_transform(self.data['receiver'].astype(str))
        self.X = self.data[['sender', 'receiver']]
        self.y = self.data['spam']
        self.random = RandomForestClassifier()
        model_path = './ML.models/spam_model.pkl'
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
        else:
            self.model = RandomForestClassifier() 
            self.model.fit(self.X, self.y)
            joblib.dump(self.model, model_path)
        self.model = joblib.load('./ML.models/spam_model.pkl')
        self.model.fit(self.X, self.y)

    def predict(self, transactionHash):
        transaction = self.data[self.data['transactionHash'] == transactionHash]
        if transaction.empty:
            return 0
        sender = transaction['sender'].values[0]
        receiver = transaction['receiver'].values[0]
        
        # Check if sender or receiver is a known spam user
        spam_users = self.data[self.data['spam'] == 1]['sender'].unique()
        
        if sender in spam_users or receiver in spam_users:
            return 1  # Either sender or receiver is a spam user, return spam
        
        prediction = self.model.predict(pd.DataFrame([[sender, receiver]], columns=['sender', 'receiver']))
        return prediction[0]

    def add(self, transactionHash, sender, receiver, spam):
        new_data = pd.DataFrame([[transactionHash, sender, receiver, spam]], columns=['transactionHash', 'sender', 'receiver', 'spam'])
        self.data = pd.concat([self.data, new_data], ignore_index=True)
        self.data['sender'] = self.label_encoder.fit_transform(self.data['sender'].astype(str))
        self.data['receiver'] = self.label_encoder.fit_transform(self.data['receiver'].astype(str))
        self.X = self.data[['sender', 'receiver']]
        self.y = self.data['spam']
        self.model.fit(self.X, self.y)
        self.save()

    def save(self):
        self.data.to_csv('data.csv', index=False)

    def load(self):
        self.data = pd.read_csv('./controllers/data.csv')
        self.data['sender'] = self.label_encoder.fit_transform(self.data['sender'].astype(str))
        self.data['receiver'] = self.label_encoder.fit_transform(self.data['receiver'].astype(str))
        self.X = self.data[['sender', 'receiver']]
        self.y = self.data['spam']
        self.model.fit(self.X, self.y)

    def reset(self):
        self.data = pd.DataFrame(columns=['transactionHash', 'sender', 'receiver', 'spam'])
        self.X = self.data[['sender', 'receiver']]
        self.y = self.data['spam']
        self.model.fit(self.X, self.y)
        return 'Data reset'

    def calc_accuracy(self):
        self.model = joblib.load('./controllers/spam_model.pkl')
        X_train, X_test, y_train, y_test = train_test_split(self.X, self.y, test_size=0.4)
        y_pred = self.model.predict(X_test)
        return accuracy_score(y_test, y_pred)

import sys
if len(sys.argv) > 1:
        arg = sys.argv[1]
        print(arg)
        detector = Spam()
        print(detector.predict(arg))
else:
    print("No command line argument provided")