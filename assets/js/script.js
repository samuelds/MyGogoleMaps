/*jslint browser: true*/
/*global google window alert*/


google.maps.event.addDomListener(window, 'load', function () {
    "use strict";

    var autocomplete_start;
    var autocomplete_end;
    var geolocation;
    var directionsService;
    var directionsDisplay;
    var MapInstance;
    var isFullScreen = false;
    var mapIsFullScreen = false;
    var saveMapStatus = false;
    var geocoder;
    var marker_start;

    function requestFullScreen(elem) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }

    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    function toggleFullScreen(elem) {
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
            requestFullScreen(elem);
        } else {
            exitFullscreen();
        }
    }

    function mapToFull() {
        if (mapIsFullScreen === false) {
            document.body.id = '';
        } else {
            document.body.id = 'full';
        }
        google.maps.event.trigger(MapInstance, 'resize');
    }

    function exitHandler() {
        isFullScreen = !isFullScreen;
        if (isFullScreen === false) {
            mapIsFullScreen = saveMapStatus;
            mapToFull();
        } else {
            saveMapStatus = mapIsFullScreen;
            mapIsFullScreen = true;
            mapToFull();
        }
    }

    function loadMap(position, zoom) {
        MapInstance = new google.maps.Map(document.getElementById('map'), {
            zoom: zoom,
            center: position
        });
        directionsDisplay.setMap(MapInstance);
    }

    function getLocalisation(callback) {
        if (geolocation) {
            callback(geolocation);
            return true;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var mapsPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                geolocation = mapsPosition;
                callback(mapsPosition);
            }, function () {
                callback(false);
            });
        } else {
            callback(false);
            alert('Votre navigateur n\'est pas compatible :(');
        }
    }


    function eventListener() {

        document.addEventListener('webkitfullscreenchange', exitHandler, false);
        document.addEventListener('mozfullscreenchange', exitHandler, false);
        document.addEventListener('fullscreenchange', exitHandler, false);
        document.addEventListener('MSFullscreenChange', exitHandler, false);

        document.getElementById('full-screen').addEventListener('click', function (e) {
            e.preventDefault();
            toggleFullScreen(document.body);
            mapToFull();
        });

        document.getElementById('resize').addEventListener('click', function (e) {
            e.preventDefault();
            if (isFullScreen === false) {
                mapIsFullScreen = !mapIsFullScreen;
                mapToFull();
            }
        });

        document.getElementById('location').addEventListener('click', function (e) {
            e.preventDefault();
            getLocalisation(function (position) {
                if (position !== false) {
                    loadMap(position, 7);
                }
            });
        });

        document.getElementById('loca-end').addEventListener('click', function (e) {
            e.preventDefault();
            getLocalisation(function (position) {
                if (position !== false) {
                    loadMap(position, 7);
                }
            });
        });
    }

    function calculateAndDisplayRoute(start, stop) {
        directionsService.route({
            origin: start.value,
            destination: stop.value,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.DRIVING
        }, function (response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                marker_start.setMap(null);
                directionsDisplay.setDirections(response);
            }
        });
    }

    function startPosition(place) {
        if (place.geometry === false) {
            return;
        }

        if (place.geometry.viewport) {
            MapInstance.fitBounds(place.geometry.viewport);
        } else {
            MapInstance.setCenter(place.geometry.location);
            MapInstance.setZoom(16);
        }

        marker_start = new google.maps.Marker({
            position: place.geometry.location,
            map: MapInstance,
            title: place.formatted_address
        });
    }


    function initMap() {
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();
        var start = document.getElementById('start');
        var end = document.getElementById('end');
        autocomplete_start = new google.maps.places.Autocomplete(start);
        autocomplete_end = new google.maps.places.Autocomplete(end);
        geocoder = new google.maps.Geocoder();

        autocomplete_start.addListener('place_changed', function () {
            if (marker_start) {
                marker_start.setMap(null);
            }
            var place = autocomplete_start.getPlace();
            startPosition(place);
        });

        autocomplete_end.addListener('place_changed', function () {
            calculateAndDisplayRoute(start, end);
        });

        document.getElementById('loca-start').addEventListener('click', function (e) {
            e.preventDefault();
            getLocalisation(function (position) {
                if (position !== false) {
                    loadMap(position, 7);

                    geocoder.geocode({location: position}, function (results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            start.value = results[0].formatted_address;
                            startPosition(results[0]);
                        } else {
                            window.alert('Geocoder failed due to: ' + status);
                        }
                    });
                }
            });
        });

        document.getElementById('loca-end').addEventListener('click', function (e) {
            e.preventDefault();
            getLocalisation(function (position) {
                if (position !== false) {
                    loadMap(position, 7);

                    geocoder.geocode({location: position}, function (results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            end.value = results[0].formatted_address;
                        } else {
                            window.alert('Geocoder failed due to: ' + status);
                        }
                    });
                }
            });
        });

        var position = new google.maps.LatLng(0, 0);
        loadMap(position, 3);
        eventListener();

        document.getElementById('form').addEventListener('submit', function (e) {
            e.preventDefault();
            calculateAndDisplayRoute(start, end);
        });
    }

    initMap();
});