var map;

function initMap() {
  var myLatlng = new google.maps.LatLng(41.38, 2.18);

  var myOptions = {
    zoom: 13,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  map = new google.maps.Map(document.getElementById("map"), myOptions);

  var marker = new google.maps.Marker({
    draggable: true,
    position: myLatlng,
    map: map,
    title: "Your location"
  });

  google.maps.event.addListener(map, 'click', function(event) {
    console.log(event.latLng);
  });
}

google.maps.event.addDomListener(window, 'load', initialize);


document.addEventListener('DOMContentLoaded',function(){
})
