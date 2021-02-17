// ==UserScript==
// @name         Debug Userscript
// @namespace    https://github.com/einverne/userscripts
// @version      0.1
// @description  This is a debug script to load userscripts from local file system. NOTICE, you need to turn on Allow access to file URLs to @require local file https://www.tampermonkey.net/documentation.php
// @author       Ein Verne
// @match        http*://*
// @include      http://*
// @include      https://*
// @include      *
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      https://unpkg.com/dexie@latest/dist/dexie.js
// @require      file:///home/einverne/Git/userscripts/douban_export/douban_exporter.user.js
// @require      file:///home/einverne/Git/userscripts/douban/submit-movie.user.js
// ==/UserScript==

(function () {
    'use strict';

    console.log("debug script start here");
    // Your code here...
})();