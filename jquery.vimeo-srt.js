(function($, $f, window, document, undefined) {
  'use strict';

  /**
   * Vimeo Srt JQuery Plugin
   * ========================
   *
   * Author: PLIQUE Guillaume (Yomguithereal)
   * Contributors: OTERO Oscar (oscarotero)
   * Description: A simplistic jQuery plugin to display srt subtitles with vimeo
   * embedded videos.
   * URL: https://github.com/Yomguithereal/vimeo-srt.git
   * Dependencies : -- Froogaloop API --
   *              : -- jQuery --
   * License: MIT
   * Version: 1.0
   */

  /**
   * Plugin Defaults
   * ----------------
   */
  var pluginName = 'vimeoSrt',
      defaults = {
        srt: 'sample.srt'
      };

  /**
   * Main Class
   * -----------
   */
  function Plugin(element, options) {
    this.element = element;
    this.options = $.extend({}, defaults, options);

    // Properties
    this.defaults = defaults;
    this.name = pluginName;
    this.srt = [];

    // Working items
    this.currentSecond = 0.0;
    this.currentStep = false;

    // Selectors
    this.$iframe = false;
    this.$subtitles = false;

    // Regular Expressions
    this.regex = {
      spaces: /\n\n|\r\n\r\n|\r\r/g,
      carriages: /\n|\r\n|\r/g
    };

    // Constructor
    this.init();
  }

  /**
   * Helper Namespace
   * -----------------
   *
   * A useful batch of function dealing timecode and step fetching.
   */
  var _helpers = {
    toMilliseconds: function(time) {
      var split = time.split(','),
        milliseconds = +split[1],
        subsplit = split[0].split(':'),
        seconds = +subsplit[0] * 3600 + +subsplit[1] * 60 + +subsplit[2];
      return seconds + (milliseconds / 1000);
    },
    getClosestStep: function(array, target) {
      var tuples = array.map(function(val) {
        return [val, Math.abs(val.seconds_median - target)];
      });
      return tuples.reduce(function(memo, val) {
        return (memo[1] < val[1]) ? memo : val;
      }, [-1, 999])[0];
    }
  };

  /**
   * Plugin Prototype
   * -----------------
   */
  Plugin.prototype = {

    // Constructor
    init: function() {
      var _this = this;
      this.$iframe = $(this.element);

      // Waiting for the iframe to be ready
      this.$iframe.load(function() {

        // Loading the srt file
        _this.load(_this.options.srt, function() {
          froogaloopEvent();
        });
      });

      // Froogaloop Events
      function froogaloopEvent() {
        var player = $f(_this.$iframe[0]);

        player.addEvent('ready', function() {

          // Adding Events when ready
          player.addEvent('playProgress', onPlayProgress);
        });

        // On Play
        function onPlayProgress(data, id) {

          // Find the suitable subtitle step
          _this.currentSecond = +data.seconds;
          var step = _this._findSuitableStep();

          // Displaying subtitle
          if (step) {
            if (step.id !== _this.currentStep.id) {
              _this.currentStep = step;
              _this.$subtitles.html(_this.currentStep.text);
            }
          }
          else {
            _this.$subtitles.html('&nbsp;');
          }
        }
      }
    },

    // Parsing the srt file
    _parseSrt: function(srt_string) {
      var _this = this;

      // Parsing the srt file
      srt_string.split(this.regex.spaces).map(function(step) {
        var split = step.split(_this.regex.carriages).filter(function(i) {
          return !!$.trim(i);
        });

        if (split[1]) {
          var millSplit = split[1].split(' --> '),
              step = {
                'id' : split[0],
                'seconds_begin' : _helpers.toMilliseconds(millSplit[0]),
                'seconds_end' : _helpers.toMilliseconds(millSplit[1]),
                'text' : split.slice(2).join('<br>')
              };

          // Median for relevant closest find
          step.seconds_median = (step.seconds_begin + step.seconds_end) / 2;
          _this.srt.push(step);
        }
      });
    },

    // Checking srt to find suitable step
    _findSuitableStep: function() {

      // Looping to find good position
      var step = _helpers.getClosestStep(this.srt, this.currentSecond);

      // Returning good step
      return ((step.seconds_begin <= this.currentSecond) &&
              ((step.seconds_end + 1.0) >= this.currentSecond)) ?
        step :
        false;
    },

    // Load a srt file with ajax and parse it
    load: function(file, callback) {
      var _this = this,
          video_id = _this.element.getAttribute('id');

      $.get(file, function(srt) {

        // Creating a dom element to contain the subtitles
        if (!_this.$subtitles) {
          _this.$iframe.after(
            '<div id="' + video_id + '_subtitles">&nbsp;</div>'
          );
          _this.$subtitles = $('#' + video_id + '_subtitles');
        }

        // Remove the current subtitles
        _this.srt = [];

        // Set new subtitles
        _this._parseSrt(srt);

        if ($.isFunction(callback)) {
          callback();
        }
      });
    }
  };


  /**
   * Exporting
   * ----------
   */
  $.fn[pluginName] = function(options) {
    if ((options === undefined) || (typeof options === 'object')) {
      return this.each(function() {
        if (!$.data(this, 'plugin_' + pluginName)) {
          $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
        }
      });
    }

    if ((typeof options === 'string') &&
        (options[0] !== '_') &&
        (options !== 'init')) {
      var returns, args = arguments;

      this.each(function() {
        var instance = $.data(this, 'plugin_' + pluginName);

        if ((instance instanceof Plugin) &&
            (typeof instance[options] === 'function')) {
          returns = instance[options].apply(
            instance,
            Array.prototype.slice.call(args, 1)
          );
        }

        if (options === 'destroy') {
          $.data(this, 'plugin_' + pluginName, null);
        }
      });

      return returns !== undefined ? returns : this;
    }
  };

})(jQuery, Froogaloop, window, document);
