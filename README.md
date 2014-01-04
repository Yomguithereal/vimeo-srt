Vimeo Srt Jquery Plugin
=======================

How To
------
Include the jquery.vimeo-srt.min.js and simply call

```js
$(your_vimeo_iframe).vimeoSrt({ srt : 'path_to_srt'});
```

It will load the subtitle file with ajax, parse it and attach playing events to your video to display subtitles under your iframe in a div with the same id suffixed with _subtitle.

Contributing
------------
    Yomguithereal
    oscarotero

Please feel free to contribute. Follow the hereafter directions to set up the dev environment.

```bash
git clone git@github.com:Yomguithereal/vimeo-srt.git
cd vimeo-srt
npm install

# If grunt is not yet globally installed, be sure do it thusly:
npm install -g grunt-cli
```
Be sure to pass the linter and uglify the code before submitting any change to the plugin.

```bash
grunt
```

If you just want to minify the plugin for production yourself.

```bash
grunt uglify
```
Dependencies
------------
    jQuery
    Froogaloop API