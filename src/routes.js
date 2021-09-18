const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const express = require('express');
const middlewares = require('./middlewares');
const index = require('./index');
const router = express.Router();
const cache = require('memory-cache');
let memoryCache;

// Empty route
router.get('/', [
  middlewares.corsMiddleware,
  middlewares.getRouteApiLimiter,  
  middlewares.loggingMiddleware], (req, res) => {
    res.status(200).send({
      message: `You have reached ${index.NAME}v${index.VERSION}.`
    });
  }
);

// Search route
router.get('/search', [
  middlewares.corsMiddleware,  
  middlewares.loggingMiddleware,
  middlewares.searchParamMiddleware], (req, res) => {

    getMemoryCacheSingleton();
    const searchString = req.query.searchString;

    // Is cache empty?
    if(memoryCache.size() < 1){
      console.log("memoryCache is empty. Request requires call to external APIs.");
      callInventoryApis(searchString, res);
    }else{
      let matchingEntriesInCache = [];
      for(let key of memoryCache.keys()){ 
        if(key.toLowerCase().includes(searchString.toLowerCase())){
          matchingEntriesInCache.push(memoryCache.get(key));
        }
      }  

      if(matchingEntriesInCache.length < 1){
        callInventoryApis(searchString, res);
      }else{
        res.status(200).send({results: matchingEntriesInCache});
        console.log("Cached records were found for provided search query, no external API calls performed!");
      }  
    }
  }
);

/**
 * A singleton for getting the memory-cache.
 */
function getMemoryCacheSingleton(){
  if(memoryCache == undefined){
    memoryCache = new cache.Cache();
    console.log("memoryCache initialized");
  }  
}

function callInventoryApis(searchString, res){

  const inventoryApis = 
  ["https://api.jsonbin.io/b/5e2b66793d75894195de548e", 
    "https://api.jsonbin.io/b/5e2b666350a7fe418c533306", 
    "https://api.jsonbin.io/b/5e2b68903d75894195de55c4"];

  let numberOfRespondantApis = 0;
  let objectsInApiResponses = [];
  for (let i = 0; i < inventoryApis.length; i++){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        const apiResponse = JSON.parse(xhttp.responseText);
        numberOfRespondantApis++;
        for(const element of apiResponse){
          objectsInApiResponses.push(element);
        }

        if(numberOfRespondantApis == inventoryApis.length){
          res.status(200).send({
            results: objectsInApiResponses.filter((element) => {
              return element.name.toLowerCase().includes(searchString.toLowerCase());
            })
          });

          // Update cache with new data.
          memoryCache.clear();
          console.log("Cache cleared");

          for(const element of objectsInApiResponses){
            memoryCache.put(element.name, element);
          }
          console.log("Cache populated with: " + memoryCache.size() + " records");
        }
      }
    };
    xhttp.open('GET', (inventoryApis[i]), true);
    console.log(`The following external API was called: ${inventoryApis[i]}`);
    xhttp.send();
  }
}

module.exports = router;
