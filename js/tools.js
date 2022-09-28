/**
 *
 * by littlefean
 */
function $(queryStr) {
    if (document.querySelector(queryStr) === null) {
        console.log("选择器没有找到");
    }
    return document.querySelector(queryStr);
}

Array.prototype.choiceOne = function () {
    let r = Math.floor(Math.random() * this.length);
    return this[r];
}

function div(classNameString, content = "",) {

    let res = document.createElement("div");
    if (content !== "") {
        res.innerText = content;
    }
    for (let className of classNameString.split(" ")) {
        res.classList.add(className);
    }

    return res;
}


/**
 * 随机一个十六进制颜色
 */
function randomColor() {
    let strNormal = (str) => {
        if (str.length === 1) {
            return "0" + str;
        }
        return str;
    }
    let r = Math.floor(Math.random() * 256).toString(16);
    let g = Math.floor(Math.random() * 256).toString(16);
    let b = Math.floor(Math.random() * 256).toString(16);
    return `#${strNormal(r)}${strNormal(g)}${strNormal(b)}`;

}
