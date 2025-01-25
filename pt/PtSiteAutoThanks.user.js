// ==UserScript==
// @name            PT站点自动感谢
// @description     浏览PT站资源详情页面时使用 AJAX 方式在后台自动感谢发布者。
// @namespace       https://github.com/einverne/userscripts
// @namespace       https://greasyfork.org/zh-CN/scripts/4736
// @version         2024.7.19
// @match         *://*/details.php*
// @match         *://totheglory.im/t/*
// @icon
// @downloadURL https://github.com/einverne/userscripts/raw/refs/heads/master/pt/PtSiteAutoThanks.user.js
// @updateURL https://github.com/einverne/userscripts/raw/refs/heads/master/pt/PtSiteAutoThanks.user.js
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