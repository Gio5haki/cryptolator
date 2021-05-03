const functions = require('firebase-functions');
const app = require('express')();
const auth = require('./util/auth');

const {
  getAllTransactions,
  postOneTransaction,
  deleteTransaction,
  editTransaction,
} = require('./APIs/transactions');

const {
  loginUser,
  signUpUser,
  uploadProfilePhoto,
  getUserDetail,
  updateUserDetails,
} = require('./APIs/users');

// Transactions
app.get('/transactions', auth, getAllTransactions);
app.post('/transaction', auth, postOneTransaction);
app.delete('/transaction/:transactionId', auth, deleteTransaction);
app.put('/transaction/:transactionId', auth, editTransaction);

// Users
app.post('/login', loginUser);
app.post('/signup', signUpUser);
app.post('/user/image', auth, uploadProfilePhoto);
app.get('/user', auth, getUserDetail);
app.post('/user', auth, updateUserDetails);

exports.api = functions.https.onRequest(app);
