let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []




/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added 
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    option.tabIndex="0";
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  let dbt= DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
    console.log(dbt);
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
    

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
   
    option.tabIndex="0";    
   
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false,
        alt:"map Image"
      });
      
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoiZW1teWRhbWUiLCJhIjoiY2psMTBoejVjMTZtazNwbTZncnRoeWt4aCJ9.VzhZqdTlh6mtGbQUCy0iQw',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,tabindex="-1" ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets',
    alt:''
  }).addTo(newMap);
  
  

  updateRestaurants();
}
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  
  const li = document.createElement('li');
  li.setAttribute("role","treeitem");
  li.setAttribute("aria-expanded","true");
  const picture = document.createElement('picture');
  const image = document.createElement('img');
  const source = document.createElement('source');
  image.className = 'restaurant-img';
  image.class='lazy';
  image.alt= restaurant.name + ' Restaurant';
  image.src=DBHelper.imageUrlForRestaurant(restaurant);
  let imgpath = DBHelper.imageUrlForRestaurant(restaurant).split('/');
  let msrc=imgpath[3].charAt(0);
 image.srcset='/images/'+msrc+'-50pc_large.jpg 900w';
  
  li.appendChild(image);
 
  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const favoritetext = document.createElement('p');
  const favoritelabel = document.createElement('label');
  const favorite = document.createElement('input');
  //const pair = ["Yes","No"];
 favorite.type = "button";    
  favorite.id = 'restfav'+restaurant.id;  
  favorite.name = restaurant.id;    
  favorite.value = "check";       
  favorite.onclick= saveStateinServer(restaurant.id);
 //favoritetext.innerHTML='Is favorite?';
  favoritelabel.innerHTML='Is favorite?';
  
  DBHelper.checkifRestaurantisFav(restaurant.id, (error, isFav) => {
    if (isFav  === undefined || isFav.length == 0) {
      console.log('No favorite found');
      favorite.checked=false;
      favorite.value="NO"
    }else{
      favorite.checked=true;
      favorite.value="YES"
    }
  })
  favoritelabel.setAttribute("for",favorite.id);
  
  favoritetext.appendChild(favoritelabel);
  favoritetext.appendChild(favorite);

 li.append(favoritetext);


  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

 
  return li
}

/**
 * update favourite state for a restaurant
 */
saveStateinServer = (restaurantid) =>{
  let state;
  let checkbox = document.querySelectorAll(".checkbox")
  //let favCheckbox=document.getElementById(restaurantid);
  if (checkbox.checked) {
   state= true;
    } else {
      state= false;
    }
    let checkedState=Boolean(state);
    DBHelper.sendFavoritetoserver(restaurantid,checkedState => {     
    });

  }
/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.alt=restaurant.name;
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
    
  });

} 
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */

