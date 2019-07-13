// ==UserScript==
// @name        豆瓣 KindlePush 传送门
// @namespace   https://github.com/einverne/userscripts
// @description 在“豆瓣读书”页面增加到 KindlePush 电子书的传送门
// @icon        https://raw.githubusercontent.com/einverne/userscripts/master/douban2kindlepush/res/icon.png
// @include     https://book.douban.com/*
// @version     1.0.0
// @resource    custom_css https://raw.githubusercontent.com/einverne/userscripts/master/douban2kindlepush/style/style.css
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @connect     book.einverne.info
// ==/UserScript==

function get_book_id(url) {
    let re = /\/subject\/(\d+)(\/?$|\/.icn=(index-latestbook-subject|index-topchart-subject|index-book250-subject|index-editionrecommend)$)/g;
    let matches = re.exec(url);
    if (matches && matches.length > 1) {
        return parseInt(matches[1]);
    }
}

function add_readfree_style() {
    GM_addStyle(GM_getResourceText("custom_css"));
}

function dom(tag, attr, inner) {
    let el = document.createElement(tag);
    for (let key in attr) {
        if (attr.hasOwnProperty(key)) {
            el.setAttribute(key,attr[key]);
        }
    }
    if (inner) {
        el.innerHTML = inner;
    }
    return el;
}


function add_link_from_ev () {
    var path = document.location.pathname;
    var id = get_book_id(path);
    if (id) {
        var rf_url = 'https://book.einverne.info/book/' + id;
        GM_xmlhttpRequest({
            method: "HEAD",
            url: rf_url,
            onload: function (response) {
                if (response.status === 200) {
                    let panel = dom('div', {id: 'kindlepush'});
                    let ahref = dom('a', { class: 'kindlepush book_info-link', href: rf_url, target: '_blank'}, 'KindlePush!');
                    panel.appendChild(ahref);
                    document.body.appendChild(panel);
                }
            }
        })
    }
}

function add_links_to_all_books() {
    let my_a = document.querySelectorAll("a");
    for (let i = 0; i < my_a.length; i++) {
        let this_a = my_a[i];
        if (this_a.children[0] === undefined || this_a.children[0].nodeName !== "IMG"){
            if (this_a.href.indexOf("subject")) {
                let id = get_book_id(this_a.href);
                if (id) {
                    let rf_url = 'https://book.einverne.info/book/' + id;
                    GM_xmlhttpRequest({
                        method: "HEAD",
                        url: rf_url,
                        onload: function (response) {
                            if (response.status === 200) {
                                let ahref = dom('a', {class: 'kindlepush all_books_link', href: rf_url, target: '_blank'}, 'KindlePush!');
                                this_a.parentNode.insertBefore(ahref, this_a.nextSibling);
                            }
                        }
                    })
                }
            }
        }
    }
}

function main(){
    add_readfree_style();
    add_links_to_all_books();
    add_link_from_ev();
}


(function() {
    'use strict';

    main();
})();
