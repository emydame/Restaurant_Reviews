let restaurant;
var newMap;
var id="";

 /**
   * 
Create temp Index db
   */
   createTempIDB= (data) =>{
    const dbPromise =idb.open('tempreview-store', 1, upgradeDB => {
      upgradeDB.createObjectStore('data',{
        keyPath:'restaurant_id'
      });
     
    });
    return dbPromise;
  }

/**
 * Create restaurant Reviews and add it to the webpage
 */
  fillReview = () => {
  let reviewtxt = document.getElementById('reviewtext').value.replace(/^\s*|\s*$/g,'');;
  let reviewer = document.getElementById('reviewerName').value;
  
 
 
  let data = {
    "restaurant_id": '1',
    "name": reviewer,
    "rating": "1",
    "comments": reviewtxt
}
sendReviewtoserver(data);
  
}

sendReviewtoserver=(data)=>{
  const url = 'http://localhost:1337/reviews/';
  fetch(url, {
    method: 'POST', // or 'PUT'
    body: JSON.stringify(data), // data can be `string` or {object}!
    headers:{
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
  .then(response => console.log('Success:', JSON.stringify(response)))
  .catch(error => {
  createTempIDB(data).then(dbPromise =>{
    if(!dbPromise)return;
      let tx = dbPromise.transaction('data', 'readwrite');
      tx.objectStore('data').put(data);
      return tx.complete;
    
  }) //save in review db
  console.error('error:', error)
}

);
}

handleConnectionChange = (event) => {
  
  // Get Data from indexedDB 

  idb.open('tempreview-store', 1).then(dbPromise => {
    let db= dbPromise.transaction('data')
        .objectStore('data');
       db.getAll().then(tempdata => {
         sendReviewtoserver(tempdata);
         tempdata.forEach(element => {
          let tx = dbPromise.transaction('data', 'readwrite');
                tx.objectStore('data').delete(element.restaurant_id);
            return tx.complete;
          })
       });
  })
}


/**
 * Create reviews box
 */
// Get the modal
const modal = document.getElementById('myModal');
const reviewBtn = document.getElementById('reviewBtn');
reviewBtn.onclick=() =>{
  modal.style.display = "table";
 
}
//get submit
const subreviewBtn = document.getElementById('submitRev');
subreviewBtn.onclick=() =>{ fillReview();}
// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];
span.onclick = ()=> {  
  modal.style.display = "none";
}



/**
 * Initialize map as soon as the page is loaded.
 */

document.addEventListener('DOMContentLoaded', (event) => { 
  handleConnectionChange(); 
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false,
        alt:"mapImage"
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiZW1teWRhbWUiLCJhIjoiY2psMTBoejVjMTZtazNwbTZncnRoeWt4aCJ9.VzhZqdTlh6mtGbQUCy0iQw',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets',
        alt:'map title'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 
/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
   id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt=restaurant.name + ' Restaurant';
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  image.srcset='/images/'+msrc+'-50pc_large.jpg 900w';
  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
