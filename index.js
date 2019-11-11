var map;

function initMap() {
  var myLatlng = new google.maps.LatLng(51.509865, -0.118092);

  var myOptions = {
    zoom: 13,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
        {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{color: '#263c3f'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{color: '#6b9a76'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{color: '#38414e'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{color: '#212a37'}]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{color: '#9ca5b3'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{color: '#746855'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{color: '#1f2835'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{color: '#f3d19c'}]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{color: '#2f3948'}]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{color: '#17263c'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{color: '#515c6d'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{color: '#17263c'}]
        }
      ]
  }
  map = new google.maps.Map(document.getElementById("map"), myOptions);

  var marker = new google.maps.Marker({
    draggable: true,
    position: myLatlng,
    map: map,
    title: "Your location"
  });

  google.maps.event.addListener(map, 'click', function(event) {
    
    const dataArray = [];
    dataArray.push(event.latLng);
    const latDetail = dataArray[0].lat();
    const lngDetail = dataArray[0].lng();

    fetchCrimeData(latDetail, lngDetail);

    function fetchCrimeData(latDetail, lngDetail) {
        return fetch(`https://data.police.uk/api/crimes-at-location?&lat=${latDetail}&lng=${lngDetail}`)
        .then(function(response) {
            return response.json()
        })
        .then(function(crimes) {
            for (let i = 0; i < crimes.length; i++) {
                renderCrimes(crimes[i])
            }
        })
    }

    function renderCrimes(crime) {
        const bodyEl = document.querySelector('body');
        const resultEl = document.createElement('div');
        resultEl.className = 'result-div';
        resultEl.id = crime.category;
        const resultLi = document.createElement('li');
        resultLi.innerText = crime.category;
        bodyEl.appendChild(resultEl);
        resultEl.append(resultLi);
    }
  });
}

// google.maps.event.addDomListener(window, 'load', initialize);

document.addEventListener('DOMContentLoaded',function(){
})


