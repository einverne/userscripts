// ==UserScript==
// @name         JD to Beancount
// @namespace    https://github.com/zsxsoft/my-beancount-scripts/blob/master/jd.user.js
// @namespace    https://github.com/einverne/userscripts
// @version      0.1
// @description  JD to Beancount，打开京东我的订单页面或订单详情，查看浏览器 console
// @author       zsx
// @author       Ein Verne
// @match        https://order.jd.com/*
// @match        https://details.jd.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict'
    let debitAccount = {
        "DEFAULT": "Expenses:Food:Other",
        "iCloud|腾讯云|阿里云|Plex": "Expenses:Fun:Subscription",
        "滴滴|司机": "Expenses:Traffic:Taxi",
        "巧克力|饼干|甜点|肉脯|口香糖|果冻": "Expenses:Food:Snack",
        "友宝|芬达|雪碧|可乐|送水|怡宝|饮料|美年达|柠檬茶|红茶|牛奶|蒙牛|莫斯利安|酸奶": "Expenses:Food:Drinks",
        "水果": "Expenses:Food:Fruits",
        "买菜|叮咚|米饭|大米|粥米|水饺|馄饨|拉面|海底捞|火锅|丸子|方便面|螺蛳粉|鸡蛋|豆皮|虾滑|巴沙鱼": "Expenses:Food:Cooking",
        "App Store|Steam|会员": "Expenses:Fun:SoftwareAndGame",
        "全时|华联|家乐福|超市|红旗|WOWO|百货|伊藤|永旺|全家": "Expenses:Daily:Commodity",
        "汽车票|蒜芽信息科技|优步|火车|动车|空铁无忧网|滴滴|汽车|运输|机场|航空|机票|高铁|出行|车费|打车": "Expenses:Travel",
        "捐赠": "Expenses:PublicWelfare",
        "话费|流量充值|手机充值|中国移动": "Expenses:Daily:PhoneCharge",
        "洗发水|牙膏|牙刷|沐浴露|防晒|毛巾|雨衣|伞|眼药水|杀虫剂|净水器|浴室用品": "Expenses:Daily:Commodity",
        "电影|大麦网|演出": "Expenses:Fun:Amusement",
        "图书|访谈录": "Expenses:Fun:Book",
        "地铁": "Expenses:Traffic:TransportCard",
        "衣|裤|鞋": "Expenses:Dressup:Clothing",
        "造型": "Expenses:Dressup:Hair",
        "法兰琳卡|法兰琳卡|防晒|控油|化妆品|面膜": "Expenses:Dressup:Cosmetic",
        "医院|药房": "Expenses:Health:Hospital",
        "酒店|airbnb": "Expenses:Travel:Hotel",
        "机票|高铁|票务|特快|火车票|飞机票": "Expenses:Travel:Fare",
        "借款": "Assets:Receivables",
        "蚂蚁财富": "Assets:MoneyFund:BondFund",
        '签证': "Expenses:Travel:Visa",
        "门票": "Expenses:Travel:Ticket",
        "gopro|键盘|电脑|手机|SD卡|相机|主板|硬盘|MacBook|boox|ipad|apple|oneplus|SATA|闪迪|U盘|芯片|小米|iPhone|路由器|交换机|转换线": "Expenses:Digital",
    }

    function chooseExpenseAccount(goodsName) {
        for (let debitAccountKey in debitAccount) {
            let regex = new RegExp(debitAccountKey);
            let re = goodsName.match(regex)
            if (re != null) {
                return debitAccount[debitAccountKey]
            }
        }
        return debitAccount['DEFAULT']
    }

    const $ = document.querySelectorAll.bind(document)
    if ($('.td-void.order-tb').length > 0) {
        setTimeout(() => {
            const f = Array.from($('.order-tb tbody[id*="tb-"]')).filter(a => {
                const q = a.querySelector.bind(a)
                const t = d => q(d).innerText
                let orderStatus = `${t('.order-status')}`
                console.log(orderStatus)
                return orderStatus.trim() === '已完成';
            }).map(a => {
                const q = a.querySelector.bind(a)
                const t = d => q(d).innerText
                let expenseAccount = chooseExpenseAccount(`${t('.p-name')}`)
                if (a.querySelectorAll('[id*="track"]').length === 1) {
                    return `
${t('.dealtime').split(' ')[0]} * "京东 ${t('.number')}" "${t('.p-name')}"
  date: "${t('.dealtime')}"
  ${expenseAccount}   ${t('.amount').match(/([0-9.]+)/)[1]} CNY
  Liabilities:CreditCard:BOC
`.trim()
                } else {
                    return `
${t('.dealtime').split(' ')[0]} * "京东 ${t('.number')}" "${t('.p-name')} 等"
  date: ${t('.dealtime')}
  ${expenseAccount}   ${t('.amount').match(/([0-9.]+)/)[1]} CNY
  Liabilities:CreditCard:BOC
`.trim()
                }
            }).join('\n\n')
            console.log(f)
        }, 5000)
    }
    if ($('.goods-total').length > 0) {
        // 订单详情
        const fp = a => a.replace(/￥|¥/, '').trim()
        const p = fp($('.txt.count')[0].innerText)
        const t = fp($('.goods-total .txt')[0].innerText)
        const pe = p / t
        const f = Array.from($('tr[class*="product"]')).map(a => {
            const q = a.querySelector.bind(a)
            const t = d => q(d).innerText.trim()
            let expenseAccount = chooseExpenseAccount(`${t('.p-name')}`)
            return `
${document.querySelector('[id*="datesubmit"]').value.split(' ')[0]} * "京东" "${t('.p-name')}"
  ${expenseAccount}                             ${(fp(t('.f-price')) * a.querySelectorAll('td')[4].innerText.trim() * pe).toFixed(2)} CNY
  Liabilities:CreditCard:BOC
`
        }).join('')
        console.log(f)
    }
})();
