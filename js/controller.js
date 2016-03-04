(function(angular) {
    'use strict';

    function MirrorCtrl(
            AnnyangService,
            GeolocationService,
            WeatherService,
            MapService,
            HueService,
            CalendarService,
            XKCDService,
            GiphyService,
            TrafficService,
            $scope, $timeout, $interval) {
        var _this = this;
        var DEFAULT_COMMAND_TEXT = 'Say "What can I say?" to see a list of commands...';
        $scope.listening = false;
        $scope.debug = false;
        $scope.focus = "default";
        $scope.user = {};
        $scope.interimResult = DEFAULT_COMMAND_TEXT;

        //Update the time
        function updateTime(){
            $scope.date = new Date();
        }

        // Reset the command text
        var restCommand = function(){
          $scope.interimResult = DEFAULT_COMMAND_TEXT;
          if ($scope.focus == "greeting"){
        	  $scope.focus = "default";
          }
        }

        _this.init = function() {
            var tick = $interval(updateTime, 1000);
            updateTime();
            GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                console.log("Geoposition", geoposition);
                $scope.map = MapService.generateMap(geoposition.coords.latitude+','+geoposition.coords.longitude);
            });
            restCommand();

            var refreshMirrorData = function() {
                //Get our location and then get the weather for our location
                GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                    console.log("Geoposition", geoposition);
                    WeatherService.init(geoposition).then(function(){
                        $scope.currentForcast = WeatherService.currentForcast();
                        $scope.weeklyForcast = WeatherService.weeklyForcast();
                        $scope.hourlyForcast = WeatherService.hourlyForcast();
                        console.log("Current", $scope.currentForcast);
                        console.log("Weekly", $scope.weeklyForcast);
                        console.log("Hourly", $scope.hourlyForcast);
                    });
                }, function(error){
                    console.log(error);
                });

                CalendarService.getCalendarEvents().then(function(response) {
                    $scope.calendar = CalendarService.getFutureEvents();
                }, function(error) {
                    console.log(error);
                });

                $scope.greeting = config.greeting[Math.floor(Math.random() * config.greeting.length)];
            };

            refreshMirrorData();
            $interval(refreshMirrorData, 3600000);

            var refreshTrafficData = function() {
                TrafficService.getTravelDuration().then(function(durationTraffic) {
                    console.log("Traffic", durationTraffic);
                    $scope.traffic = {
                        destination:config.traffic.name,
                        hours : durationTraffic.hours(),
                        minutes : durationTraffic.minutes()
                    };
                }, function(error){
                    $scope.traffic = {error: error};
                });
            };

            refreshTrafficData();
            $interval(refreshTrafficData, config.traffic.reload_interval * 60000);

            var defaultView = function() {
                console.debug("Ok, going to default view...");
                $scope.focus = "default";
            }

            // List commands
            AnnyangService.addCommand('What can I say', function() {
                console.debug("Here is a list of commands...");
                console.log(AnnyangService.commands);
                $scope.focus = "commands";
            });

            // Go back to default view
            AnnyangService.addCommand('Go home', defaultView);

            // Hide everything and "sleep"
            AnnyangService.addCommand('Go to sleep', function() {
                console.debug("Ok, going to sleep...");
                $scope.focus = "sleep";
            });

            // Hide everything and "sleep"
            AnnyangService.addCommand('Clear', function() {
                console.debug("clear screen..");
                $scope.focus = "default";
            });
            
            // Go back to default view
            AnnyangService.addCommand('Wake up', defaultView);

            // Hide everything and "sleep"
            AnnyangService.addCommand('Show debug information', function() {
                console.debug("Boop Boop. Showing debug info...");
                $scope.debug = true;
            });

            // Hide everything and "sleep"
            AnnyangService.addCommand('Show map', function() {
                console.debug("Going on an adventure?");
                GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                    console.log("Geoposition", geoposition);
                    $scope.map = MapService.generateMap(geoposition.coords.latitude+','+geoposition.coords.longitude);
                    $scope.focus = "map";
                });
             });

		    AnnyangService.addCommand('weather', function() {
				console.debug("Show Weather!");
				$scope.focus = "weather";
            });

            // Show map
            AnnyangService.addCommand('Show (me a) map of *location', function(location) {
                console.debug("Getting map of", location);
                $scope.map = MapService.generateMap(location);
                $scope.focus = "map";
            });

            // Zoom in map
            AnnyangService.addCommand('(map) zoom in', function() {
                console.debug("zoom in !!!");
                $scope.map = MapService.zoomIn();
            });

            AnnyangService.addCommand('(map) zoom out', function() {
                console.debug("zoom out !!!");
                $scope.map = MapService.zoomOut();
            });

            AnnyangService.addCommand('(map) zoom (to) *value', function(value) {
                console.debug("zoom !!!", value);
                $scope.map = MapService.zoomTo(value);
            });

            AnnyangService.addCommand('(map) reset zoom', function() {
                console.debug("reset zoom !!!");
                $scope.map = MapService.reset();
                $scope.focus = "map";
            });

            // Change name
            AnnyangService.addCommand('(I am)(I\'m) *name', function(name) {
                console.debug("I am ", name, " nice to meet you");
                $scope.user.name = name;
                $scope.focus = "greeting";
            });

            // Check the time
            AnnyangService.addCommand('what time is it', function(task) {
                 console.debug("It is", moment().format('h:mm:ss a'));
                 $scope.focus = "time";
            });

            // Remind
            AnnyangService.addCommand('remind', function(task) {
                 console.debug("Remind schedules");
                 $scope.focus = "remind";
            });

            // Scenery
            AnnyangService.addCommand('scenery', function(task) {
                 console.debug("Ok, I'll change of scenery for you");
                 $scope.focus = "scenery";
            });
            
            $scope.slides = [
                 {image: 'img/1.jpg', description: 'image 01'},
                 {image: 'img/2.jpg', description: 'image 02'},
                 {image: 'img/3.jpg', description: 'image 03'},
                 {image: 'img/4.jpg', description: 'image 04'},
                 {image: 'img/5.jpg', description: 'image 05'}
             ];
            
            $scope.currentIndex = 0;

            $scope.setCurrentSlideIndex = function (index) {
            	$scope.currentIndex = index;
            };

            $scope.isCurrentSlideIndex = function (index) {
            	return $scope.currentIndex === index;
            };
            
			$scope.prevSlide = function () {
				$scope.currentIndex = ($scope.currentIndex < $scope.slides.length - 1) ? ++$scope.currentIndex : 0;
			};
			
			$scope.nextSlide = function () {
				$scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.slides.length - 1;
			};
            
			// Scenery previous
            AnnyangService.addCommand('(scenery) previous', function() {
                console.debug("chagne to previous scenery !!!");
                $scope.prevSlide();
            });
            
            // Scenery next
            AnnyangService.addCommand('(scenery) next', function() {
                console.debug("chagne to next scenery !!!");
                $scope.nextSlide();
            });			

            var resetCommandTimeout;
            //Track when the Annyang is listening to us
            AnnyangService.start(function(listening){
                $scope.listening = listening;
            }, function(interimResult){
                $scope.interimResult = interimResult;
                $timeout.cancel(resetCommandTimeout);
            }, function(result){
                $scope.interimResult = result[0];
                resetCommandTimeout = $timeout(restCommand, 5000);
            });
        };

        _this.init();
    }
    
    function slideAnimation() {
        return {
            addClass: function (element, className, done) {
                if (className == 'ng-hide') {
                	TweenMax.to(element, 0.5, {left: -element.parent().width(), onComplete: done });                
                }
                else {
                    done();
                }
            },
            removeClass: function (element, className, done) {
                if (className == 'ng-hide') {
                	element.removeClass('ng-hide');

                    TweenMax.set(element, { left: element.parent().width() });
                    TweenMax.to(element, 0.5, {left: 0, onComplete: done });
                }
                else {
                    done();
                }
            }
        };
    };
    
    angular.module('SmartMirror')
        .controller('MirrorCtrl', MirrorCtrl).animation('.slide-animation', slideAnimation);

}(window.angular));
