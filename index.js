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
      debugger

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
      <input class="btn btn-primary" type="submit" value="Save this Place">
      `;
      const saveButton = textArea.querySelector('.btn')
      textArea.appendChild(crimeEl);
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


  const userPlaces = document.querySelector(".places")
  userPlaces.addEventListener('click', () => {
    return fetch('http://localhost:3000/locations')
      .then(res => res.json())
      .then(locations => {
        for (const location of locations) {
          showLocations(location)
        }
      })
  })

  function showLocations(location) {
    const area = location.area
    const areaType = location.description
    const latDetail = location.latitude
    const lngDetail = location.longitude
    const textArea = document.querySelector('.leftColumn')
    textArea.innerHTML = `
    <h2>My Places</h2>
    <h3>${areaType}</h3>
    <h4 class="area-class">${area}</h4>
    `
    const areaClick = textArea.querySelector('.area-class')
    areaClick.addEventListener('click', () => {
      fetchCrimeData(latDetail, lngDetail)
    })
  }

})
