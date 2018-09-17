/**
 * sworker.js for restaurant review 
 * Implementation of service worker was guided from udacity instructor video
 * cache-age values obtained from "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control"
 */



const idPromise=null;
const restCACHE = "restaurant-cache-v1";
const urlsToCache = [
  '/',  // include the root

  /* Caching static assets */
  '/index.html',
  '/manifest.json',
  '/restaurant.html',
   '../css/styles.css',
  '../data/restaurants.json',
  '../js/dbhelper.js',
  '../js/main.js',
  '../js/restaurant_info.js',
  /* Caching map assets */
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/leaflet.js' 

];

self.addEventListener('install', function(event) {
   
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

   /* check if existing cache contains the newly created cache. If
   it does, delete old cache, activate and give control to it */

  self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
           
            return cacheName.startsWith('restaurant-')&&
            cacheName !=restCACHE;

          }).map(function(cacheName) {
            return cache.delete(cacheName);
          })
        );
      })
    );  
    fetchRestaurants();
    return self.clients.claim();
  });

  function fetchRestaurants()
  {
    
  }

  self.addEventListener('fetch', function(event) {
    event.respondWith(
      
      caches.match(event.request).then(resp => {
        return resp || fetch(event.request).then(response => {
          let responseClone = response.clone();
          caches.open(restCACHE).then(cache => {
            responseClone['Cache-Control']  = 'public, max-age=31536000';
            cache.put(event.request, responseClone);
          });
          
          return response;
        });
      })
    );
  });