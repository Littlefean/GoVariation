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

    // 初始化功能：给界面上的其他按钮绑定事件
    _initFunction() {

    }

    /**
     * 检测一个位置上的棋子，BFS，这一块棋有多少口气
     * @param rootPoint
     * @return {number}
     */
    _libertyCount(rootPoint) {
        let n = this._get(rootPoint);
        if (!GameObject.isPlayer(n)) {
            return 0;
        }
        // 当前这个点不是障碍物，也不是空气
        let q = [rootPoint];
        let visitedBody = new PointSet();
        visitedBody.add(rootPoint); // 添加访问
        let libertySet = new PointSet();
        while (q.length) {
            let p = q.shift();  // 队列出
            // 遍历当前的周围四个
            for (let roundP of this._getRoundPoint(p)) {
                if (this._get(roundP) === GameObject.air) {
                    // 当前这个是空气
                    libertySet.add(roundP);
                }
                if (this._get(roundP) === n && visitedBody.notHave(roundP)) {
                    // 当前这个是自己还没访问过的身体
                    q.push(roundP);
                    visitedBody.add(roundP);
                }
            }
        }
        return libertySet.size();
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
        // 打点
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let locPx = this._pointToPxPoint(new Point(x, y));
                drawCircle(ctx, locPx.x, locPx.y, dotR, "rgba(100,100,100, 1)");
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
                // 绑定点击效果
                this._bindClickEvent(point);
            }
        }
        this._changeHoverCss();
    }

    /**
     * 给一个box创建一个点击效果
     * @param point {Point}
     * @private
     */
    _bindClickEvent(point) {
        let boxElement = this._getBoxElementByLoc(point);
        // todo
        boxElement.onclick = () => {
            let putColor = this.getCurrentPlayerColor();
            if (this.placeable(point)) {
                this.putPiece(point);
                this.putPieceRend(point, putColor);
                this._changeHoverCss();
            }
        }
    }

    _changeHoverCss() {
        $(".selectStyle").innerText = `
        .divArea .box:hover {
            border-color: ${this.colorList[this.turnIndex]} !important;
            z-index: 4;
        }`;
    }

    /**
     * 在某一个位置下一个棋子-渲染层
     * @param putPoint {Point}
     * @param playerColor {String}
     */
    putPieceRend(putPoint, playerColor) {
        console.log(playerColor);
        console.log(this.turnIndex, this.colorList)
        let boxElement = this._getBoxElementByLoc(putPoint);
        let pieceElement = div("piece");
        pieceElement.style.backgroundColor = playerColor;
        boxElement.appendChild(pieceElement);

    }

    /**
     * 在某一个位置下一个棋子  数据层改变
     *
     * 这个函数上游可能被鼠标点击事件所触发，也可能被随机下棋方法所触发
     * @param putPoint {Point}
     * @return boolean 是否可以放置
     */
    putPiece(putPoint) {
        // 当前下棋的玩家是 turIndex指向的玩家
        let nowUser = this.turnList[this.turnIndex];
        // 这个下的位置是不是只有一个空，为了打劫检测用
        let isOne = this._getGroupSet(putPoint).size() === 1;

        this.arr[putPoint.y][putPoint.x] = nowUser;  // 先拟放置
        // 是否触发了攻击效果
        let attackFlag = false;
        let attackArr = [];
        for (let p of this._getRoundPoint(putPoint)) {
            let n = this._get(p);
            // 邻接的6个棋子中有 玩家棋子 并且这个棋子不是自己
            if (GameObject.isPlayer(n) && n !== nowUser) {
                // 从这个棋子开始BFS检测是不是死了
                if (this._libertyCount(p) === 0) {
                    // 死了
                    attackFlag = true;
                    attackArr = attackArr.concat(this._getGroupSet(p).toArray())
                }
            }
        }

        // 这个位置由于打劫的原因，不能立刻下载这里
        // 原因是：
        if (
            attackFlag  // 这个位置下了之后立刻能吃掉对方子
            && this.lastEatenSet[this.turnIndex].have(putPoint)  // 这个位置上一次被吃掉过
            && isOne  // 这个位置也恰好只有一个空
        ) {
            // 撤销放置
            this._set(putPoint, GameObject.air);
            console.warn("由于打劫不能放置");
            return false;
        }

        // 更新每个玩家的上一轮被吃位置
        for (let i = 0; i < this.turnList.length; i++) {
            this.lastEatenSet[i].clear();
            for (let deadPoint of attackArr) {
                if (this._get(deadPoint) === this.turnList[i]) {
                    this.lastEatenSet[i].add(deadPoint);
                }
            }
        }
        // 处理提子效果
        this.removePieceData(attackArr);

        // 没有触发攻击效果
        if (!attackFlag) {
            // 如果放下去之后会导致自己死了，那么就不能放，需要撤回放置
            // 检测自己是不是死了
            if (this._libertyCount(putPoint) === 0) {
                this._set(putPoint, GameObject.air);
                // 不能放置！！
                console.warn("不能触发攻击，且会导致自杀");
                return false;
            }
        }
        // 迭代轮
        this.turnNext();
        return true;
    }

    /**
     * 检测当前玩家是否可以在当前位置放置棋子
     * @param putPoint
     */
    placeable(putPoint) {
        if (GameObject.air !== this._get(putPoint)) {
            return false;
        }
        // 当前下棋的玩家是 turIndex指向的玩家
        let nowUser = this.turnList[this.turnIndex];
        // 这个下的位置是不是只有一个空，为了打劫检测用
        let isOne = this._getGroupSet(putPoint).size() === 1;
        // todo
        return true;
    }


    /**
     * 处理提子 - 数据层
     * @param attackArr {Point[]} 要被提的子做构成的列表
     */
    removePieceData(attackArr) {
        for (let deadPoint of attackArr) {
            this._set(deadPoint, GameObject.air);
        }
    }

    /**
     * 处理提子 - 渲染层
     * @param attackArr {Point[]} 要被提的子做构成的列表
     */
    removePieceElement(attackArr) {
        for (let deadPoint of attackArr) {
            // todo
        }
    }

    /**
     * 从一个点开始获取一连串相同颜色形成的集合
     * @param rootPoint
     * @return {PointSet}
     * @private
     */
    _getGroupSet(rootPoint) {
        let n = this._get(rootPoint);
        let q = [rootPoint];
        let visitedBody = new PointSet();
        visitedBody.add(rootPoint);
        while (q.length) {
            let p = q.shift();  // 队列出
            visitedBody.add(p); // 添加访问
            // 遍历当前的周围
            for (let roundP of this._getRoundPoint(p)) {
                if (this._get(roundP) === n && visitedBody.notHave(roundP)) {
                    // 当前这个是自己还没访问过的身体
                    q.push(roundP);
                    visitedBody.add(roundP);
                }
            }
        }
        return visitedBody;
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
