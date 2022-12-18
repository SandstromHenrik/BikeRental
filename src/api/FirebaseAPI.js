import axios from 'axios'
import constants from '../helpers/constants'

/*if (process.env.NODE_ENV === 'development')
  axios.defaults.baseURL = constants.Environments.dev
else*/
  axios.defaults.baseURL = constants.Environments.prod

export default {

  /* START OF BASE METHODS */

  setHeader(token) {
    axios.defaults.headers.common['Authorization'] = token
  },
  get(resource, params) {
    return axios.get(resource, { params: params })
  },
  post(resource, data, config = {}) {
    return axios.post(resource, data, config)
  },
  put(resource, data) {
    return axios.put(resource, data)
  },
  delete(resource, data) {
    return axios.delete(resource, data)
  },

  /* END OF BASE METHODS */

  /* START OF API CALLS */

  /*
   * Returns all bikes
   */
  async getBikes() {
    return this.get('bikes').then(resp => resp.data);
  },

  /*
   * Attempts to rent a give bike
   */
  async rentBike(bikeId) {
    return this.post('rent', { bikeId: bikeId }).then(resp => resp.data)
  },

  /*
   * Attempts to return a give bike
   */
  async returnBike(bikeId) {
    return this.post('return', { bikeId: bikeId }).then(resp => resp.data)
  }

  /* END OF API CALLS */


}
