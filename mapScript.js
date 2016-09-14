	var map;
	var infowindow;
	var markers = [];
	var mainMarker = "http://www.free-icons-download.net/images/location-icon-9646.png";

	/* if everything is OK, find locations near the current location */
	function successFunction(position) {
		var pyrmont = {
			lat : position.coords.latitude,
			lng : position.coords.longitude
		};
		findLocation(pyrmont);
	}

	/* if current location is not proper, display error message */
	function errorFunction(position) {
		alert('It seems like Geolocation, which is required for this page, is not enabled in your browser. Please use a browser which supports it.');
	}

	/* intializes the map */
	function initMap() {
		// add hints to the text box
		var input = document.getElementById('enterSource');
		var input1 = document.getElementById('enterDestination');
		var options = {
			types : [ 'geocode', 'establishment' ]
		};
		autocomplete = new google.maps.places.Autocomplete(input, options);
		autocomplete = new google.maps.places.Autocomplete(input1, options);

		// if current location is valid, take us to it, or display error message
		if (navigator.geolocation)
			navigator.geolocation.getCurrentPosition(successFunction,
					errorFunction);

		// define a geocoder for getting entered location and it's nearby locations
		var geocoder = new google.maps.Geocoder();
		document.getElementById('source').addEventListener('click', function() {
			var source = document.getElementById('enterSource').value;
			geocodeAddress(geocoder, map, source);
		});

		document.getElementById('destination').addEventListener(
				'click',
				function() {
					var destination = document
							.getElementById('enterDestination').value;
					geocodeAddress(geocoder, map, destination);
				});
	}

	/* find location */
	function findLocation(pyrmont) {
		map = new google.maps.Map(document.getElementById('map'), {
			center : pyrmont,
			zoom : 15,
			mapTypeId : 'roadmap'
		});

		var directionsService = new google.maps.DirectionsService;
		var directionsDisplay = new google.maps.DirectionsRenderer;
		directionsDisplay.setMap(map);

		nearByPlaces(pyrmont);

		// add elements to the map
		var input = document.getElementById('enterSource');
		var button = document.getElementById('source');
		var input1 = document.getElementById('enterDestination');
		var button1 = document.getElementById('destination');
		var findRoute = document.getElementById("findRoute");
		map.controls[google.maps.ControlPosition.TOP_RIGHT].push(button1);
		map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input1);
		map.controls[google.maps.ControlPosition.TOP_RIGHT].push(button);
		map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);
		map.controls[google.maps.ControlPosition.TOP_RIGHT].push(findRoute);

		document.getElementById("findRoute").addEventListener(
				"click",
				function() {
					calculateAndDisplayRoute(directionsService,
							directionsDisplay, input.value, input1.value);
				});
	}

	/* searches nearby places */
	function nearByPlaces(pyrmont) {
		infowindow = new google.maps.InfoWindow();
		var service = new google.maps.places.PlacesService(map);
		service.nearbySearch({
			location : pyrmont,
			radius : 1000,
			type : [ 'geocode', 'establishment' ]
		}, callback);
	}

	/* does geocoding of the entered address */
	function geocodeAddress(geocoder, resultsMap, address) {
		geocoder.geocode({
			'address' : address
		}, function(results, status) {
			if (status === 'OK') {
				var temp = {
					lat : results[0].geometry.location.lat(),
					lng : results[0].geometry.location.lng()
				};
				deleteMarkers();
				resultsMap.setCenter(temp);

				// put a marker on the searched location
				var marker = new google.maps.Marker({
					map : map,
					position : results[0].geometry.location,
					icon : mainMarker
				});
				markers.push(marker);
				google.maps.event.addListener(marker, 'click', function() {
					infowindow.setContent(address);
					infowindow.open(map, this);
				});

				// search nearby locations of the searched location
				nearByPlaces(temp);
			} else {
				alert('Geocode was not successful for the following reason: '
						+ status);
			}
		});
	}

	/* reads the results returned by the coordinates */
	function callback(results, status) {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++)
				createMarker(results[i]);
		}
	}

	/* creates markers at the locations */
	function createMarker(place) {
		var marker = new google.maps.Marker({
			map : map,
			position : place.geometry.location
		});
		markers.push(marker);
		google.maps.event.addListener(marker, 'click', function() {
			infowindow.setContent(place.name);
			infowindow.open(map, this);
		});
	}

	/* deletes the previous markers */
	function deleteMarkers() {
		for (var i = 0; i < markers.length; i++)
			markers[i].setMap(null);
		markers = [];
	}

	/* finding route */
	function calculateAndDisplayRoute(directionsService, directionsDisplay,
			source, destination) {
		deleteMarkers();
		directionsService.route({
			origin : source,
			destination : destination,
			travelMode : 'DRIVING'
		}, function(response, status) {
			if (status === 'OK') {
				directionsDisplay.setDirections(response);
			} else {
				window.alert('Directions request failed due to ' + status);
			}
		});
	}
