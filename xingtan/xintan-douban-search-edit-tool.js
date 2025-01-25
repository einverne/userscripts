// ==UserScript==
// @name         杏坛豆瓣书籍自动检索工具
// @version      0.1
// @description  已有的书籍名称通过豆瓣API获取信息，然后填充至各个信息区
// @match        https://xingtan.one/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xingtan.one
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_setValue
// @grant        GM_getValue
// @downloadURL 
// @updateURL  
// ==/UserScript==

(function () {
    'use strict';

    // 配置常量
    const CONFIG = {
        DOUBAN_API_KEY: '0ac44ae016490db2204ce0a042db2916',
        MAX_SEARCH_RESULTS: 8,
        AUTO_BOT_SIGNATURE: '本资源由LM-AUTO-BOT机器人自动发布,请及时修改资料',
        UPLOAD_API: 'https://img.xingtan.one/api/v1/upload'
    };

    // XPath 配置
    const XPATH = {
        DETAILS_TITLE: '/html/body/table[2]/tbody/tr[2]/td/div/font/table[1]/tbody/tr[1]/td[2]/a[1]',
        DETAILS_LINK: '/html/body/table[2]/tbody/tr[2]/td/div/font/table[1]/tbody/tr[4]/td[2]/a[2]',
        EDIT_TARGET: '/html/body/table[2]/tbody/tr[2]/td/div/div[2]',
        EDIT_TITLE: '/html/body/table[2]/tbody/tr[2]/td/div/form/font/font/b/table/tbody/tr[2]/td[2]/input'
    };

    // 工具函数
    const utils = {
        getElementByXPath(xpath) {
            return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        },

        createInfoDiv(targetElement) {
            const divElement = document.createElement('div');
            divElement.style = 'width:58%;background-color:#f1939c;font-size:15px';
            targetElement.parentNode.insertBefore(divElement, targetElement.nextSibling);
            return divElement;
        },

        extractTextBetweenDots(text) {
            const regex = /(?:\.[^.]+)(\.)([^.]+)(?:\.[^.]+)$/;
            const match = regex.exec(text);
            return match && match[2] ? match[2] : null;
        },

        async uploadImage(imageUrl) {
            try {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const formData = new FormData();
                formData.append('file', blob, 'image.jpg');
                
                const uploadResponse = await fetch(CONFIG.UPLOAD_API, {
                    method: 'POST',
                    body: formData,
                });
                const data = await uploadResponse.json();
                
                if (data.status) {
                    return data.data.links.url;
                }
                throw new Error('图片上传失败');
            } catch (error) {
                console.error('图片上传失败:', error);
                return null;
            }
        }
    };

    // 处理详情页面的逻辑
    class DetailsPageHandler {
        static handle() {
            const titleElement = utils.getElementByXPath(XPATH.DETAILS_TITLE);
            if (!titleElement) return;

            const extractedText = utils.extractTextBetweenDots(titleElement.textContent);
            if (!extractedText) return;

            const linkElement = utils.getElementByXPath(XPATH.DETAILS_LINK);
            if (!linkElement) return;

            const currentHref = linkElement.getAttribute('href');
            linkElement.setAttribute('href', `${currentHref}&type=${extractedText}`);
        }
    }

    // 处理编辑页面的逻辑
    class EditPageHandler {
        constructor() {
            this.divElement = null;
            this.books = [];
            this.values = [];
        }

        async init() {
            const targetElement = utils.getElementByXPath(XPATH.EDIT_TARGET);
            if (!targetElement) return;

            this.divElement = utils.createInfoDiv(targetElement);
            await this.handleEditPage();
        }

        async handleEditPage() {
            const titleElement = utils.getElementByXPath(XPATH.EDIT_TITLE);
            if (!titleElement) return;

            if (document.querySelector('input[name="author"]').value === CONFIG.AUTO_BOT_SIGNATURE) {
                this.divElement.innerHTML += '当前种子已被编辑过，不再执行自动检索脚本....<br>';
                return;
            }

            this.addInitialHtml();
            await this.searchDouban(titleElement.value);
        }

        addInitialHtml() {
            this.divElement.innerHTML += `
                温馨提示：<br>
                请<a style="color:red" href="https://xingtan.one/forums.php?action=viewtopic&forumid=23&topicid=43" target="_blank">点击此处</a>了解完整的编辑规则后再使用脚本<br>
                否则只是给审核人员添加负担<br><hr>
                开始搜索：<br>
            `;
        }

        async searchDouban(query) {
            const url = `https://api.douban.com/v2/book/search?q=${encodeURIComponent(query)}&apikey=${CONFIG.DOUBAN_API_KEY}`;
            
            try {
                const response = await new Promise((resolve, reject) => {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: url,
                        onload: resolve,
                        onerror: reject
                    });
                });

                const data = JSON.parse(response.responseText);
                this.books = data.books;
                localStorage.setItem('books', JSON.stringify(this.books));

                if (this.books.length === 0) {
                    this.divElement.innerHTML += '暂未检索到相关资源<br>';
                    return;
                }

                this.processSearchResults();
            } catch (error) {
                console.error('搜索失败:', error);
                this.divElement.innerHTML += '搜索失败，请稍后重试<br>';
            }
        }

        processSearchResults() {
            for (let i = 0; i < Math.min(CONFIG.MAX_SEARCH_RESULTS, this.books.length); i++) {
                const book = this.books[i];
                const value = this.formatBookInfo(book);
                this.values.push(value);
                
                this.divElement.innerHTML += `
                    <a style="color:yellow" onclick="insert(${i})">填充对应信息</a>
                    <a style="color:green" target="_blank" href="https://book.douban.com/subject/${book.id}">
                        第${i + 1}条：${book.title}[查看对应书籍]
                    </a><br>
                `;
            }
            
            localStorage.setItem('values', JSON.stringify(this.values));
        }

        formatBookInfo(book) {
            const author = book.author.join('&');
            const pubdate = book.pubdate.split('-')[0];
            
            let value = '\n';
            if (author) value += `作者: ${author}\n`;
            if (book.publisher) value += `出版社: ${book.publisher}\n`;
            if (book.subtitle) value += `副标题: ${book.subtitle}\n`;
            if (pubdate) value += `出版年: ${pubdate}\n`;
            if (book.pages) value += `页数: ${book.pages}\n`;
            if (book.price) value += `定价: ${book.price}\n`;
            if (book.binding) value += `装帧: ${book.binding}\n`;
            if (book.isbn13) value += `ISBN: ${book.isbn13}\n\n`;
            if (book.summary) value += `内容简介: \n    ${book.summary}\n\n`;
            if (book.author_intro) value += `作者简介: \n    ${book.author_intro}\n`;
            
            return value;
        }
    }

    // 注入客户端脚本
    function injectClientScript() {
        const script = document.createElement('script');
        script.textContent = `
            async function insert(id) {
                const book = JSON.parse(localStorage.getItem('books'))[id];
                const values = JSON.parse(localStorage.getItem('values'))[id];
                const type = new URL(window.location.href).searchParams.get('type');
                
                alert("请等待一会，其中图片自动上传比较慢");
                
                try {
                    const imageUrl = await fetch("https://images.weserv.nl/?url=" + book.images.large)
                        .then(response => response.blob())
                        .then(blob => {
                            const formData = new FormData();
                            formData.append('file', blob, 'image.jpg');
                            return fetch('${CONFIG.UPLOAD_API}', {
                                method: 'POST',
                                body: formData,
                            });
                        })
                        .then(response => response.json())
                        .then(data => data.status ? data.data.links.url : null);

                    if (imageUrl) {
                        document.querySelector('textarea[name="descr"]').value = 
                            \`[img]\${imageUrl}[/img]\${values}\`;
                    } else {
                        document.querySelector('textarea[name="descr"]').value = values;
                    }
                } catch (error) {
                    console.error('图片上传失败:', error);
                    document.querySelector('textarea[name="descr"]').value = values;
                }

                // 填充其他字段
                const author = book.author.join('&');
                const pubdate = book.pubdate.split('-')[0];
                
                document.querySelector('input[name="autor"]').value = author || "作者信息未获取";
                document.querySelector('input[name="publisher"]').value = book.publisher || "出版社信息未获取";
                document.querySelector('input[name="year"]').value = pubdate || "年份信息未获取";
                document.querySelector('input[name="ftype"]').value = "请自行填写";
                document.querySelector('input[name="isbn"]').value = book.isbn13 || "无";
                document.querySelector('input[name="pt_gen"]').value = "https://book.douban.com/subject/" + book.id;
            }
        `;
        document.head.appendChild(script);
    }

    // 主函数
    async function main() {
        const currentUrl = window.location.href;
        
        if (currentUrl.includes("details.php")) {
            DetailsPageHandler.handle();
        } else if (currentUrl.includes("edit.php")) {
            const handler = new EditPageHandler();
            await handler.init();
            injectClientScript();
        }
    }

    // 启动脚本
    main().catch(error => console.error('脚本执行失败:', error));
})();