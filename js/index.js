/**
 * 主界面运行 main 方法
 * by littlefean
 */
window.onload = function () {
    let normalOption = $(".normalOption");
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
    // 选择正方模式按钮
    $(".normal").addEventListener("click", () => {
        // 弹出选择框
        normalOption.style.display = "block";
    });

    // 正方模式设置好了的开始按钮
    $(".normalOption .play").onclick = function () {
        let gameDiv = $(".normalGameDiv");
        gameDiv.style.display = "block";
        let game = new NormalGame(gameDiv, normalOption);
        normalOption.style.display = "none";
    }


    // 解决取色器关闭后输入法无法使用
    $("input[type='color']").onblur = function () {
        window.open().close();
    }
}
