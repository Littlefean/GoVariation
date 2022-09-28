/**
 *
 * by littlefean
 */
function $(queryStr) {
    return document.querySelector(queryStr);
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




