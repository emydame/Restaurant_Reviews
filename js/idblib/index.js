

idb.open("restaurantdb",1, upgradeDB =>{
    let keyvaluStore= upgradeDB.createObjectStore('keyval');
});