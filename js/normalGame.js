/**
 * 正常的围棋
 * by littlefean
 */
class NormalGame {
    /**
     *
     * @param ele 界面div
     * 界面div中有一个table子div用来存储棋盘
     * @param optionEle 设置界面信息
     */
    constructor(ele, optionEle) {
        this.width = +optionEle.querySelector(".width").value;
        this.height = +optionEle.querySelector(".height").value;
        this.optionEle = optionEle;
        this.bindTableEle = ele.querySelector(".table");
        this.arr = [];
        this._boardInit();
        /**
         * 轮流轮
         * @type {number[]}
         */
        this.turnList = [];
        /**
         * 每个玩家上一次被吃掉的子的集合
         * @type {PointSet[]}
         */
        this.lastEatenSet = [];
        /**
         * 每个玩家对应的颜色
         * @type {string[]}
         */
        this.colorList = []
        this._initPlayer();
        this.turnIndex = 0;
    }

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
     * 获取周围四个位置
     * @private
     */
    _getRound(x, y) {
        let p = new Point(x, y);
        let res = [];
        for (let roundPoint of p.getRound4()) {
            if (roundPoint.isInSquireBoard(this.width, this.height)) {
                res.push(roundPoint);
            }
        }
        return res;
    }

    _get(p) {
        return this.arr[p.y][p.x];
    }

    _set(p, obj) {
        if (obj === undefined) {
            console.log("不能设置棋盘上一个位置为undefined");
        } else {
            this.arr[p.y][p.x] = obj;
        }
    }

    // 从一个点开始获取一连串相同颜色形成的集合
    _getGroupSet(rootPoint) {
        let n = this._get(rootPoint);
        let q = [rootPoint];
        let visitedBody = new PointSet();
        visitedBody.add(rootPoint);
        while (q.length) {
            let p = q.shift();  // 队列出
            visitedBody.add(p); // 添加访问
            // 遍历当前的周围四个
            for (let roundP of p.getRound4()) {
                if (roundP.isInSquireBoard(this.width, this.height)) {
                    if (this._get(roundP) === n && visitedBody.notHave(roundP)) {
                        // 当前这个是自己还没访问过的身体
                        q.push(roundP);
                        visitedBody.add(roundP);
                    }
                }
            }
        }
        return visitedBody;
    }

    // 检测一个位置上的棋子，BFS，这一块棋有多少口气
    _gasCount(rootPoint) {
        let n = this._get(rootPoint);
        if (GameObject.isPlayer(n)) {
            // 当前这个点不是障碍物，也不是空气
            let q = [rootPoint];
            let visitedBody = new PointSet();
            let gasSet = new PointSet();
            while (q.length) {
                let p = q.shift();  // 队列出
                visitedBody.add(p); // 添加访问
                // 遍历当前的周围四个
                for (let roundP of p.getRound4()) {
                    if (roundP.isInSquireBoard(this.width, this.height)) {
                        if (this._get(roundP) === GameObject.air) {
                            // 当前这个是空气
                            gasSet.add(roundP);
                        }
                        if (this._get(roundP) === n && visitedBody.notHave(roundP)) {
                            // 当前这个是自己还没访问过的身体
                            q.push(roundP);
                        }
                    }
                }
            }
            return gasSet.size();
        } else {
            return 0;
        }
    }

    putBlock(x, y) {
        let putPoint = new Point(x, y);
        // 此函数被触发的时候是某一个玩家下了棋了之后
        // 当前下棋的玩家是 turIndex指向的玩家
        let nowUser = this.turnList[this.turnIndex];
        // 这个下的位置是不是只有一个空气，为了打劫检测用
        let isOne = this._getGroupSet(putPoint).size() === 1;

        this.arr[y][x] = nowUser;  // 先拟放置
        // 是否触发了攻击效果
        let attackFlag = false;
        let attackArr = [];
        for (let p of this._getRound(x, y)) {
            let n = this._get(p);
            // 邻接的四个棋子中有 玩家棋子 并且这个棋子不是自己
            if (GameObject.isPlayer(n) && n !== nowUser) {
                // 从这个棋子开始BFS检测是不是死了
                if (this._gasCount(p) === 0) {
                    // 死了
                    attackFlag = true;
                    attackArr = attackArr.concat(this._getGroupSet(p).toArray())
                }
            }
        }
        console.log(attackFlag);

        // 这个位置由于打劫的原因，不能立刻下载这里
        // 原因是：
        console.log(attackFlag, this.lastEatenSet[this.turnIndex].have(putPoint), isOne);
        console.log(this.lastEatenSet);
        if (
            attackFlag  // 这个位置下了之后立刻能吃掉对方子
            && this.lastEatenSet[this.turnIndex].have(putPoint)  // 这个位置上一次被吃掉过
            && isOne  // 这个位置也恰好只有一个空
        ) {
            // 撤销放置
            this._set(putPoint, GameObject.air);
            console.log("由于打劫不能放置");
            return;
        }

        // alert(222222)
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
        for (let deadPoint of attackArr) {
            this._set(deadPoint, GameObject.air);
        }

        // 没有触发攻击效果
        if (!attackFlag) {
            // 如果放下去之后会导致自己死了，那么就不能放，需要撤回放置
            // 检测自己是不是死了
            if (this._gasCount(putPoint) === 0) {
                this._set(putPoint, GameObject.air);
                // 不能放置！！
                console.log("不能触发攻击，且会导致自杀");
                return;
            }
        }

        // // 更新上次放置
        // this.lastPut[this.turnIndex] = putPoint;
        // 迭代轮
        this.turnIndex++;
        this.turnIndex %= this.turnList.length;

    }

    /**
     * 渲染
     */
    rend() {
        this.bindTableEle.innerHTML = "";
        for (let y = 0; y < this.height; y++) {
            let lineDiv = div("tableLine");
            for (let x = 0; x < this.width; x++) {
                let block = div(`block`);
                let n = this._get(new Point(x, y));
                if (GameObject.isPlayer(n)) {
                    block.classList.add("playerBlock");
                    block.style.backgroundColor = this.colorList[n - GameObject.BasePlayerNumber];
                }

                if (this.arr[y][x] === GameObject.air) {

                    // 添加点击事件
                    block.addEventListener("click", () => {
                        this.putBlock(x, y);
                        this.rend();
                    })
                }
                lineDiv.appendChild(block);
            }
            this.bindTableEle.appendChild(lineDiv);
        }
    }

    // 初始化
    _boardInit() {
        for (let y = 0; y < this.height; y++) {
            let line = [];
            for (let x = 0; x < this.width; x++) {
                line.push(GameObject.air);
            }
            this.arr.push(line);
        }
        // rend
        this.rend();
    }
}
