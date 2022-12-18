const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const app = express();
const admin = require('firebase-admin');

// Initialize admin rights
let firebase
if (['true', true].includes(process.env.FUNCTIONS_EMULATOR)) {
  const serviceAccount = require('./firebase-adminsdk-h9ygo.json');
  firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
} else {
  firebase = admin.initializeApp();
}

// Init firestore
var db = admin.firestore();

// Enable cors
app.use(cors({ origin: true }));

/*
 * Retrieves and return all bikes
 */
app.get('/bikes', async (req, res) => {
  db.collection('bikes').get().then(snapshot => {
    res.send(snapshot.docs.map(b => b.data()))
  }) 
});

/*
 * Attempts to rent a given bike for the active user
 */
app.post('/rent', async (req, res) => {

  let userId = await getUserId(req)
  let bikeId = req.body.bikeId + ''

  if (userId && !await isUserRenting(userId)) {
    getBikeInfo(bikeId).then(bike => {     
      if (!bike.rented) {
        db.collection('bikes').doc(bikeId)
          .update({ rented: true, rentedByUID: userId, rentStartDate: new Date() })
          .then(() => {
            res.send(true)
          }).catch(() => {
            res.send(false)
          })
      } else {
        res.send(false)
      }
    })    
  } else {
    res.send(false)
  }

});

/*
 * Attempts to return a given bike for the active user
 */
app.post('/return', async (req, res) => {

  let userId = await getUserId(req)
  let bikeId = req.body.bikeId + ''

  if (userId) {
    getBikeInfo(bikeId).then(bike => {
      if (bike.rented && bike.rentedByUID === userId) {
        db.collection('bikes').doc(bikeId)
          .update({ rented: false, rentedByUID: null })
          .then(() => {
            res.send(true)
          }).catch(() => {
            res.send(false)
          })
      } else {
        res.send(false)
      }
    })    
  } else {
    res.send(false)
  }

});

/*
 * Validates the user session and returns the user id
 */
function getUserId(req) {
  return new Promise((res) => {
    firebase.auth(firebase)
      .verifyIdToken(req.headers.authorization)
      .then((decodedToken) => {
        res(decodedToken.uid)
      })
      .catch(() => {
        res(false)
      });
  })  
}

/*
 * Returns a bike obj for a given bike id
 */
function getBikeInfo(bikeId) {
  return new Promise((res) => {
    db.collection('bikes').doc(bikeId).get().then(bike => res(bike.data()))
  })
}

/*
 * Checks if a given user is renting any bike
 */
function isUserRenting(userId) {
  return new Promise((res) => {
    db.collection('bikes')
      .where('rented', '==', true)
      .where('rentedByUID', '==', userId)
      .get().then(snapshot => res(snapshot.docs.length > 0))
  })
}

exports.app = functions.https.onRequest(app);