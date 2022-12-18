<template>

  <!-- App header -->
  <nav class="navbar navbar-expand-sm bg-light">
    <div class="container">

      <!-- Brand/logo -->
      <div class="navbar-brand fw-bold">
        <i class="fa-solid fa-bicycle text-success"></i>
        Lund Bike Rental
      </div>

      <!-- User rental info -->
      <span v-if="isUserRenting">
        Renting bike
        <a @click="clickRentedBike" title="Show bike" class="text-success" href="#">{{ rentedBike.name }}</a> - {{ formattedTime }}
      </span>

      <!-- User authentication info -->
      <button v-if="!user" @click="signIn" type="button" class="btn btn-success">
        <i class="fa-brands fa-google me-2"></i>
        Sign in
      </button>
      <div v-else class="fw-bold">
        <i class="fa-solid fa-user text-success me-1"></i>
        {{ user.displayName }}
        |
        <a @click="signOut" class="text-success" href="#">
          Sign out
        </a>
      </div>

    </div>
  </nav>

  <!-- Interactive map -->
  <InteractiveMap v-if="bikes.length"
                  :user="user"
                  :bike="bike"
                  :bikes="bikes"
                  @setBike="setBike"
                  @rentBike="rentBike"
                  @returnBike="returnBike"></InteractiveMap>

  <!-- Map loading indicator -->
  <div v-else class="loading text-success">
    Loading map <i class="fas fa-tire-rugged fa-spin ms-2 text-dark"></i>
  </div>

  <!-- App alerts -->
  <alert :message="message"></alert>

</template>

<style>
  html, body {
    height: 100vh;
    width: 100vw;
    margin: 0;
    overflow: hidden;
  }

  #app {
    height: 100%;
  }

  .gm-ui-hover-effect {
    display: none !important;
  }

  .gm-style-iw-a div:not(.container) {
    padding: 0 !important;
  }

  .gm-style-iw-d {
    overflow: hidden !important;
  }
</style>

<style scoped>
  .navbar {
    box-shadow: rgb(0 0 0 / 20%) 0px 1px 2px;
    z-index: 1;
  }

  a {
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }

  .loading {
    display: flex;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
</style>

<script>
  import InteractiveMap from './components/Map.vue'
  import Alert from './components/Alert.vue'
  import API from './api/FirebaseAPI'

  import {
    GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
  } from 'firebase/auth'

  export default {
    name: 'App',
    components: {
      InteractiveMap,
      Alert
    },
    data() {
      return {
        user: null,
        bike: {},
        bikes: [],
        message: '',
        currentDate: new Date(),
        timerInterval: null
      }
    },
    computed: {

      /*
       * Checks if the current user has an active rental or not
       */
      isUserRenting() {
        return this.user && this.bikes.some(b => b.rented && b.rentedByUID === this.user.uid)
      },

      /*
       * Returns the users currently rented bike (if any)
       */
      rentedBike() {
        return this.isUserRenting ? this.bikes.find(b => b.rented && b.rentedByUID === this.user.uid) : {}
      },

      /*
       * Returns the total rental time in the format hh:mm:ss
       */
      formattedTime() {
        let rentStartDate = new Date(this.rentedBike.rentStartDate._seconds * 1000)
        let secondsPassed = Math.round((this.currentDate - rentStartDate) / 1000)
        secondsPassed = secondsPassed < 0 ? 0 : secondsPassed

        let hours = Math.floor(secondsPassed / 3600)
        let minutes = Math.floor(secondsPassed / 60) - (hours * 60)
        let seconds = secondsPassed - (hours * 3600) - (minutes * 60)

        return `${hours >= 10 ? hours : '0' + hours}:${minutes >= 10 ? minutes : '0' + minutes}:${seconds >= 10 ? seconds : '0' + seconds}`
      }

    },
    methods: {

      /*
       * Opens a Google oAuth 2.0 window
       */
      signIn() {
        signInWithPopup(this.$auth, new GoogleAuthProvider())
      },

      /*
       * Signs out the currently logged in user
       */
      signOut() {
        signOut(this.$auth)
      },

      /*
       * Updates the currently visible bike
       */
      setBike(bike) {
        this.bike = bike
      },

      /*
       * Attempts to rent a given bike
       */
      rentBike(bike) {
        API.rentBike(bike.id).then(result => {
          if (result) {
            // Update bike status and color
            let index = this.bikes.findIndex(b => b.id === bike.id)
            this.bikes[index] = {
              ...this.bikes[index],
              rented: true,
              rentedByUID: this.user.uid,
              rentStartDate: { _seconds: (new Date() / 1000) }
            }
            this.updateMarkerColor(this.$const.MarkerColors.RentedByCurrentUser, index)
            this.bike = {}
            this.message = this.$const.StatusMessages.RentSucceeded
          } else {
            this.message = this.$const.StatusMessages.Error
          }
        })
      },

      /*
       * Attempts to return a given bike
       */
      returnBike(bike) {
        API.returnBike(bike.id).then(result => {
          if (result) {
            // Update bike status and color
            let index = this.bikes.findIndex(b => b.id === bike.id)
            this.bikes[index] = { ...this.bikes[index], rented: false, rentedByUID: null }
            this.updateMarkerColor(this.$const.MarkerColors.Available, index)
            this.bike = {}

            this.message = this.$const.StatusMessages.ReturnSucceeded
          } else {
            this.message = this.$const.StatusMessages.Error
          }
        })
      },

      /*
       * Applies a given color on a given marker (by index)
       */
      updateMarkerColor(color, index) {        
        index = index >= 0 ? index : this.bikes.findIndex(b => b.rentedByUID === this.user.uid)

        if (index >= 0) {
          this.bikes[index].marker.setIcon({
            ...this.bikes[index].marker.icon,
            fillColor: color
          })
        }
      },

      /*
       * Triggers a click event on the bike rented by the current user
       */
      clickRentedBike() {
        this.rentedBike.triggerClick()
      }

    },
    mounted() {

      // Listen for login/logout and update the user + map accordingly
      onAuthStateChanged(this.$auth, async (user) => {
        if (user) {
          // Set session variable/header for all API-calls
          API.setHeader(await user.getIdToken())

          this.user = user
          this.updateMarkerColor(this.$const.MarkerColors.RentedByCurrentUser)
        } else {
          this.updateMarkerColor(this.$const.MarkerColors.Rented)
          this.user = null
        }
      })

      // Get all bikes
      API.getBikes().then(bikes => {
        this.bikes = bikes
      })

    },
    watch: {

      /*
       * Start rental timer upon renting a bike
       */
      isUserRenting(isRenting) {
        if (isRenting) {
          this.timerInterval = setInterval(() => {
            this.currentDate = new Date()
          }, 1000)
        } else {
          clearInterval(this.timerInterval)
        }
      }

    }
  }
</script>