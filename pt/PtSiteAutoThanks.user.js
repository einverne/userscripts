// ==UserScript==
// @name            PT站点自动感谢
// @description     浏览PT站资源详情页面时使用 AJAX 方式在后台自动感谢发布者。
// @namespace       https://greasyfork.org/zh-CN/scripts/4736-pt%E7%AB%99%E8%87%AA%E5%8A%A8%E6%84%9F%E8%B0%A2
// @version         2024.7.19
// @match         *://*/details.php*
// @match         *://totheglory.im/t/*
// @icon
// @downloadURL https://update.greasyfork.org/scripts/4736/PT%E7%AB%99%E8%87%AA%E5%8A%A8%E6%84%9F%E8%B0%A2.user.js
// @updateURL https://update.greasyfork.org/scripts/4736/PT%E7%AB%99%E8%87%AA%E5%8A%A8%E6%84%9F%E8%B0%A2.meta.js
// ==/UserScript==

(function () {
  function $(css, contextNode) {
    return (contextNode || document).querySelector(css);
  }

  window.onload = function () {
    function thanks() {
      let url = location.href;
      let btn = '';
      if (url.indexOf('totheglory') > 0) {
        btn = $('#ajaxthanks');
      } else if (url.indexOf('hdwing') > 0) {
        btn = $('#thanksbutton');
      } else if (url.indexOf('details') > 0) {
        btn = $('#saythanks');
      }
      if (btn !== undefined && btn.disabled !== true) {
        btn.click();
      }
    }

    window.addEventListener('load', thanks, false);
  }

})();