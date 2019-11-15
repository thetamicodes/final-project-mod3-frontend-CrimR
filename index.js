document.addEventListener("DOMContentLoaded", () => {

  initMap();
  homePageReload();
  randomFacts();

  var map;

  function initMap() {
    var myLatlng = new google.maps.LatLng(51.509865, -0.118092);
    var myOptions = {
      zoom: 13,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: mapStyles //This variable is defined in mapStyle.js
    }

    map = new google.maps.Map(document.getElementById("map"), myOptions);
    google.maps.event.addListener(map, 'click', function(event) {
      const dataArray = [];
      dataArray.push(event.latLng);
      const latDetail = dataArray[0].lat();
      const lngDetail = dataArray[0].lng();
      fetchCrimeData(latDetail, lngDetail);
    });
  }

  function fetchCrimeData(latDetail, lngDetail) {
    return fetch(`https://data.police.uk/api/crimes-at-location?lat=${latDetail}&lng=${lngDetail}`)
      .then(function(response) {
        return response.json()
      })
      .then(function(crimes) {
        if (crimes.length === 0) {
        console.log("Hello")
        } else {
          crimeCounter(crimes)
          singleCrime(crimes)
        }
      })
  }

  function singleCrime(crimes) {
    for (const crime of crimes) {
      renderCrimes(crime)
    }
  }

  function crimeCounter(crimes) {
    const textArea = document.querySelector('.leftColumn');
    const crimeEl = document.createElement('p');
    const streetName = crimes[0].location ? crimes[0].location.street.name : "Location unverified."
    const properStreet = streetName.slice(0, 1).toLowerCase() + streetName.slice(1, streetName.length)
    crimeEl.innerText = `${crimes.length} crimes reported ${properStreet} in ${crimes[0].month}`;
    if (crimes.length === 0 || crimes.length > 1) {
      crimeEl.innerText = `${crimes.length} crimes reported ${properStreet} in ${crimes[0].month}`;
    } else {
      crimeEl.innerText = `${crimes.length} crime reported ${properStreet} in ${crimes[0].month}`;
    }

    textArea.innerHTML = `
    <h2>Crime Statistics</h2>
    <br>
    <form name="saveForm">
    <p>Description: <input type="text" name="description" placeholder="Add the description of this area, i.e. work place" size="40"></p>
    <button class="btn btn-primary" type="submit">Save this Place</button>
    </form>
    <br>`
    textArea.appendChild(crimeEl);

    const saveButton = document.querySelector('.btn');
    saveButton.addEventListener('click', (e) => {
      saveUserPlace(crimes, textArea);
    })
  }

  function renderCrimes(crime) {
    const resultEl = document.querySelector('.leftColumn');
    const resultDiv = document.createElement('div');
    resultDiv.classList.add('crime-div')
    const currentStatus = crime.outcome_status ? crime.outcome_status.category : "Status unknown"
    const crimeCategory = crime.category
    const splitCrime = crimeCategory.split("-")
    const capCrime = splitCrime.map(word => word.charAt(0).toUpperCase() + word.slice(1))
    const fixedCrime = capCrime.join(" ")

    resultDiv.innerHTML = `
    <li class="crime-list">${fixedCrime}</li>
    <p>Status: ${currentStatus}</p>
    `
    resultEl.append(resultDiv);
  }

  function saveUserPlace(crimes, textArea) {
    const areaInfo = crimes[0].location.street.name;
    const descInfo = textArea.querySelector("input[placeholder='Add the description of this area, i.e. work place']").value
    const latInfo = crimes[0].location.latitude
    const lngInfo = crimes[0].location.longitude

    const configObj = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        area: areaInfo,
        description: descInfo,
        latitude: latInfo,
        longitude: lngInfo,
        user_id: 6
      })
    }

    return fetch('http://localhost:3000/locations', configObj)
      .then(function(response) {
        return response.json()
      })
      .then(function(json) {
        location.reload()
      })
  }

  const userPlaces = document.querySelector(".places")
  userPlaces.addEventListener('click', () => {
    return fetch('http://localhost:3000/locations')
      .then(res => res.json())
      .then(function(locations) {
        if (locations.length === 0){
          showNoPlacesErrorPage()
        }else{
          const textDiv = document.querySelector('.leftColumn');
          textDiv.innerHTML = ""
          const title = document.createElement('h2')
          title.innerText = "My saved Places";
          textDiv.append(title)
          for (const location of locations) {
          showLocations(location)
        }
        }
      })
  })

  function showNoPlacesErrorPage(){
    const tweets = document.querySelector('iframe')
    const tweetsStatus = tweets ? tweets.remove() : tweets
    const info = document.querySelectorAll('p')
    const infoStatus = info ? info.forEach(el => el.remove()) : info
    const saveButton = document.querySelector('.btn')
    const buttonStatus = saveButton ? saveButton.remove() : saveButton
    const listItem = document.querySelectorAll('.crime-list')
    const listStatus = listItem ? listItem.forEach(el => el.remove()) : listItem
    const textDiv = document.querySelector('.leftColumn');
    const textUl = document.querySelector('.columnsContainer')
    const locDiv = document.createElement('div');
    textDiv.innerHTML =`<h4>Please click on the map and save a location!</h4>`
  }

  function showLocations(location) {
    const textDiv = document.querySelector('.leftColumn');
    const textUl = document.querySelector('.columnsContainer')
    const locationId = location.id
    const locDiv = document.createElement('div');
    locDiv.className = "locations-div";
    locDiv.innerHTML = `
    <br>
    <h3>${location.description}</h3>
    <h4 class="area-class">${location.area}</h4><button class="delete-btn-${locationId}" id="delete-btn">Delete Area</button>
    <br>
    `
    textDiv.appendChild(locDiv);

    locDiv.querySelector(".area-class").addEventListener('click', () => {
      showAreaStatistics(location)
    })
    const deleteButton = document.querySelector(`.delete-btn-${locationId}`);
    deleteButton.addEventListener('click', (e) => {
      deleteUserPlace(e, locationId);
    })
  }

  function showAreaStatistics(location) {
    const lat = location.latitude
    const long = location.longitude
    fetchCrimeData(lat, long)
    mapFunction(lat,long)
  }

  function mapFunction(lat,long) {
    var myLatlng = new google.maps.LatLng(lat, long);
    var myOptions = {
      zoom: 15,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: mapStyles //This variable is defined in mapStyle.js
    }

    map = new google.maps.Map(document.getElementById("map"), myOptions);
    var marker = new google.maps.Marker({
    draggable: false,
    position: myLatlng,
    map: map
    });

    google.maps.event.addListener(map, 'click', function(event) {
      const dataArray = [];
      dataArray.push(event.latLng);
      const latDetail = dataArray[0].lat();
      const lngDetail = dataArray[0].lng();
      fetchCrimeData(latDetail, lngDetail);
    });
  }

  function deleteUserPlace(e, locationId) {
    return fetch(`http://localhost:3000/locations/${locationId}`, {
        method: "DELETE"
      })
      .then(function(location) {
        e.target.parentNode.remove()
      })
  }

  function homePageReload() {
    const homeBtn = document.querySelector('.homepage');
    homeBtn.addEventListener('click', function() {
      location.reload();
    })
  }

  function randomFacts() {
    return fetch('https://data.police.uk/api/stops-street?lat=51.509865&lng=-0.118092&date=2019-09')
    .then(function(response) {
      return response.json()
    })
    .then(function(data) {
      if (Math.floor(Math.random() * Math.floor(2))){
        genderData(data)
      }else{
        ageData(data)
      }
    })
  }

  function genderData(data) {
    const genderArray = data.map(function(crime) {
      return crime.gender
    })
    const totalCount = genderArray.length
    let femaleCount = 0;
    let maleCount = 0;
    let restCount = 0;

    for (let i = 0; i < genderArray.length; i++) {
      if (genderArray[i] == "Female") {
        femaleCount++;
      } else if (genderArray[i] == "Male") {
        maleCount++;
      } else if (genderArray[i] == null) {
        restCount++;
        restCount;
      }
    }
    let femaleCountPerc = ((femaleCount / totalCount) * 100).toFixed(1) + ' %'
    let maleCountPerc = ((maleCount / totalCount) * 100).toFixed(1) + ' %'
    const footer = document.querySelector('footer');
    const factsEl = footer.querySelector('h6');
    factsEl.innerText = `Did you know: In September 2019, around ${maleCountPerc} of all crimes were committed by males (leaving around ${femaleCountPerc} committed by females, out of a total crimes of ${totalCount} within that month in London)`
  }

  function ageData(data){
    const ageRanges = data.map(function(crime) {
      return crime.age_range
    })
    const filteredAge = ageRanges.filter(age => age )
    const ageBracket = filteredAge.filter(age => !age.includes("over"))
    const ages = ageBracket.map(age => age.slice(-2))
    const agesIntegers = ages.map(Number)
    const underAgers = agesIntegers.filter(age => age  === 17)
    const amountOfUnderAgers = underAgers.length
    const amountOfCrimes = filteredAge.length
    const footer = document.querySelector('footer');
    const factsEl = footer.querySelector('h6');
    factsEl.innerText = `Did you know: Out of ${ageRanges.length} committed last month, only ${amountOfUnderAgers} were committed by people under the age of 18.`
    }

})
