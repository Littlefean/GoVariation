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
        this.locToEffectBoxElement = {};

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
        //divEffect层构建
        let divEffectAreaEle = this.gameAreaElement.querySelector(".divEffectArea");
        divEffectAreaEle.style.width = boardAreaWidth + "px";
        divEffectAreaEle.style.height = boardAreaHeight + "px";
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let point = new Point(x, y);
                let pointPx = this._pointToPxPoint(point);
                // 创建div
                let effectBox = div("effectBox");
                effectBox.style.left = pointPx.x + "px";
                effectBox.style.top = pointPx.y + "px";
                divEffectAreaEle.appendChild(effectBox);
                this.locToEffectBoxElement[`${x},${y}`] = effectBox;
            }
        }
        this._changeHoverCss();

        // 三层叠在一起
        divEffectAreaEle.style.marginTop = `${-boardAreaHeight}px`;
        canvas.style.marginTop = `${-boardAreaHeight}px`;

    }

    /**
     * 给一个box创建一个点击效果
     * @param point {Point}
     * @private
     */
    _bindClickEvent(point) {
        let boxElement = this._getBoxElementByLoc(point);
        boxElement.onclick = () => {
            let putColor = this.getCurrentPlayerColor();
            if (this.placeable(point)) {
                let deadArr = this.getAttackPointList(point);  // 提子的集合
                // 数据层更新-放置+提子
                this.putPiece(point, deadArr);
                // 渲染层更新-放置
                this.putPieceRend(point, putColor);
                // 渲染层更新-提子
                this.killPieceRend(deadArr);
                // 迭代轮
                this.turnNext();
                // 渲染层更新-鼠标悬浮框css
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
        // div层
        let boxElement = this._getBoxElementByLoc(putPoint);
        let pieceElement = div("piece");
        pieceElement.style.backgroundColor = playerColor;
        boxElement.appendChild(pieceElement);
        // divEffect层
        this._getEffectBoxElementByLoc(putPoint).style.backgroundColor = playerColor;

    }

    /**
     * 渲染提子
     * @param pointArr {Point[]}
     */
    killPieceRend(pointArr) {
        for (let p of pointArr) {
            let boxEle = this._getBoxElementByLoc(p);
            boxEle.removeChild(boxEle.querySelector(".piece"));
            this._getEffectBoxElementByLoc(p).style.backgroundColor = "transparent";
        }
    }

    /**
     * 在某一个位置下一个棋子  数据层改变
     * 先验条件是可以落子
     * 这个函数上游可能被鼠标点击事件所触发，也可能被随机下棋方法所触发
     * @param putPoint {Point}
     * @param deadArr {Point[]}  触发的提子的点集
     * @return boolean 是否可以放置
     */
    putPiece(putPoint, deadArr) {
        // 当前下棋的玩家是 turIndex指向的玩家
        let curPlayer = this.getCurrentPlayer();
        this._set(putPoint, curPlayer);
        // 处理提子
        for (let deadPoint of deadArr) {
            this._set(deadPoint, GameObject.air);
        }
        return true;
    }

    /**
     * 检测当前玩家是否可以在当前位置放置棋子
     * @param putPoint
     */
    placeable(putPoint) {
        // 如果这个地方连空气都不是，那么就不能放
        if (GameObject.air !== this._get(putPoint)) {
            return false;
        }
        // 当前下棋的玩家是 turIndex指向的玩家
        let curPlayer = this.getCurrentPlayer();

        // 这个下的位置是不是只有一个空，为了打劫检测用
        let isOne = this._getGroupSet(putPoint).size() === 1;
        // todo
        // 如果能立刻触发吃子效果，则能下，
        // 如果不能立刻触发吃子效果，
        //      如果会导致自己自杀，则不能下，
        //      如果不会导致自己自杀，可以下

        if (this.attackFlag(putPoint)) {
            console.log("触发攻击");
            return true;
        } else {
            console.log("没触发攻击");
            // 判断是否会导致自己自杀
            this._set(putPoint, curPlayer);
            if (this._libertyCount(putPoint) === 0) {
                // 自杀了
                this._set(putPoint, GameObject.air);  // 撤销操作
                return false;
            } else {
                // 没有导致自己自杀，可以下
                this._set(putPoint, GameObject.air);  // 撤销操作
                return true;
            }
        }
    }

    /**
     * 在putPoint位置放置棋子是否触发吃子效果
     * @param putPoint {Point}
     */
    attackFlag(putPoint) {
        let curPlayer = this.getCurrentPlayer();
        this._set(putPoint, curPlayer);
        // 检测周围6棋子
        for (let roundPoint of this._getRoundPoint(putPoint)) {
            // 如果这个邻居是其他人
            if (GameObject.isPlayer(this._get(roundPoint)) && this._get(roundPoint) !== curPlayer) {
                // 开始统计一下是不是没气了
                if (this._libertyCount(roundPoint) === 0) {
                    // 撤销操作
                    this._set(putPoint, GameObject.air);
                    return true;
                }
            }
        }
        // 撤销操作
        this._set(putPoint, GameObject.air);
        return false;
    }

    /**
     * 先验条件：在putPoint放置棋子之后 能 触发攻击
     * 返回触发攻击之后所有要提的子 的位置
     * 如果先验条件不成立，会返回一个空集合
     * @param putPoint {Point}
     * @return {Point[]}
     */
    getAttackPointList(putPoint) {
        let res = new PointSet();
        let curPlayer = this.getCurrentPlayer();
        this._set(putPoint, curPlayer);
        // 检测周围6棋子
        for (let roundPoint of this._getRoundPoint(putPoint)) {
            // 如果这个邻居是其他人
            if (GameObject.isPlayer(this._get(roundPoint)) && this._get(roundPoint) !== curPlayer) {
                // 开始统计一下是不是没气了
                if (this._libertyCount(roundPoint) === 0) {
                    res.merge(this._getGroupSet(roundPoint));
                }
            }
        }
        this._set(putPoint, GameObject.air); // 撤销操作
        return res.toArray();
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
     * 通过坐标点拿到对应的 特效层的元素box
     * @return {*}
     * @private
     */
    _getEffectBoxElementByLoc(loc) {
        return this.locToEffectBoxElement[`${loc.x},${loc.y}`];
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
