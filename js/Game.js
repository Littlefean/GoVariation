/**
 * 这是 一个父类
 * 表示多人围棋游戏类
 * 基于三角形棋盘和传统棋盘游戏 都继承这个类
 * by littlefean
 */
class Game {
    constructor() {
        /**
         * 轮流轮 [2, 3, 4]  表示三个玩家在下棋
         * 玩家从2开始编号递增
         * @type {number[]}
         */
        this.turnList = [];
        this.turnIndex = 0;  // 表示当前是turList[i] 玩家
        /**
         * 每个玩家上一次被吃掉的子的集合
         * @type {PointSet[]}
         */
        this.lastEatenSet = [];
        /**
         * 每个玩家对应的颜色
         * @type {string[]}
         */
        this.colorList = [];
        // 默认宽度高度属性是19*19
        this.width = 19;
        this.height = 19;
        /**
         * 存放棋子数据的二维数组
         * 经过思考发现 正方形棋盘，三角形，六边形均可用二维数组存放
         * @type {Number[][]}
         */
        this.arr = [];

        this._initPlayer();
    }

    // 数据层初始化
    _initBoardData() {
        this.arr = [];
        for (let y = 0; y < this.height; ++y) {
            let line = [];
            for (let x = 0; x < this.width; x++) {
                line.push(GameObject.air);
            }
            this.arr.push(line);
        }
    }

    /**
     * 迭代轮
     * [2, 3, 4]  ===> [2, 3, 4]
     *  ^                  ^
     */
    turnNext() {
        this.turnIndex++;
        this.turnIndex %= this.turnList.length;
    }

    /**
     * 获取当前是要哪个玩家下棋了
     * @return {number} 玩家编号
     */
    getCurrentPlayer() {
        return this.turnList[this.turnIndex];
    }

    /**
     * 获取当前要下棋的玩家的颜色
     * @return {string}
     */
    getCurrentPlayerColor() {
        return this.colorList[this.turnIndex];
    }

    /**
     * 获取数据棋盘上一个坐标位置是什么
     * @param p {Point} 传入的是坐标点类型
     * @return {Number} 返回的是数字
     */
    _get(p) {
        return this.arr[p.y][p.x];
    }

    /**
     * 设定数据棋盘中的物品
     * @param p 设定的位置的坐标
     * @param obj {Number}
     */
    _set(p, obj) {
        if (obj === undefined) {
            console.warn("不能设置棋盘上一个位置为undefined");
        } else {
            this.arr[p.y][p.x] = obj;
        }
    }

    /**
     * 初始化玩家颜色信息、上一轮被吃掉的位置数组信息
     */
    _initPlayer() {
        let playerNumber = +$(".playerNumber").value;
        let userColorList = $(".userColorList");
        for (let i = 0; i < playerNumber; i++) {
            this.turnList.push(i + GameObject.BasePlayerNumber);
            this.lastEatenSet.push(new PointSet());
            this.colorList.push(userColorList.children[i].value)
        }
    }

    /**
     * 根据一个点位置，获取周围一圈点的位置，返回一个数组
     * @param p {Point}
     * 这个父类的函数只检测是否越界。具体实现由子类实现
     */
    _getRoundPoint(p) {
        this.__testLoc(p);
        return []
    }

    /**
     * 检测一个坐标是否不在二维数组内
     * @param p
     * @private
     */
    __testLoc(p) {
        if (p === undefined) {
            console.log("传入坐标点是undef")
        }
        if (p === null) {
            console.log("传入坐标点是null")
        }
        if (typeof p !== "object") {
            console.log(p, "不是obj")
        }
        if (!((0 <= p.x && p.x < this.width) && (0 <= p.y && p.y < this.height))) {
            console.warn("数据越界 105");
        }
    }

    /**
     * 获取棋盘p位置上的小容器格子div。
     * 这个父类的函数只做一个检测
     * @param p {Point}
     * @return {Element}
     */
    _getBoxElementByLoc(p) {
        this.__testLoc(p)
    }

}
