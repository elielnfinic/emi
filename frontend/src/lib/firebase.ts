import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyC0XBk6I2bF7J6e2tuAeDpg6zWArogXq5I',
  authDomain: 'emi-app-fa6cd.firebaseapp.com',
  projectId: 'emi-app-fa6cd',
  storageBucket: 'emi-app-fa6cd.firebasestorage.app',
  messagingSenderId: '101059947860',
  appId: '1:101059947860:web:dd9fb952ae895e6bfcacc1',
  measurementId: 'G-EDBSG9J31E',
}

export const app = initializeApp(firebaseConfig)
export const analytics = getAnalytics(app)
