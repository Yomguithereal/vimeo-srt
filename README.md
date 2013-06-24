Vimeo Srt Jquery Plugin
=======================

Dependancies
------------
	jQuery (any version >= 1.6)
	Froogaloop API

How To
------
Simply call : $(your_vimeo_iframe).vimeoSrt('path_to_srt');
It will load the subtitle file with ajax, parse it and attach
playing events to your video to display subtitles under your 
iframe in a div with the same id prefixed with _subtitle.

Supported Files
---------------
As indicated in the name of the plugin, only srt files can be loaded.
So do not bother trying other formats.