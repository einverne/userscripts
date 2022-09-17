// ==UserScript==
// @name         submit-movie
// @namespace    https://github.com/einverne/userscripts
// @version      0.1
// @description  将豆瓣的内容提交到KindlePush
// @icon        https://raw.githubusercontent.com/einverne/userscripts/master/douban2kindlepush/res/icon.png
// @author       Ein Verne
// @match        *movie.douban.com/subject/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

function map_rating(rating) {
    if (rating === "力荐") {
        return 5;
    } else if (rating === "推荐") {
        return 4;
    } else if (rating === "还行") {
        return 3;
    } else if (rating === "较差") {
        return 2;
    } else if (rating === "很差") {
        return 1;
    } else {
        return 0;
    }
}

function build_comment(commentItem) {
    if (typeof (commentItem) == 'undefined' || commentItem === undefined || !commentItem) return undefined
    let comment_id = commentItem.getAttribute('data-cid')
    let shortNode = commentItem.querySelector('.short')
    if (typeof (shortNode) != 'undefined' && shortNode != null) {
        content = shortNode.innerHTML
    } else {
        console.log('comment is null ' + commentItem)
        return undefined
    }
    let create_time = commentItem.querySelector('.comment-time').getAttribute('title')
    let user_name = commentItem.querySelector('.comment-info a').innerHTML
    let user_link = commentItem.querySelector('.comment-info a')['href']
    let ratingNode = commentItem.querySelector('.rating');
    let rating = 0
    if (typeof (ratingNode) != 'undefined' && ratingNode != null) {
        let ratingT = ratingNode.getAttribute('title')
        rating = map_rating(ratingT)
    }

    let vote_count = commentItem.querySelector('.vote-count').innerHTML
    return {
        'id': comment_id,
        'content': content,
        'create_time': create_time,
        'user_name': user_name,
        'user_link': user_link,
        'rating': rating,
        'vote_count': vote_count
    };
}

function build_review(reviewItem) {
    if (typeof (reviewItem) == 'undefined' || reviewItem === undefined || !reviewItem) return undefined
    let review_id = reviewItem.getAttribute('id')
    let user_name = reviewItem.querySelector('.name').innerText
    let user_link = reviewItem.querySelector('.name')['href']
    let ratingNode = reviewItem.querySelector('.main-title-rating')
    let rating = 0;
    if (typeof (ratingNode) != 'undefined' && ratingNode != null) {
        rating = ratingNode.getAttribute('title')
        rating = map_rating(rating)
    }
    let create_time = reviewItem.querySelector('.main-meta').innerText
    let short_content = reviewItem.querySelector('.short-content').innerText.trim()
    short_content = short_content.replace('这篇影评可能有剧透', '').replace('这篇剧评可能有剧透', '').replace('\(展开\)', '').trim()
    let title = reviewItem.querySelector('.main-bd h2 a').innerText.trim()
    return {
        'id': review_id,
        'user_name': user_name,
        'user_link': user_link,
        'rating': rating,
        'create_time': create_time,
        'title': title,
        'short_content': short_content
    };
}

function get_reviews(douban_id) {
    let review_items = document.querySelectorAll('.review-item')
    let reviews = []
    for (let i = 0; i < review_items.length; ++i) {
        let review = build_review(review_items[i]);
        if (typeof (review) === 'undefined' || review === null) continue
        review['entity_id'] = douban_id
        reviews.push(review)
    }
    console.log(reviews)
    return reviews;
}

function get_comment_list(douban_id) {
    let comments = []
    let comment_items = document.querySelectorAll('.comment-item')
    for (let i = 0; i < comment_items.length; ++i) {
        let comment = build_comment(comment_items[i]);
        if (typeof (comment) === 'undefined') continue
        comment['entity_id'] = douban_id
        comments.push(comment)
    }
    console.log(comments)
    return comments
}

