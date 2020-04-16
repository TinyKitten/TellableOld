import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { AppRouter } from './Router';
import * as serviceWorker from './serviceWorker';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import SWUpdateDialog from './components/SWUpdateDialog';

require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIR_API_KEY,
  authDomain: process.env.REACT_APP_FIR_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIR_DATABASE_URL,
  projectId: process.env.REACT_APP_FIR_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIR_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIR_MESSAGE_SENDER_ID,
  appId: process.env.REACT_APP_FIR_APP_ID,
};

firebase.initializeApp(firebaseConfig);

ReactDOM.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register({
  onUpdate: (registration) => {
    if (registration.waiting) {
      ReactDOM.render(
        <SWUpdateDialog registration={registration} />,
        document.querySelector('.sw-update-dialog'),
      );
    }
  },
});
