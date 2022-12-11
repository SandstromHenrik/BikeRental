<template>

  <!-- Google Map container -->
  <div id="map"></div>

  <!-- Bike info popup window -->
  <bike-info :bike="bike" 
             :bikes="bikes"
             :user="user"
             :loading="loading"
             ref="bikeInfo"
             @setLoading="loading = true"
             @rentBike="$emit('rentBike', bike)"
             @returnBike="$emit('returnBike', bike)"></bike-info>

</template>

<style scoped>
  #map {
    width: 100%;
    height: calc(100% - 56px);
  }
</style>

<script>
  import BikeInfo from './BikeInfo.vue'
  import { Loader } from '@googlemaps/js-api-loader';  

  export default {
    name: 'Map',
    components: {
      BikeInfo
    },
    props: [
      'bike',
      'bikes',
      'user'
    ],
    data() {
      return {
        map: null,
        infoWindow: null,
        loading: false
      }
    },
    methods: {

      /*
       * Attempt to load Google Maps and initialize/add bike markers
       */
      loadMap() {
        new Loader(this.$const.MapConfig.loader)
          .load()
          .then((google) => {
            // Create map
            this.map = new google.maps.Map(document.getElementById('map'), this.$const.MapConfig.options);

            // Create info window/tooltip
            this.infoWindow = new google.maps.InfoWindow();

            // Add bike markers
            this.bikes.forEach(b => {
              // Add marker
              b.marker = new google.maps.Marker({
                title: b.name,
                position: {
                  lat: b.latitude,
                  lng: b.longitude
                },
                map: this.map,
                ...this.getBikeIcon(google, b.rented, this.user && b.rentedByUID === this.user.uid)                
              })

              // Bind click method to the bike obj 
              b.triggerClick = this.triggerMarkerClick.bind(null, google, b.marker)

              // Listen for marker clicks
              b.marker.addListener("click", () => {
                let pos = b.marker.position
                this.$emit('setBike', this.bikes.find(m => m.latitude === pos.lat() && m.longitude === pos.lng()))
                this.infoWindow.setContent(this.$refs.bikeInfo.$el)
                this.infoWindow.open(this.map, b.marker);
              });
            })

            // Close info window when clicking outside
            google.maps.event.addListener(this.map, "click", () => {
              this.infoWindow.close()
            });
          })
      },

      /*
       * Returns a marker icon & label based on rental status
       */
      getBikeIcon(google, rented, rentedByMe) {
        let colors = this.$const.MarkerColors

        return {
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: rented ? (rentedByMe ? colors.RentedByCurrentUser : colors.Rented) : colors.Available,
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 15
          },
          label: {
            fontFamily: "FontAwesome",
            fontWeight: '900',
            text: "\uf206",
            color: 'white'
          }
        }
      },

      /*
       * Triggers a click of a given marker on the map
       */
      triggerMarkerClick(google, marker) {
        new google.maps.event.trigger(marker, 'click')
      }

    },
    mounted() {
      // Load map
      this.loadMap()
    },
    watch: {

      /*
       * Close bike info window upon renting/returning
       */
      bike(bike) {
        if (!bike.id) {
          this.loading = false
          this.infoWindow.close()
        }
      }

    }
  }
</script>
