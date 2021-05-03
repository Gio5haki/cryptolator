// API for handling transaction-related matters

const { db } = require('../util/admin');

// API Call to Get All Transactions
exports.getAllTransactions = (request, response) => {
  db.collection('transactions')
    .where('username', '==', request.user.username)
    .orderBy('date', 'desc')
    .get()
    .then((data) => {
      let transactions = [];
      data.forEach((doc) => {
        transactions.push({
          transactionId: doc.id,
          label: doc.data().label,
          date: doc.data().date,
          usd: doc.data().usd,
          coin: doc.data().coin,
          discount: doc.data().discount,
          trader: doc.data().trader,
          customer: doc.data().customer,
        });
      });
      return response.json(transactions);
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

// API Call to Post One Transaction
exports.postOneTransaction = (request, response) => {
  if (request.body.label.trim() === '') {
    return response.status(400).json({ label: 'Must not be empty' });
  }

  if (request.body.usd.trim() === '') {
    return response.status(400).json({ usd: 'Must not be empty' });
  }

  if (request.body.coin.trim() === '') {
    return response.status(400).json({ coin: 'Must not be empty' });
  }

  if (request.body.trader.trim() === '') {
    return response.status(400).json({ trader: 'Must not be empty' });
  }

  if (request.body.customer.trim() === '') {
    return response.status(400).json({ customer: 'Must not be empty' });
  }

  const newTransaction = {
    username: request.user.username,
    label: request.body.label,
    date: new Date().toISOString(),
    usd: request.body.usd,
    coin: request.body.coin,
    discount: (request.body.usd / request.body.coin - 1) * 100,
    trader: request.body.trader,
    customer: request.body.customer,
  };

  db.collection('transactions')
    .add(newTransaction)
    .then((doc) => {
      const responseTransaction = newTransaction;
      responseTransaction.id = doc.id;
      return response.json(responseTransaction);
    })
    .catch((err) => {
      response.status(500).json({ error: 'Something went wrong' });
      console.error(err);
    });
};

//API Call to Delete One Transaction
exports.deleteTransaction = (request, response) => {
  const document = db.doc(`/transactions/${request.params.transactionId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return response.status(404).json({ error: 'Transaction not found' });
      }

      if (doc.data().username !== request.user.username) {
        return response.status(403).json({ error: 'UnAuthorized' });
      }

      return document.delete();
    })
    .then(() => {
      response.json({ message: 'Delete successfull' });
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

//API Call to Edit One Transaction
exports.editTransaction = (request, response) => {
  if (request.body.transactionId || request.body.date) {
    response.status(403).json({ message: 'Not allowed to edit' });
  }
  let document = db
    .collection('transactions')
    .doc(`${request.params.transactionId}`);
  document
    .update(request.body)
    .then(() => {
      response.json({ message: 'Updated successfully' });
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({
        error: err.code,
      });
    });
};
