// ==UserScript==
// @name         Send request to einverne
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *book.douban.com/subject/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    var douban_id = location.href.match(/(\d{7,8})/g)[0];
    console.log(douban_id)
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://book.einverne.info/book/submit/"+douban_id,
        data: douban_id,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        onload: function(response) {
            console.log("response from einverne " + response.response);
        }
    })
})();