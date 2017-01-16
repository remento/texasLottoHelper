/*global angular*/
/**
 *
 * @see https://developers.google.com/feed/v1/
 * @see http://www.ivivelabs.com/blog/making-a-quick-feed-reader-using-angularjs/
 */
(function () {
    'use strict';

    //--- -- --- -- --- -- ---
    // App
    //--- -- --- -- --- -- ---

    var App = angular.module('lotto', ['ngRoute']);

    App.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/winningnumbers', {
            templateUrl: 'static/partials/winningnumbers.html',
            name: 'winningnumbers'
        }).when('/jackpots', {
            templateUrl: 'static/partials/jackpots.html',
            name: 'jackpots'
        }).when('/smart', {
            templateUrl: 'static/partials/smart.html',
            name: 'smart'
        }).otherwise({
            redirectTo: '/smart'
        });
    }]);


    //--- -- --- -- --- -- ---
    // Controllers
    //--- -- --- -- --- -- ---

    App.controller("mainCtrl", ['$scope', '$location', '$route', '$timeout', 'FeedService', function ($scope, $location, $route, $timeout, Feed) {
        var clearLoading, calcGameData, filterJackpots, filterWinning;
        $scope.feedSrc = 'http://www.txlottery.org/export/sites/lottery/rss/tlc_latest.xml';
        $scope.data = {};
        $scope.loading = true;
        $scope.loadError = true;
        $scope.route = $route;
        $scope.routeName = 'not set';
        $scope.gameData = {};
        $scope.gameDataSorted = [];
        /**
         * games
         * define games and how to parse from raw data
         */
        $scope.games = [{
            title: "Powerball",
            match: 'Powerball Estimated Jackpot',
            price: 2,
            odds: {
                jackpot: 175223510
            }, //http://www.powerball.com/powerball/pb_prizes.asp
            key: 'powerball'
        }, {
            title: "Mega Millions",
            match: 'Mega Millions Estimated Jackpot',
            price: 1,
            odds: {
                jackpot: 258890850
            }, // google search - multiple sources, updated in 2013
            key: 'megaMillions'
        }, {
            title: "Lotto Texas",
            match: 'Lotto Texas Estimated Jackpot',
            price: 1,
            odds: {
                jackpot: 25827165
            }, //http://www.txlottery.org/export/sites/lottery/Games/Lotto_Texas/How_to_Play_Lotto_Texas.html
            key: 'lottoTexas'
        }];

        // PRIVATE METHODS

        /**
         * clearLoading
         */
        clearLoading = function () {
            var clearLoadingDelayMS = 1500;
            $timeout(function () {
                $scope.loading = false;
            }, clearLoadingDelayMS);
        };

        /**
         * calcGameData
         * Interpret the RSS data to determine which game is the smart pick
         */
        calcGameData = function () {
            var data = $scope.rawData;
            if (angular.isArray(data)) {
                data.forEach(function (item) {
                    //console.log('item',item);
                    if (item.title) {
                        // check if the title starts with the name of our key
                        $scope.games.forEach(function (game) {
                            if (game.match === item.title.slice(0, game.match.length)) {
                                //console.log('match found',item);
                                var jp = item.content.match(/\d*\.?\d+/g), // pulls two numbers item.content
                                    splitOn = "Cash Value: ",
                                    content = (item.content && item.content.split(splitOn)) || [],
                                    gd = {
                                        game: game,
                                        data: item,
                                        calc: {
                                            annuitized: parseFloat(jp[0]) * 1000000,
                                            cash: parseFloat(jp[1]) * 1000000,
                                            annuitizedStr: content[0],
                                            cashStr: splitOn + content[1]
                                        }
                                    };
                                gd.calc.rtnAnnuitized = gd.calc.annuitized / game.odds.jackpot / game.price;
                                gd.calc.rtnCash = gd.calc.cash / game.odds.jackpot / game.price;
                                $scope.gameData[game.key] = gd;
                                $scope.gameDataSorted.push(gd);
                            }
                        });
                    }
                });
                // sort the array
                $scope.gameDataSorted.sort(function (aa, bb) {
                    // desc value by rtnAnnuitized
                    return bb.calc.rtnAnnuitized - aa.calc.rtnAnnuitized;
                });
            }
        };

        /**
         * filterJackpots
         * Interpret the RSS data to create an array of entries related to the jackpots
         */
        filterJackpots = function () {
            var data = $scope.rawData;
            if (angular.isArray(data)) {
                $scope.jackpots = data.filter(function (item) {
                    return item.title.indexOf("Estimated Jackpot") !== -1;
                });
            } else {
                $scope.jackpots = null;
            }
        };

        /**
         * filterWinning
         * Interpret the RSS data to create an array of entries related to the winning numbers
         */
        filterWinning = function () {
            var data = $scope.rawData;
            if (angular.isArray(data)) {
                $scope.winning = data.filter(function (item) {
                    return item.title.indexOf("Winning Numbers") !== -1;
                });
            } else {
                $scope.jackpots = null;
            }
        };


        // SCOPE METHODS
        /**
         * loadFeed
         */
        $scope.loadFeed = function (e) {
            $scope.loading = true;
            $scope.loadError = false;
            Feed.parseFeed($scope.feedSrc).then(function (res) {
                //$scope.rawData = res.data.responseData.feed.entries; // googleApis

                //$scope.rawData = res.data.feed;  // api.rss2json.com // not used
                $scope.rawData = res.data.items;   // api.rss2json.com


                $scope.fetchDate = new Date();
                clearLoading();
            }, function () {
                //load error
                $scope.loading = false;
                clearLoading();
            });
        };

        // WATCHERS
        $scope.$watch('rawData', function (data) {
            // reset our scope variables
            $scope.gameData = {};
            $scope.gameDataSorted = [];
            // interpret the feed for smart picks
            calcGameData();
            filterJackpots();
            filterWinning();
        }, true);

        // EVENT listeners
        $scope.$on('$routeChangeSuccess', function () {
            var newLoc = $location.path();
            $scope.routeName = $route.routes[newLoc].name;
        });

        // MAIN
        $scope.loadFeed();

    }]);

    //--- -- --- -- --- -- ---
    // Services
    //--- -- --- -- --- -- ---

    App.factory('FeedService', ['$http', function ($http) {
        var feedProcessUrl = 'https://api.rss2json.com/v1/api.json?callback=JSON_CALLBACK&rss_url=';
        // google API discontinued...
        // ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=
        return {
            parseFeed: function (url) {
                return $http.jsonp(feedProcessUrl + encodeURIComponent(url));
            }
        };
    }]);

}());