window.addEventListener('load', function () {


    (function () {
        'use strict';

        $('.actor > span').show()

        let is_valid = location.href.match(/(\d{7,8})/g);
        if (is_valid == null) {
            console.log("skip");
            return
        }
        let douban_id = location.href.match(/(\d{7,8})/g)[0];

        let title = document.querySelector("#content > h1 > span:nth-child(1)").textContent
        console.log("title is " + title);
        let release_year = document.querySelector("#content > h1 > span.year").textContent
        release_year = release_year.replace('(', '').replace(')', '').trim()
        console.log("year is " + release_year)

        let caption = title + ' (' + release_year + ')';

        let image = document.querySelector('#mainpic > a.nbgnbg > img').src;
        let info = document.getElementById("info").innerText;
        console.log(info)

        let score = document.getElementsByClassName("ll rating_num")[0].innerText;

        let director = '';
        if (info.search(/导演:/g) >= 0) {
            director = info.match(/导演:\s+(.*)/g)[0].replace('导演:', '').trim();
        }
        let screenwriter = ''
        if (info.search(/编剧:/g) >= 0) {
            screenwriter = info.match(/编剧:\s+(.*)/g)[0].replace('编剧:', '').trim();
        }
        let actorsNode = document.querySelectorAll('span.actor > span.attrs a');
        let actors = []
        for (let i = 0; i < actorsNode.length; ++i) {
            let actor = actorsNode[i].innerText;
            if (actor === "更多...") continue
            actors.push(actor)
        }
        let actor = actors.join('/')
        let genre = '';
        if (info.search(/类型:/g) >= 0) {
            genre = info.match(/类型:\s+(.*)/g)[0].replace('类型:', '').trim();
        }
        let country = '';
        if (info.search(/制片国家\/地区:/g) >= 0) {
            country = info.match(/制片国家\/地区:\s+(.*)/g)[0].replace('制片国家\/地区:', '').trim();
        }
        let official_site = '';
        if (info.search(/官方网站:/g) >= 0) {
            official_site = info.match(/官方网站:\s+(.*)/g)[0].replace('官方网站:', '').trim();
        }
        console.log(official_site)
        let language = '';
        if (info.search(/语言:/g) >= 0) {
            language = info.match(/语言:\s+(.*)/g)[0].replace('语言:', '').trim();
        }
        let release_date = '';
        if (info.search(/上映日期:/g) >= 0) {
            release_date = info.match(/上映日期:\s+(.*)/g)[0].replace('上映日期:', '').trim()
        }
        if (info.search(/首播:/g) >= 0) {
            release_date = info.match(/首播:\s+(.*)/g)[0].replace('首播:', '').trim()
        }

        let length = '';
        if (info.search(/片长:/g) >= 0) {
            length = info.match(/片长:\s+(\d+)/g)[0].replace('片长:', '').trim();
        }

        let aka = 0;
        if (info.search(/又名:/g) >= 0) {
            aka = info.match(/又名:\s+(.*)/g)[0].replace('又名:', '').trim();
        }
        let imdb_id = '';
        if (info.search(/IMDb链接:/g) >= 0) {
            imdb_id = info.match(/IMDb链接:\s+(.*)/g)[0].replace('IMDb链接:', '').trim();
        }

        let short_intro = document.querySelector('#link-report > span:nth-child(1)')
        let movie_desc = short_intro.innerText.trim();
        let full_into = document.querySelector('#link-report > span:nth-child(2)')
        if (full_into != null && full_into.textContent.length > movie_desc.length) {
            movie_desc = full_into.innerText.trim();
        }

        let douban_link = location.href;
        if (location.href.includes("?")) {
            douban_link = location.href.substring(0, location.href.indexOf("?"));
        }

        let tags = []
        let tagNodes = document.querySelectorAll('.tags-body a')
        for (let i = 0; i < tagNodes.length; ++i) {
            tags.push(tagNodes[i].innerHTML)
        }

        let comments = get_comment_list(douban_id);
        let reviews = get_reviews(douban_id);

        let movie_info = {
            "douban_id": douban_id,
            "title": title,
            "caption": caption,
            "director": director,
            "screenwriter": screenwriter,
            "actor": actor,
            "genre": genre,
            "country": country,
            "language": language,
            "release_date": release_date,
            "release_year": release_year,
            "length": parseInt(length),
            "aka": aka,
            "imdb_id": imdb_id,
            "movie_desc": movie_desc,
            "score": score,
            "douban_link": douban_link,
            "image": image,
            "official_site": official_site,
            "tags": tags.join('/'),
            "comments": comments,
            "reviews": reviews
        };

        console.log(movie_info);
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://book.einverne.info/movie/save",
            data: JSON.stringify(movie_info),
            headers: {
                "Content-Type": "application/json"
            },
            onload: function (response) {
                console.log("response from kindlepush " + response.response);
            }
        })
    })();
}, false);

