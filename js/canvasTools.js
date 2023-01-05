/**
 * 存放一些关于canvas的封装工具，辅助函数
 * by littlefean
 */


// 获取设备像素比、canvas解决模糊问题用的

let PR = window.devicePixelRatio;


/**
 * canvas绘制标准化
 * @param n
 * @return {number}
 */
function standardize(n) {
    return Math.floor(n * PR);
}

/**
 * 在canvas上下文对象中画一条线，
 * 这条线是对齐了像素点的，之所以要对齐像素点就是要解决模糊的效果
 * 也就是传入的参数会默认取整
 * @param ctx
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param lineWidth
 * @param color
 * @param isDash
 */
function drawLine(ctx, x1, y1, x2, y2,
                  lineWidth = 1, color = "black", isDash = false) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.beginPath();
    if (isDash) {
        ctx.setLineDash([5, 5]);
    } else {
        ctx.setLineDash([]);
    }
    ctx.moveTo(standardize(x1), standardize(y1));
    ctx.lineTo(standardize(x2), standardize(y2));
    ctx.stroke();
}

/**
 * 画一个圆
 * @param ctx
 * @param x
 * @param y
 * @param r
 * @param fillColor 圆形填充颜色 格式是 rgba(xx,xx,xx) 这样的字符串
 * @param lineWidth 边缘线粗细
 * @param strokeColor 边框颜色
 */
function drawCircle(ctx, x, y, r, fillColor,
                    lineWidth = 1,
                    strokeColor = "black",) {
    ctx.lineWidth = lineWidth;
    // ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(standardize(x), standardize(y), standardize(r), 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}

/**
 * 画矩形边框
 * @param ctx 上下文对象
 * @param x 左上角顶点
 * @param y 左上角顶点
 * @param width 宽度
 * @param height 高度
 * @param color
 * @param lineWidth
 */
function drawRectStroke(ctx, x, y, width, height, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = standardize(lineWidth);
    ctx.lineJoin = "round";
    ctx.strokeRect(standardize(x), standardize(y), standardize(width), standardize(height));
}


/**
 * 画矩形填充
 * @param ctx
 * @param x 左上角顶点
 * @param y 左上角顶点
 * @param width
 * @param height
 * @param color
 */
function drawRectFill(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(standardize(x), standardize(y), standardize(width), standardize(height));
}

/**
 * 写文字
 * @param ctx
 * @param content {String}
 * @param x {Number} px
 * @param y {Number} px
 * @param color 颜色字符串
 * @param fontSize {Number} px
 */
function writeFont(ctx, content, x, y, color = "black", fontSize = 20) {
    ctx.fillStyle = color;
    ctx.font = `${standardize(fontSize)}px "微软雅黑"`;           //设置字体
    // 默认中心对齐

    /**
     *   |
     * --+-----
     *   |
     *   也就是填入的坐标点是整个文字的中心坐标点
     */

    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(content, standardize(x), standardize(y));

}

/**
 * 安全、全面地更改canvas的大小
 * @param canvasElement
 * @param w
 * @param h
 */
function canvasResize(canvasElement, w, h) {
    canvasElement.width = w * PR;
    canvasElement.height = h * PR;
    canvasElement.style.width = `${w}px`;
    canvasElement.style.height = `${h}px`;
    // 上下文对象的绘制起始点稍微平移一丝丝
    canvasElement.getContext("2d").translate(0.5 * PR, 0.5 * PR);
}
