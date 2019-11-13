document.addEventListener("DOMContentLoaded", () => {
  initMap()
  var map;

  function initMap() {
    var myLatlng = new google.maps.LatLng(51.509865, -0.118092);

    var myOptions = {
      zoom: 13,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [{
          elementType: 'geometry',
          stylers: [{
            color: '#242f3e'
          }]
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [{
            color: '#242f3e'
          }]
        },
        {
          elementType: 'labels.text.fill',
          stylers: [{
            color: '#746855'
          }]
        },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{
            color: '#d59563'
          }]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{
            color: '#d59563'
          }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{
            color: '#263c3f'
          }]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{
            color: '#6b9a76'
          }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{
            color: '#38414e'
          }]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{
            color: '#212a37'
          }]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{
            color: '#9ca5b3'
          }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{
            color: '#746855'
          }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{
            color: '#1f2835'
          }]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{
            color: '#f3d19c'
          }]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{
            color: '#2f3948'
          }]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{
            color: '#d59563'
          }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{
            color: '#17263c'
          }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{
            color: '#515c6d'
          }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{
            color: '#17263c'
          }]
        }
      ]
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
      return fetch(`https://data.police.uk/api/crimes-at-location?&lat=${latDetail}&lng=${lngDetail}`)
        .then(function(response) {
          return response.json()
        })
        .then(function(crimes) {
          crimeCounter(crimes)
          singleCrime(crimes)
        })
    }

    function singleCrime(crimes) {
      for (let i = 0; i < crimes.length; i++) {
        renderCrimes(crimes[i])
      }
    }

    function crimeCounter(crimes) {
      const textArea = document.querySelector('.leftColumn');
      const crimeEl = document.createElement('p');
      const streetName = crimes[0].location.street.name
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
      <input class="btn btn-primary" type="submit" value="Save this Place">
      </form>
      <br>
      `;
      textArea.appendChild(crimeEl);

      const saveButton = document.querySelector('.btn');
      saveButton.addEventListener('click', (e)=>{
        saveUserPlace(crimes, textArea);
      })
    }

    function renderCrimes(crime) {
      const resultEl = document.querySelector('.leftColumn');
      const resultDiv = document.createElement('div');
      resultDiv.classList.add('crime-div')
      const currentStatus = crime ? crime.outcome_status.category : "Status unknown"
      const crimeCategory = crime.category
      const splitCrime = crimeCategory.split("-")
      const capCrime = splitCrime.map(word => word.charAt(0).toUpperCase() + word.slice(1))
      const fixedCrime = capCrime.join(" ")
      resultDiv.innerHTML = `
        <li>${fixedCrime}</li>
        <p>Status: ${currentStatus}</p>
        `
      resultEl.append(resultDiv);
    }

    function saveUserPlace(crimes, textArea) {
      const areaInfo = crimes[0].location.street.name;
      const descInfo = textArea.querySelector("input[placeholder='Add the description of this area, i.e. work place']").value
      const latInfo = crimes[0].location.latitude
      const lngInfo = crimes[0].location.longitude
      // const user_id = null

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
          userId: 6
        })
      }

      return fetch('http://localhost:3000/locations', configObj)
      .then(function(response) {
        return response.json()
      })
      .then(function(json) {
        return json
      })
    }



  const userPlaces = document.querySelector(".places")
  userPlaces.addEventListener('click', () => {
    document.querySelector('p').remove();
    document.querySelector('iframe').remove();      
    return fetch('http://localhost:3000/locations')
      .then(res => res.json())
      .then(function(locations){
        for (let i = 0; i < locations.length; i++) {
          showLocations(locations[i])
        }
      }) 
  })

  function showLocations(location) {
    const textDiv = document.querySelector('.leftColumn');
    // textDiv.innerHTML = `<h2>My saved Places</h2>`
  
    const locDiv = document.createElement('div');
    locDiv.className = "locations-div";
    locDiv.innerHTML = `
    <h3>${location.description}</h3>
    <h4 class="area-class">${location.area}</h4>
    `
    textDiv.appendChild(locDiv);

    document.querySelector('h2').innerText = "My saved Places";

    const latData = location.latitude;
    const lngData = location.longitude;

  }

  

  // function showLocations(location) {
  //   const area = location.area
  //   const areaType = location.description
  //   const latDetail = location.latitude
  //   const lngDetail = location.longitude
  //   const textArea = document.querySelector('.leftColumn')
  //   const locationDiv = document.createElement('div')
  //   locationDiv.classList.add("location-div")
  //   locationDiv.innerHTML = `
  //   <h3>${areaType}</h3>
  //   <h4>${area}</h4>
  //   `
  
  //   textArea.innerHTML = `<h2>My Places</h2>`
  //   const descrEl = document.createElement('h3');
  //   descrEl.innerHTML = areaType;
  //   const areaEl = document.createElement('h4');
  //   areaEl.className = "area-class";
  //   areaEl.innerText = area;
  //   textArea.appendChild(descrEl)
  //   textArea.appendChild(areaEl)
  //   textArea.innerHTML = `
  //   <h3>${areaType}</h3>
  //   <h4>${area}</h4>
  //   `
  //   textArea.append(locationDiv)
  
    
  // }

  // function showLocations(location) {
  //   const area = location.area
  //   const areaType = location.description
  //   const latDetail = location.latitude
  //   const lngDetail = location.longitude
  //   const textArea = document.querySelector('.leftColumn')

  //   textArea.innerHTML = `${area}`

  //   // textArea.appendChild(areaEl)

  //   const areaClick = textArea.querySelector('.area-class')
  //   areaClick.addEventListener('click', () => {
  //     fetchCrimeData(latDetail, lngDetail)
  //   })
  // }

})
