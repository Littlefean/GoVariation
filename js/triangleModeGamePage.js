/**
 * 三角形游戏界面的js代码
 * by littlefean
 */

window.onload = function () {
    pageInit();
    btnInit();
}

/**
 * 界面初始化按钮
 */
function pageInit() {
    $(".gameArea").style.display = "none";
    // 玩家数量更改
    let playerNumberInput = $(".playerNumber");
    playerNumberInput.onchange = function () {
        let colorList = $(".userColorList");
        let curNum = colorList.childElementCount;
        if (+playerNumberInput.value > curNum) {
            // 增加颜色数量
            for (let i = 0; i < +playerNumberInput.value - curNum; i++) {
                let cInput = document.createElement("input");
                cInput.type = "color";
                cInput.value = randomColor();
                colorList.appendChild(cInput);
            }
        } else if (+playerNumberInput.value < colorList.childElementCount) {
            // 减少玩家数量，直接重新更改，颜色全部随机得了
            colorList.innerHTML = "";
            for (let i = 0; i < +playerNumberInput.value; i++) {
                let cInput = document.createElement("input");
                cInput.type = "color";
                cInput.value = randomColor();
                colorList.appendChild(cInput);
            }
        }
    }
}

/**
 * 初始化各种按钮
 */
function btnInit() {
    let gameOptionElement = $(".gameOption");
    let gameAreaElement = $(".gameArea")
    // 开始游戏按钮
    $(".play").onclick = function () {
        gameAreaElement.style.display = "block";

        let h = +gameOptionElement.querySelector(".height").value;
        let w = +gameOptionElement.querySelector(".width").value;
        let playersCount = +gameOptionElement.querySelector(".playerNumber").value;

        let data = {
            height: h,
            width: w,
            playersCount: playersCount,
        }
        let game = new TriangleModeGame(data, gameAreaElement);
        game.start();
    }
}
