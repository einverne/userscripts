// ==UserScript==
// @name           Replace Text On Webpages
// @namespace      https://github.com/einverne/userscripts/raw/master/universal/ReplaceText.user.js
// @description    Replaces text on specified websites. Now supports wildcards in search queries. Won't replace text in certain tags like links and code blocks
// @author         JoeSimmons & EinVerne
// @include        http://*
// @include        https://*
// @include        file://*
// @exclude        http://userscripts.org/scripts/review/*
// @exclude        http://userscripts.org/scripts/edit/*
// @exclude        http://userscripts.org/scripts/edit_src/*
// @exclude        https://userscripts.org/scripts/review/*
// @exclude        https://userscripts.org/scripts/edit/*
// @exclude        https://userscripts.org/scripts/edit_src/*
// @copyright      JoeSimmons
// @copyright      Ein Verne https://blog.einverne.info
// @version        1.1.1
// @license        http://creativecommons.org/licenses/by-nc-nd/3.0/us/
// @supportURL     https://github.com/einverne/userscripts/issues
// @updateURL      https://github.com/einverne/userscripts/raw/master/universal/ReplaceText.user.js
// @downloadURL    https://github.com/einverne/userscripts/raw/master/universal/ReplaceText.user.js
// ==/UserScript==
(function () {
    'use strict';

	/*
	 * https://userscripts-mirror.org/scripts/review/41369
	 */

	/*
			NOTE: 
					You can use \\* to match actual asterisks instead of using it as a wildcard!
					The examples below show a wildcard in use and a regular asterisk replacement.
	*/

	var words = {
	///////////////////////////////////////////////////////

	// Syntax: 'Search word' : 'Replace word',
		'女一': '李嘉欣(女一)',
		'女1': '李嘉欣(女一)',
		'女二': '徐敏在(女二)',
		'女2': '徐敏在(女二)',
		'女三': '朴智贤(女三)',
		'女3': '朴智贤(女三)',
		'男一': '千仁宇(男一)',
		'男1': '千仁宇(男一)',
		'男二': '郑义东(男二)',
		'男2': '郑义东(男二)',
		'男三': '任翰杰(南三)',
		'男3': '任翰杰(南三)',
			'your a' : 'you\'re a',
			'imo' : 'in my opinion',
			'im\\*o' : 'matching an asterisk, not a wildcard',
			'/\\bD\\b/g' : '[D]',

	///////////////////////////////////////////////////////
	'':''};

	doReplace('https?://www.douban.com/group/topic/*', words)
	doReplace('https?://www.douban.com/group/688173*', words)

	function doReplace(urlPattern, words) {
		const currentUrl = window.location.href
		if (!currentUrl.match(urlPattern)) {
			return
		}

    //////////////////////////////////////////////////////////////////////////////
    // This is where the real code is
    // Don't edit below this
    //////////////////////////////////////////////////////////////////////////////

    var regexs = [], replacements = [],
        tagsWhitelist = ['PRE', 'BLOCKQUOTE', 'CODE', 'INPUT', 'BUTTON', 'TEXTAREA'],
        rIsRegexp = /^\/(.+)\/([gim]+)?$/,
        word, text, texts, i, userRegexp;

    // prepareRegex by JoeSimmons
    // used to take a string and ready it for use in new RegExp()
    function prepareRegex(string) {
        return string.replace(/([\[\]\^\&\$\.\(\)\?\/\\\+\{\}\|])/g, '\\$1');
    }

    // function to decide whether a parent tag will have its text replaced or not
    function isTagOk(tag) {
        return tagsWhitelist.indexOf(tag) === -1;
    }

    delete words['']; // so the user can add each entry ending with a comma,
                      // I put an extra empty key/value pair in the object.
                      // so we need to remove it before continuing

    // convert the 'words' JSON object to an Array
    for (word in words) {
        if ( typeof word === 'string' && words.hasOwnProperty(word) ) {
            userRegexp = word.match(rIsRegexp);

            // add the search/needle/query
            if (userRegexp) {
                regexs.push(
                    new RegExp(userRegexp[1], 'g')
                );
            } else {
                regexs.push(
                    new RegExp(prepareRegex(word).replace(/\\?\*/g, function (fullMatch) {
                        return fullMatch === '\\*' ? '*' : '[^ ]*';
                    }), 'g')
                );
            }

            // add the replacement
            replacements.push( words[word] );
        }
    }

			// do the replacement
		texts = document.evaluate('//body//text()[ normalize-space(.) != "" ]', document, null, 6, null);
		for (i = 0; text = texts.snapshotItem(i); i += 1) {
				if ( isTagOk(text.parentNode.tagName) ) {
						regexs.forEach(function (value, index) {
								text.data = text.data.replace( value, replacements[index] );
						});
				}
		}
	}

}());
