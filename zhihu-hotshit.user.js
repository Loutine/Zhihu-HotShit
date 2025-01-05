// ==UserScript==
// @name        知乎-趁热吃屎
// @description 帮助您吃到蓝色低端论坛最新鲜的阴沟耗子窖藏老屎
// @version     1
// @grant       none
// @match       *://*.zhihu.com/*
// @icon        https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// ==/UserScript==
const nowTime = Date.now()
const questionCreatedNode = document.querySelector(".QuestionPage > meta[itemprop='dateCreated']");
const WARNING_HTML = (x)=>`<div class="QuestionStatus"><div class="QuestionStatus-bar"><div class="QuestionStatus-bar-inner" style="background-color:red;"><strong>这个问题是<u>${x}</u>前提问的！</strong><em>提问内容可能已过时或不适用于当下</em><div class="ztext" style="color:white;">转发时请注意自己别火星了</div></div></div><div><span style="position: absolute; top: -10000px; left: -10000px;" role="log" aria-live="assertive"></span></div><div><span style="position: absolute; top: -10000px; left: -10000px;" role="log" aria-live="assertive"></span></div></div>`
const ANSWER_LAST_TIME_MODIFY = (x)=>`最后一次修改该回答距今<strong><u>${x}</u></strong>`
const ANSWER_CREATED = (x)=>`本回答于<strong><u>${x}</u></strong>前创建`
function answerAddTag (listOfAnswers) {
    for (let nodes of listOfAnswers) {
        let firstTimeNode = nodes.querySelector("meta[itemprop='dateCreated']")
        let parentNode = firstTimeNode.parentNode

        // Skip if already processed
        if (parentNode.classList.contains('time-tag-processed')) {
            continue
        }

        // Add class to mark as processed
        parentNode.classList.add('time-tag-processed')

        let answerCreatedTime = new Date(firstTimeNode.content);
        let lastModifyTime = new Date(nodes.querySelector("meta[itemprop='dateModified']").content);

        if(questionCreatedNode){
            let questionCreatedTime = new Date(questionCreatedNode.content)
            let questionLiveTime = nowTime - answerCreatedTime
            let deltaAns = answerCreatedTime - questionCreatedTime
            let deltaMod = lastModifyTime - questionCreatedTime
            let portionAns = deltaAns / questionLiveTime
            let portionMod = deltaMod / questionLiveTime

            if (deltaAns < 1000*60*10) {
                let div = document.createElement('div')
                div.style.color = "white"
                div.style.background = "black"
                div.innerHTML = "首次回答时间距问题提出时间不足10分钟，请注意甄别"
                parentNode.prepend(div)
            } else {
                parentNode.prepend(createAnswerStatusTag(`${smartDate(nowTime - answerCreatedTime, true)}`, portionAns, ANSWER_CREATED))
		if (answerCreatedTime.getTime() != lastModifyTime.getTime()){
                    parentNode.prepend(createAnswerStatusTag(`${smartDate(nowTime - lastModifyTime, true)}`, portionMod, ANSWER_LAST_TIME_MODIFY))
		}
            }
        } else {
            let span = document.createElement('span')
            span.style.background = "cyan"
            span.innerHTML = "最新" + feedFreshness(nowTime - lastModifyTime)+ "<br>原帖" + feedFreshness(nowTime - answerCreatedTime) + "<br>"
            parentNode.prepend(span)
        }
    }
}
function feedFreshness(time) {
    let day = 1000 * 60 * 60 * 24
    console.log(time)
    switch(true) {
        case(time > 365 * day ):
            return "💩💩💩💩"
        case(time > 6 * 30 * day):
            return "💩💩💩"
        case(time > 3 * 30 * day):
            return "💩💩"
        case(time > 30 * day):
            return "💩"
        case(time > 7 * day):
            return "🌷"
        case(time > day):
            return "🌷🌷"
        case(time <= day):
            return "🌷🌷🌷"
        default:
            return ""
    }
}
const callback = (mutationList, observer) => {
    for (let mutation of mutationList) {
        mutation.addedNodes.forEach((x)=> {
            let changes = x.querySelectorAll('[class="ContentItem AnswerItem"]')
            if (changes.length != 0) {
                answerAddTag(changes)
            }
        })
    }
};

const config = {childList: true, subtree:true};
const observer = new MutationObserver(callback);

observer.observe(document.querySelector("body"), config)


function createWarningTag(tag){
    var div = document.createElement('div');
    div.innerHTML = WARNING_HTML(tag).trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}

function colorgradient(p) {
    let r = 0;
    let g = 0;
    let b = 0;
    if (p <= 0.5) {
        r = 255
        g = Math.floor(p * 255.0)
    } else {
        r = Math.floor(p * 255.0)
        g = 255
    }
    return "rgb("+r+","+g+","+b+")";
}

function createAnswerStatusTag(tag, portion, tag_creator){
    let div = document.createElement('div');
    div.className = "AnswerStatus";
    div.style.background = colorgradient(portion);
    div.innerHTML = tag_creator(tag).trim();
    return div;
}

function smartDate(x, if_seconds = false){
    x=Math.round(x);
    let unit = 60*60*24*30*12*1000;
    let s = "";
    s+=(x>=unit? `${Math.floor(x/unit)}年`: "");
    x=x%unit; unit/=12;
    s+=(x>=unit? `${Math.floor(x/unit)}个月`: "");
    x=x%unit; unit/=30;
    s+=(x>=unit? `${Math.floor(x/unit)}天`: "");
    x=x%unit; unit/=24;
    s+=(x>=unit? `${Math.floor(x/unit)}小时`: "");
    if (if_seconds) {
        x=x%unit; unit/=60;
        s+=(x>=unit? `${Math.floor(x/unit)}分钟`: "");
        x=x%unit; unit/=60;
        s+=(x>=unit? `${Math.floor(x/unit)}秒`: "");
    }
    return s;
}

const f = (()=>{
    let answers = document.querySelectorAll('[class="ContentItem AnswerItem"]')
    answerAddTag(answers)

    if (questionCreatedNode){
        let questionCreatedTime = new Date(questionCreatedNode.content)
        let delta = (nowTime - questionCreatedTime)
        if(delta>=30*24*60*60*1000){
            document.querySelector('div[data-za-detail-view-path-module="QuestionDescription"]').parentNode.prepend(createWarningTag(`${smartDate(delta)}`))
        }
    }
})

window.addEventListener('load', f);
