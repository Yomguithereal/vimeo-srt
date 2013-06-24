/*
 *  Project: Vimeo Srt Plugin
 *  Description: A simplistic jQuery plugin to display srt subtitles with vimeo
 *  embedded videos.
 *  Author: PLIQUE Guillaume (Yomguithereal)
 *  Dependancies : -- Froogaloop API --
 *  License: MIT
 */

;(function ( $, $f, window, document, undefined ) {

	// Defaults
	//----------
	var vimeoSrt = "vimeoSrt",
		defaults = {
			srt : "sample.srt"
		};

	// Main Class
	//-----------
	function Plugin( element, options ) {
		this.element = element;

		this.options = $.extend( {}, defaults, options );

		// Properties
		this._defaults = defaults;
		this._name = 'vimeoSrt';
		this._srt = [];

		// Working items
		this._currentSecond = 0.0;

		// Selectors
		this._$iframe = false;
		this._$subtitles = false;

		// Regular Expressions
		this._spaces = new RegExp('\n\n|\r\n\r\n|\r\r', 'g');
		this._carriages = new RegExp('\n|\r\n|\r', 'g');

		// Launching constructor
		this.init();
	}

	// Utilities
	//----------

	// Time to milliseconds conversion
	function toMilliseconds(time){
		var split = time.split(',');
		var milliseconds = parseInt(split[1]);
		var subsplit = split[0].split(':');
		var seconds = (parseInt(subsplit[0])*60*60) + (parseInt(subsplit[1])*60) + (parseInt(subsplit[2]));
		return parseFloat(seconds + '.' + milliseconds);
	}

	// From vimeo secons to srt time
	function convertSeconds(seconds) {

		// Preparing
		var milliseconds = seconds.split('.')[1];
		seconds = parseInt(seconds);
		return toTime(seconds)+','+milliseconds;
	}

	// Get Nearest element in array
	function getClosest(array, target) {
		var tuples = array.map(function(val) {
			return [val, Math.abs(val.seconds_begin - target)];
		});
		return tuples.reduce(function(memo, val) {
			return (memo[1] < val[1]) ? memo : val;
		}, [-1, 999])[0];
	}


	// Prototype
	//----------
	Plugin.prototype = {

		// Constructor
		init: function() {

			// Self
			var self = this;
			this._$iframe = $(this.element);

			// Waiting for the iframe to be ready
			this._$iframe.load(loadSrt);

			// Loading the srt file
			function loadSrt(){
				$.get(self.options.srt, function(srt){

					// Creating a dom element to contain the subtitles
					self._$iframe.after('<div id="'+self.element.getAttribute('id')+'_subtitles">&nbsp;</div>');
					self._$subtitles = $('#'+self.element.getAttribute('id')+'_subtitles');

					// Parsing
					self.parseSrt(srt);

					// Creating Events
					froogaloopEvent();
				});
			}

			// Froogaloop Events
			function froogaloopEvent(){
				var player = $f(self.element.getAttribute('id'));

				player.addEvent('ready', function(){

					// Adding Events when ready
					player.addEvent('playProgress', onPlayProgress);
				});

				// On Play
				function onPlayProgress(data, id){

					// Find the suitable subtitle step
					self._currentSecond = parseFloat(data.seconds);
					var step = self.findSuitableStep();

					// Displaying subtitle
					if(step){
						self._$subtitles.html(step.text);
					}

				}
			}

		}

		// Parsing the srt file
		,parseSrt: function(srt_string){

			// Parsing the srt file
			var self = this;
			srt_string.split(this._spaces).forEach(function(step){
				var split = step.split(self._carriages);

				if(split[1] !== undefined){
					self._srt.push({
						'seconds_begin' : toMilliseconds(split[1].split(' --> ')[0])
						,'seconds_end' : toMilliseconds(split[1].split(' --> ')[1])
						,'time' : split[1]
						,'text' : split.slice(2, 5).join('<br>')
					});
				}
			});
		}

		// Checking srt to find suitable step
		,findSuitableStep: function(){

			// Looping to find good position
			var step = getClosest(this._srt, this._currentSecond);

			// Returning good step
			return step.seconds_begin > this._currentSecond ? false : step;
		}

	};


	// Exporting
	//----------
	$.fn[vimeoSrt] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, "plugin_" + vimeoSrt)) {
				$.data(this, "plugin_" + vimeoSrt, new Plugin( this, options ));
			}
		});
	};

})( jQuery, Froogaloop, window, document );