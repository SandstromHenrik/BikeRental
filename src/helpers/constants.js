/*
 * Global constants
 */

export default Object.freeze({

  FirebaseConfig: {
    apiKey: "AIzaSyC3RCtaqnSmG7dAIyTGD6XoaNdCXueuSxQ",
    authDomain: "bike-rental-a164e.firebaseapp.com",
    projectId: "bike-rental-a164e",
    storageBucket: "bike-rental-a164e.appspot.com",
    messagingSenderId: "286464775857",
    appId: "1:286464775857:web:d749ba04970ec83217b490",
    measurementId: "G-D8X2RQD0CH"
  },

  Environments: {
    dev: 'http://localhost:5001/bike-rental-a164e/us-central1/app',
    prod: 'https://us-central1-bike-rental-a164e.cloudfunctions.net/app'
  },

  MapConfig: {
    loader: {
      apiKey: "AIzaSyC3RCtaqnSmG7dAIyTGD6XoaNdCXueuSxQ",
      version: "weekly"
    },
    options: {
      center: {
        lat: 55.7036443,
        lng: 13.1971374
      },
      zoom: 15,
      styles: [
        {
          "featureType": "poi",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        }
      ]
    },
    bikeIcon: "http://maps.google.com/mapfiles/kml/shapes/cycling.png"
  },

  StatusMessages: {
    RentSucceeded: '<i class="fa-solid fa-circle-check me-2"></i> Bike successfully rented!',
    ReturnSucceeded: '<i class="fa-solid fa-circle-check me-2"></i> Bike successfully returned!',
    Error: '<i class="fa-solid fa-circle-xmark me-2"></i> An error occurred. Please refresh the page and then try again.'
  },

  MarkerColors: {
    Available: '#09af0e',
    Rented: '#af0909',
    RentedByCurrentUser: '#f1c232'
  }

})