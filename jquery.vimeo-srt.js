/*
 *  Project: Vimeo Srt Plugin
 *  Description: A simplistic jQuery plugin to display srt subtitles with vimeo
 *  embedded videos.
 *  Author: PLIQUE Guillaume (Yomguithereal)
 *  Dependancies : -- Froogaloop API --
 *               : -- jQuery --
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
		this._currentStep = false;

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

	// Get Nearest element in array
	function getClosest(array, target) {
		var tuples = array.map(function(val) {
			return [val, Math.abs(val.seconds_median - target)];
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
						if(step.id !== self._currentStep.id){
							self._currentStep = step;
							self._$subtitles.html(self._currentStep.text);
						}
					}
					else{
						self._$subtitles.html('&nbsp;');
					}

				}
			}

		}

		// Parsing the srt file
		,parseSrt: function(srt_string){

			// Parsing the srt file
			var self = this;
			srt_string.split(this._spaces).forEach(function(step){
				var split = step.split(self._carriages).filter(function(i){ return $.trim(i) != '' });
				
				if(split[1] !== undefined){
					var step = {
						'id' : split[0]
						,'seconds_begin' : toMilliseconds(split[1].split(' --> ')[0])
						,'seconds_end' : toMilliseconds(split[1].split(' --> ')[1])
						,'text' : split.slice(2).join('<br>')
					};

					// Median for relevant closest find
					step.seconds_median = (step.seconds_begin + step.seconds_end) / 2;
					self._srt.push(step);
				}
			});
		}

		// Checking srt to find suitable step
		,findSuitableStep: function(){

			// Looping to find good position
			var step = getClosest(this._srt, this._currentSecond);

			// Returning good step
			return ((step.seconds_begin <= this._currentSecond) && ((step.seconds_end + 1.0) >= this._currentSecond))
				? step
				: false;
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