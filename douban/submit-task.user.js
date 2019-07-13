// ==UserScript==
// @name         submit-task
// @namespace    https://github.com/einverne/userscripts
// @version      0.1
// @description  将豆瓣的内容提交到KindlePush
// @icon        https://raw.githubusercontent.com/einverne/userscripts/master/douban2kindlepush/res/icon.png
// @author       Ein Verne
// @match        *book.douban.com/subject/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    let title = document.getElementsByTagName("h1")[0].innerText;
    console.log("title is " + title);

    let image = document.getElementsByClassName("nbg")[0].href;
    console.log("image is " + image);
    let info = document.getElementById("info").innerText;
    console.log("all info " + info);

    let score = document.getElementsByClassName("ll rating_num")[0].innerText;

    let author = '';
    if (info.search(/作者:/g) >= 0) {
        author = info.match(/作者:\s+(.*)/g)[0].replace('作者:', '').trim();
        console.log(author);
    }
    let publisher = '';
    if (info.search(/出版社:/g) >= 0) {
        publisher = info.match(/出版社:\s+(.*)/g)[0].replace('出版社:', '').trim();
        console.log(publisher);
    }
    let sub_title = '';
    if (info.search(/副标题:/g) >= 0) {
        sub_title = info.match(/副标题:\s+(.*)/g)[0].replace('副标题:', '').trim();
        console.log(sub_title);
    }
    let translator = '';
    if (info.search(/译者:/g) >= 0) {
        translator = info.match(/译者:\s+(.*)/g)[0].replace('译者:', '').trim();
        console.log(translator);
    }
    let publish_year = '';
    if (info.search(/出版年:/g) >= 0) {
        publish_year = info.match(/出版年:\s+(.*)/g)[0].replace('出版年:', '').trim();
        console.log(publish_year);
    }

    let price = '';
    if (info.search(/定价:/g) >= 0) {
        price = info.match(/定价:\s+(.*)/g)[0].replace('定价:', '').trim();
        console.log(price);
    }

    let page_cnt = 0;
    if (info.search(/页数:/g) >= 0) {
        page_cnt = info.match(/页数:\s+(.*)/g)[0].replace('页数:', '').trim();
        console.log(page_cnt);
    }
    let binding = '';
    if (info.search(/装帧:/g) >= 0) {
        binding = info.match(/装帧:\s+(.*)/g)[0].replace('装帧:', '').trim();
        console.log(binding);
    }
    let isbn_13 = '';
    if (info.search(/ISBN:/g) >= 0) {
        isbn_13 = info.match(/ISBN:\s+(.*)/g)[0].replace('ISBN:', '').trim();
        console.log(isbn_13);
    }

    let intro = document.getElementsByClassName("intro");
    let book_intro = '';
    if (intro.length > 0) {
        book_intro = intro[0].innerText;
        console.log("book intro " + book_intro);
    }
    let author_intro = '';
    if (intro.length > 1) {
        author_intro = intro[1].innerText;
        console.log("author intro " + author_intro);
    }


    let tags_info = document.getElementsByClassName("tag");
    let arr = [];
    for (let i = 0; i < tags_info.length; i++) {
        arr.push(tags_info[i].innerText);
    }
    console.log(arr.join("/"));

    let douban_id = location.href.match(/(\d{7,8})/g)[0];

    let book_info = {
        "douban_id": douban_id,
        "title": title,
        "subtitle": sub_title,
        "douban_link": location.href,
        "author": author,
        "translator": translator,
        "publisher": publisher,
        "publish_time": publish_year,
        "page_num": parseInt(page_cnt),
        "book_desc": book_intro,
        "author_desc": author_intro,
        "score": score,
        "price": price,
        "isbn13": isbn_13,
        "binding": binding,
        "tags": arr.join("/"),
        "image": image
    };

    console.log(book_info);
    GM_xmlhttpRequest({
        method: "POST",
        url: "https://book.einverne.info/book/save",
        data: JSON.stringify(book_info),
        headers: {
            "Content-Type": "application/json"
        },
        onload: function (response) {
            console.log("response from kindlepush " + response.response);
        }
    })
})();
