/**
 * 三角形棋盘，一个子有六口气
 * 这个js文件里只含有一个类
 * by littlefean
 */

class TriangleModeGame extends Game {
    static T_LEN = 40; // px  正三角形的边长
    static DX = 20;
    static DY = 20;

    /**
     * 构造方法
     * @param optionData 一个对象，包涵宽度高度等棋盘设置信息
     * @param element 渲染时候绑定的div标签元素 就是HTML中的 .gameArea 元素
     */
    constructor(optionData, element) {
        super();
        this.width = optionData.width;
        this.height = optionData.height;

        // 渲染层
        this.locToBoxElement = {};  // (x,y) -> div 的映射字典，直接拿到HTML元素
        this.gameAreaElement = element;

        this._initBoardData();
        this._initRendBoard();
    }

    // 初始化渲染棋盘
    _initRendBoard() {
        let canvas = this.gameAreaElement.querySelector(".gameCanvas");
        let ctx = canvas.getContext("2d");

        let L = TriangleModeGame.T_LEN;
        let dx = TriangleModeGame.DX;  // 平移留边距
        let dy = TriangleModeGame.DY;
        let dotR = 3;  // 坐标小点点
        let H = Math.sqrt(3) * TriangleModeGame.T_LEN / 2;  // 正三角形的高

        // 先预计算 canvas 所需要的大小
        let boardAreaWidth = dx * 2 + this.width * L - L / 2;
        let boardAreaHeight = dy * 2 + (this.height - 1) * H
        canvasResize(canvas, boardAreaWidth, boardAreaHeight);
        canvas.style.marginTop = `${-boardAreaHeight}px`;
        // 填色
        drawRectFill(ctx, 0, 0, boardAreaWidth, boardAreaHeight, "rgb(216,176,77)")
        // 打点
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let locPx = this._pointToPxPoint(new Point(x, y));
                drawCircle(ctx, locPx.x, locPx.y, dotR, "rgba(100,100,100, 1)");
            }
        }
        // 连线
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let point = new Point(x, y);
                let pointPx = this._pointToPxPoint(point);
                for (let roundPoint of this._getRoundPoint(point)) {
                    let roundPointPx = this._pointToPxPoint(roundPoint);
                    drawLine(ctx, pointPx.x, pointPx.y, roundPointPx.x, roundPointPx.y);
                }
            }
        }

        // div层构建
        let divAreaEle = this.gameAreaElement.querySelector(".divArea");
        divAreaEle.style.width = boardAreaWidth + "px";
        divAreaEle.style.height = boardAreaHeight + "px";

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let point = new Point(x, y);
                let pointPx = this._pointToPxPoint(point);
                let box = div("box");
                box.style.left = pointPx.x + "px";
                box.style.top = pointPx.y + "px";
                divAreaEle.appendChild(box);
                // 更新映射字典
                this.locToBoxElement[`${x},${y}`] = box;
            }
        }
    }

    /**
     * 给一个box创建一个点击效果
     * @private
     */
    _bindClickEvent(x, y) {
        let boxElement = this._getBoxElementByLoc(x, y);
        // todo

    }

    /**
     * 通过坐标点拿到对应的 元素box
     * @return {*}
     * @private
     */
    _getBoxElementByLoc(loc) {
        super._getBoxElementByLoc(loc);
        return this.locToBoxElement[`${loc.x},${loc.y}`];
    }

    /**
     * 根据坐标点获取这个点对应的像素坐标点
     * @param p
     * @private
     */
    _pointToPxPoint(p) {
        let L = TriangleModeGame.T_LEN;
        let dx = TriangleModeGame.DX;  // 平移留边距
        let dy = TriangleModeGame.DY;
        let H = Math.sqrt(3) * TriangleModeGame.T_LEN / 2;  // 正三角形的高
        if (p.y % 2 === 0) {
            // 不需要往右平移一个半边长
            return new Point(p.x * L + dx, p.y * H + dy);
        } else {
            // 需要往右平移一个半边长
            return new Point((p.x * L) + (L / 2) + dx, p.y * H + dy);
        }
    }

    /**
     * 根据一个点，获取周围的六个点，可能由于是边缘，会少于六个
     * @param p {Point}
     * @private
     * @return Point[]
     */
    _getRoundPoint(p) {
        // 先把六个点准备好
        let leftP = new Point(p.x - 1, p.y);
        let rightP = new Point(p.x + 1, p.y);
        let leftTopP = p.y % 2 === 0 ? new Point(p.x - 1, p.y - 1) : new Point(p.x, p.y - 1);
        let rightTopP = p.y % 2 === 0 ? new Point(p.x, p.y - 1) : new Point(p.x + 1, p.y - 1);
        let leftBottomP = p.y % 2 === 0 ? new Point(p.x - 1, p.y + 1) : new Point(p.x, p.y + 1);
        let rightBottomP = p.y % 2 === 0 ? new Point(p.x, p.y + 1) : new Point(p.x + 1, p.y + 1);
        if (p.y === 0) {
            leftTopP = null;
            rightTopP = null;
        }
        if (p.y === this.height - 1) {
            leftBottomP = null;
            rightBottomP = null;
        }
        if (p.x === 0) {
            leftP = null;
            if (p.y % 2 === 0) {
                leftTopP = null;
                leftBottomP = null;
            }
        }
        if (p.x === this.width - 1) {
            rightP = null;
            if (p.y % 2 !== 0) {
                rightTopP = null;
                rightBottomP = null;
            }
        }
        let res = [leftP, leftTopP, rightTopP, rightP, rightBottomP, leftBottomP];
        return res.filter((point) => point !== null);
    }

    /**
     * 开始玩
     */
    start() {

    }
}
