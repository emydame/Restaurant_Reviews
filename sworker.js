/**
 * serviceworker.js for restaurant review 
 */

const restCACHE = "restaurant-cache-v1";
const urlsToCache = [
  '/',  // include the root
  '/index.html',
  '/restaurant.html',
   '../css/styles.css',
  '../data/restaurants.json',
  '../js/dbhelper.js',
  '../js/main.js',
  '../js/restaurant_info.js',
  '../img/1.jpg',
  '../img/2.jpg',
  '../img/3.jpg',
  '../img/4.jpg',
  '../img/5.jpg',
  '../img/6.jpg',
  '../img/7.jpg',
  '../img/8.jpg',
  '../img/9.jpg',
  '../img/10.jpg',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css'
];

self.addEventListener('install', function(event) {
    // Perform install steps
    event.waitUntil(
      caches.open(restCACHE)
        .then(function(cache) {
          console.log('Opened cache');
          return cache.addAll(urlsToCache);
        }).then(function() {
          console.log('WORKER: install completed');
        }).catch(error => {
          console.log('Error', error);
        })
    );
  });