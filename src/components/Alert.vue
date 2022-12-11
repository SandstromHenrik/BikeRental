<template>

  <div class="alert-container">
    <div v-if="show"
         v-html="message"
         class="alert alert-success"
         role="alert">
    </div>
  </div>  

</template>

<style scoped>
  .alert-container {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 0;
    width: 100%;
  }
</style>

<script>
  export default {
    name: 'Alert',
    props: [
      'message'
    ],
    data() {
      return {
        show: false
      }
    },
    watch: {

      /*
       * Displays a given alert message for a short period of time
       */
      message() {
        let v = this
        v.show = true

        setTimeout(function () {
          v.show = false
        }, 5000)
      }

    }
  }
</script>