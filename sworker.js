/**
 * serviceworker.js for restaurant review 
 */

const restCACHE = "restaurant-cache-v1";
const urlsToCache = [
  '/',  // include the root
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
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js' 

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
    return self.clients.claim();
  });

  

  self.addEventListener('fetch', function(event) {
    event.respondWith(
      
      caches.match(event.request).then(function(resp) {
        return resp || fetch(event.request).then(function(response) {
          let responseClone = response.clone();
          caches.open(restCACHE).then(function(cache) {
            responseClone['Cache-Control']  = 'public, max-age=315360000';
            cache.put(event.request, responseClone);
          });
          
          return response;
        });
      })
    );
  });