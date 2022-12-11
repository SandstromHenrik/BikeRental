<template>
  <div>

    <!-- Window title -->
    <h2 class="p-2 m-0">
      <i class="fa-solid fa-bicycle text-primary me-1"></i>
      Bike "{{ bike.name }}"
    </h2>
    <hr class="p-0 m-0" />

    <!-- Window body -->
    <div class="container py-3 px-2">

      <!-- Bike rental status -->
      <template v-if="!bike.rented">
        <span v-if="!isUserRenting" class="text-success">
          This bike is available for rent
        </span>
        <span v-else class="text-danger">
          You can only rent one bike at a time
        </span>        
      </template>
      <span v-else class="text-danger">
        <span v-if="isUserRenting && bike.rentedByUID === user.uid" class="text-danger">
          You're currently renting this bike          
        </span>
        <span v-else class="text-danger">
          This bike is already rented by another user
        </span>        
      </span>

      <div v-if="user">

        <!-- Rental instructions -->
        <ul v-if="!bike.rented && !isUserRenting" class="mt-2 mb-0">
          <li>Click on "Rent Bicycle"</li>
          <li>Bicycle lock will unlock automatically</li>
          <li>Adjust saddle height</li>
        </ul>

        <!-- Rent/return button -->
        <div class="mt-3">
          <button v-if="!bike.rented && !isUserRenting" @click="rentBike" type="button" class="btn btn-primary">
            <i v-if="loading" class="fas fa-tire-rugged fa-spin me-1"></i>
            <i v-else class="fa-solid fa-lock-open me-1"></i>
            Rent Bicycle
          </button>
          <button v-else-if="bike.rentedByUID === user.uid" @click="returnBike" type="button" class="btn btn-primary">
            <i v-if="loading" class="fas fa-tire-rugged fa-spin me-1"></i>
            <i v-else class="fa-solid fa-lock me-1"></i>
            Return Bicycle
          </button>
        </div>    
        
      </div>
      <div v-else class="mt-2">
        You must be signed in to rent bikes
      </div>
    </div>

  </div>  
</template>

<style scoped>
  h2 {
    font-size: 20px;
  }
  ul {
    list-style: decimal;
  }
</style>

<script>
  export default {
    name: 'BikeInfo',
    props: [
      'bike',
      'bikes',
      'user',
      'loading'
    ],
    computed: {

      /*
       * Checks if the current user has an active rental
       */
      isUserRenting() {
        return this.user && this.bikes.some(b => b.rented && b.rentedByUID === this.user.uid)
      }

    },
    methods: {

      /*
       * Attempts to rent the current bike
       */
      rentBike() {
        this.$emit('setLoading')
        this.$emit('rentBike')
      },

      /*
       * Attempts to return the current bike
       */
      returnBike() {
        this.$emit('setLoading')
        this.$emit('returnBike')
      }

    }
  }
</script>