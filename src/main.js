import { createApp } from 'vue'
import App from './App.vue'

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import constants from './helpers/constants'

import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";

// Initialize Firebase
initializeApp(constants.FirebaseConfig);

// Create app
const app = createApp(App)

// Add constants and authentication as global properties
app.config.globalProperties.$const = constants
app.config.globalProperties.$auth = getAuth()

app.mount("#app")