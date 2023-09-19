/**
 * 方格子的围棋
 * by littlefean
 */
class NormalGame extends Game {

    // 火石移动时间
    static fireStoneMoveMs = 1000;

    /**
     *
     * @param ele 界面div
     * 界面div中有一个table子div用来存储棋盘
     * @param optionEle 设置界面信息
     */
    constructor(ele, optionEle) {
        super();
        this.width = +optionEle.querySelector(".width").value;
        this.height = +optionEle.querySelector(".height").value;
        this.bindTableEle = ele.querySelector(".table");
        this._initBoard();
        this._initFunction();
        /**
         * 动画开关
         * @type {{}}
         */
        this.animationSwitch = {
            "boardShake": false,  // 棋盘抖动
            "shockWave": true,  // 触发吃子时的 落子位置 震荡波
            connect: true,  // 棋子连接
        }
    }

    _getHoverCss() {
        return `.tableBox:hover {
            outline-color: ${this.colorList[this.turnIndex]} !important;
            outline-width: 3px !important;
            z-index: 4;
            
        }`;
    }

    /**
     * 初始化一些功能：给界面上的按钮绑定事件。例如随机下棋按钮
     * @private
     */
    _initFunction() {
        let randomStep = () => {
            let airList = [];                 // 收集所有的空气方块
            for (let y = 0; y < this.height; y++)
                for (let x = 0; x < this.width; x++)
                    if (this._get(new Point(x, y)) === GameObject.air)
                        airList.push(new Point(x, y));
            if (airList.length === 0)
                return;
            let p = airList.choiceOne();
            this.putPiece(p);
            this.rend();
        }
        $(".autoPlayRandom100").onclick = () => {
            for (let i = 0; i < 100; i++) {
                randomStep();
            }
        }
        $(".autoPlayRandom10").onclick = () => {
            for (let i = 0; i < 10; i++) {

                randomStep();
            }
        }
        let self = this;  // self 指 这个类本身的this。

        $(".animationSwitch-boardShake").onclick = function () {
            self.animationSwitch.boardShake = !self.animationSwitch.boardShake;
            this.innerText = this.innerText.split("：")[0] + "：" + self.animationSwitch.boardShake;
        }
        $(".animationSwitch-shockWave").onclick = function () {
            self.animationSwitch.shockWave = !self.animationSwitch.shockWave;
            this.innerText = this.innerText.split("：")[0] + "：" + self.animationSwitch.shockWave;
        }
        $(".animationSwitch-connect").onclick = function () {
            self.animationSwitch.connect = !self.animationSwitch.connect;
            this.innerText = this.innerText.split("：")[0] + "：" + self.animationSwitch.connect;
        }
    }

    /**
     * 根据设定初始化棋盘数据内容
     * 在结束时候会调用一次渲染。
     * @private
     */
    _initBoard() {
        super._initBoardData();
        let selectEle = $(".hinderMode");
        let modeName = selectEle.options[selectEle.selectedIndex].value;
        let stoneRate = (+$(".stoneRate").value) / 100;
        let firestoneRate = (+$(".firestoneRate").value) / 100;

        // 1/3 的点
        let Lh2 = Math.floor(this.height / 2);
        let Lw2 = Math.floor(this.width / 2);
        // 1/3 的点
        let Lh3 = Math.floor(this.height / 3);
        let Lw3 = Math.floor(this.width / 3);
        // 1/4 点
        let Lh4 = Math.floor(this.height / 4);
        let Lw4 = Math.floor(this.width / 4);
        let setWall = (x, y) => {
            if (new Point(x, y).isInSquireBoard(this.width, this.height)) {
                this.arr[y][x] = GameObject.wall;
            }
        }
        let setFireStone = (x, y) => {
            if (new Point(x, y).isInSquireBoard(this.width, this.height)) {
                this.arr[y][x] = GameObject.fireStone;
            }
        }
        let setWallLine = (p1, p2) => {
            setWall(p1.x, p1.y);
            if (p1.x === p2.x && p1.y === p2.y) {
                setWall(p1.x, p1.y);
            } else {
                let step;
                if (Math.abs(p2.x - p1.x) >= Math.abs(p2.y - p1.y)) {
                    step = Math.abs(p2.x - p1.x);
                } else {
                    step = Math.abs(p2.y - p1.y);
                }
                for (let i = 0; i < step; i++) {
                    let x = Math.round(p1.x + (p2.x - p1.x) / step * (i + 1))
                    let y = Math.round(p1.y + (p2.y - p1.y) / step * (i + 1));
                    setWall(x, y);
                }
            }
        }
        switch (modeName) {
            case "传统":

                break;
            case "随机碎石地":
                for (let y = 0; y < this.height; y++)
                    for (let x = 0; x < this.width; x++)
                        if (Math.random() < stoneRate)
                            setWall(x, y);
                break;
            case "随机火石地":
                for (let y = 0; y < this.height; y++)
                    for (let x = 0; x < this.width; x++)
                        if (Math.random() < firestoneRate)
                            setFireStone(x, y);
                break;
            case "中凸高原":
                for (let y = Lh3; y < Lh3 * 2; y++)
                    for (let x = Lw3; x < Lw3 * 2; x++)
                        setWall(x, y);
                break;
            case "中框":
                for (let y = Lh3; y < Lh3 * 2; y++) {
                    setWall(Lw3, y);
                    setWall(Lw3 * 2, y);
                }
                for (let x = Lw3; x < Lw3 * 2; x++) {
                    setWall(x, Lh3);
                    setWall(x, Lh3 * 2);
                }

                break;
            case "角落消失":
                for (let dy = 0; dy < Lh4; dy++) {
                    for (let dx = 0; dx < Lw4; dx++) {
                        setWall(dx, dy);
                        setWall(this.width - 1 - dx, dy);
                        setWall(dx, this.height - 1 - dy);
                        setWall(this.width - 1 - dx, this.height - 1 - dy);
                    }
                }
                break;
            case "九宫格分裂世界":
                for (let y = 0; y < this.height; y++) {
                    setWall(Lw3, y);
                    setWall(Lw3 * 2, y);
                }
                for (let x = 0; x < this.width; x++) {
                    setWall(x, Lh3);
                    setWall(x, Lh3 * 2);
                }
                break;
            case "田字格分裂世界":
                for (let y = 0; y < this.height; y++)
                    setWall(Lw2, y);
                for (let x = 0; x < this.width; x++)
                    setWall(x, Lh2);
                break;
            case "X分裂世界":
                setWallLine(new Point(0, 0), new Point(this.width - 1, this.height - 1));
                setWallLine(new Point(this.width - 1, 0), new Point(0, this.height - 1));
                break;


        }
        // 初始化前端显示
        this._initTableEle();
        this.rend();
    }


    /**
     * 获取周围四个位置 返回一个数组
     * @return {Point[]}
     * @private
     */
    _getRoundPoint(p) {
        super._getRoundPoint(p);
        let res = [];
        for (let roundPoint of p.getRound4()) {
            if (roundPoint.isInSquireBoard(this.width, this.height)) {
                res.push(roundPoint);
            }
        }
        return res;
    }

    /**
     * 获取棋盘p位置上的小容器格子div。
     * @param p {Point}
     * @return {Element}
     */
    _getBoxElementByLoc(p) {
        super._getBoxElementByLoc(p);
        if (p.isInSquireBoard(this.width, this.height)) {
            return this.bindTableEle.children[p.y].children[p.x];
        } else {
            console.log("访问box越界了");
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
            for (let roundP of p.getRound4()) {
                if (roundP.isInSquireBoard(this.width, this.height)) {
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
        }
        return libertySet.size();
    }

    /**
     * 世界其他生物运行活动
     * 火石移动
     */
    otherMotion() {
        // 火石移动特效
        let addFireMoveFx = (p1, p2) => {
            let dx = p2.x - p1.x;
            let dy = p2.y - p1.y;
            let fireEle = div("fireStoneMoveFx");
            fireEle.style.animationDuration = `${NormalGame.fireStoneMoveMs}ms`;
            if (dx === 1) {
                fireEle.style.animationName = "fireStoneRight";
            } else if (dx === -1) {
                fireEle.style.animationName = "fireStoneLeft";
            } else if (dy === 1) {
                fireEle.style.animationName = "fireStoneDown";
            } else if (dy === -1) {
                fireEle.style.animationName = "fireStoneTop";
            } else {
                // 火石被困住了
                console.log("有火石被困住了")
                fireEle.style.animationName = "bigShake";
            }
            this._getBoxElementByLoc(p1).appendChild(fireEle);
            setTimeout(() => {
                this._getBoxElementByLoc(p1).removeChild(fireEle);
            }, NormalGame.fireStoneMoveMs);
        };
        let moveEndLoc = new PointSet(); // 存放已经移动过的火石的位置

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let p = new Point(x, y);
                if (this._get(p) === GameObject.fireStone) {
                    if (moveEndLoc.have(p)) {
                        continue;
                    }
                    // 当前位置是一个火石，开始随机移动
                    let roundAirList = [];
                    for (let round of this._getRoundPoint(p)) {
                        if (this._get(round) === GameObject.air) {
                            roundAirList.push(round);
                        }
                    }
                    if (roundAirList.length !== 0) {
                        let moveLoc = roundAirList.choiceOne();
                        // 处理移动
                        this._set(p, GameObject.air);
                        this._set(moveLoc, GameObject.fireStone);
                        addFireMoveFx(p, moveLoc);
                        moveEndLoc.add(moveLoc);  // 移动过集合

                        let deadList = [];
                        for (let r of this._getRoundPoint(moveLoc)) {
                            if (GameObject.isPlayer(this._get(r))) {
                                // 检测这个玩家是否死了
                                if (this._libertyCount(r) === 0) {
                                    // 被火石挤死了
                                    console.log(r, "这个位置的玩家被挤死了")
                                    deadList = deadList.concat(this._getGroupSet(r).toArray());
                                    console.log(deadList);
                                    // 立刻处理掉
                                    this.dead(deadList);
                                }
                            }
                        }

                    } else {
                        // 火石被困住了
                        addFireMoveFx(p, p);
                    }
                }
            }
        }
        this.rend();
    }

    /**
     * 处理提子效果
     * @param attackArr {Point[]} 要被提的子做构成的列表
     */
    dead(attackArr) {
        // 遍历每一个要死的位置
        for (let deadPoint of attackArr) {

            // 添加一点小动画
            let dur = 2000;
            console.log(deadPoint, "dp")
            let box = this._getBoxElementByLoc(deadPoint);
            let shrinkEle = div("shrink");
            let colorStr = this.colorList[this._get(deadPoint) - GameObject.BasePlayerNumber]
            shrinkEle.style.backgroundColor = colorStr;
            shrinkEle.style.animationDuration = `${dur}ms`
            box.appendChild(shrinkEle);

            // 崩裂特效
            for (let i = 0; i < 10; i++) {
                let littleStone = div("littleStone");
                littleStone.style.backgroundColor = colorStr;
                let L = Math.random() * 5 + 1;
                littleStone.style.width = `${L}px`;
                littleStone.style.height = `${L}px`;
                littleStone.style.marginLeft = `${-L / 2}px`;
                littleStone.style.marginTop = `${-L / 2}px`;
                littleStone.style.transition = `all ${dur}ms`;
                littleStone.style.transform = `translateX(0) translateY(0)`;
                box.appendChild(littleStone);


            }

            // 缩小结束
            setTimeout(() => {
                box.removeChild(shrinkEle);
                // 添加崩裂效果
                let dur = 1000;
                let dis = 1000;  // 最远距离
                for (let littleStone of box.querySelectorAll(".littleStone")) {
                    littleStone.style.transform = `translateX(${(Math.random() * 2 - 1) * dis}px) translateY(${(Math.random() * 2 - 1) * dis}px)`;
                    setTimeout(() => {
                        // 删除特效
                        box.removeChild(littleStone);
                    }, dur);
                }
            }, dur);
            // 改为空气
            this._set(deadPoint, GameObject.air);
        }
    }

    /**
     * 在一个位置下一个棋子，
     * 世界进行一场迭代，内部数据发生改变，但是没有渲染界面
     * 此函数被触发的时候是某一个玩家下了棋了之后
     * @param putPoint {Point}
     */
    putPiece(putPoint) {
        // 当前下棋的玩家是 turIndex指向的玩家
        let nowUser = this.turnList[this.turnIndex];
        // 这个下的位置是不是只有一个空气，为了打劫检测用
        let isOne = this._getGroupSet(putPoint).size() === 1;

        this.arr[putPoint.y][putPoint.x] = nowUser;  // 先拟放置
        // 是否触发了攻击效果
        let attackFlag = false;
        let attackArr = [];
        for (let p of this._getRoundPoint(putPoint)) {
            let n = this._get(p);
            // 邻接的四个棋子中有 玩家棋子 并且这个棋子不是自己
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
            return;
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
        this.dead(attackArr);

        // 没有触发攻击效果
        if (!attackFlag) {
            // 如果放下去之后会导致自己死了，那么就不能放，需要撤回放置
            // 检测自己是不是死了
            if (this._libertyCount(putPoint) === 0) {
                this._set(putPoint, GameObject.air);
                // 不能放置！！
                console.warn("不能触发攻击，且会导致自杀");
                return;
            }
        }

        // 添加放置特效
        {
            let dur = 200;
            let box = this._getBoxElementByLoc(putPoint);
            let fxEle = div("putFx");
            fxEle.style.backgroundColor = this.colorList[this.turnIndex];
            fxEle.style.animationDuration = `${dur}ms`
            box.appendChild(fxEle);


            // 删除特效
            setTimeout(() => {
                box.removeChild(fxEle);

                // 棋盘振动特效
                if (this.animationSwitch.boardShake) {
                    this.bindTableEle.classList.add("boardShakeFx");
                    let shakeDur = 300;
                    this.bindTableEle.style.animationDuration = `${shakeDur}ms`;

                    setTimeout(() => {
                        this.bindTableEle.classList.remove("boardShakeFx");
                    }, shakeDur)
                }

                // 周围的棋子像波浪一样振动
                if (attackFlag && this.animationSwitch.shockWave) {
                    for (let y = 0; y < this.height; y++) {
                        for (let x = 0; x < this.width; x++) {
                            let p = new Point(x, y);
                            let dis = new Point(x, y).distance(putPoint);
                            setTimeout(() => {
                                // 延迟添加特效
                                let dur = 500;
                                let tableBox = this._getBoxElementByLoc(p);
                                tableBox.style.animationDuration = `${dur}ms`;
                                tableBox.classList.add("tableBoxShakeFx");
                                setTimeout(() => {
                                    tableBox.classList.remove("tableBoxShakeFx")
                                }, dur);
                            }, dis * 100);
                        }
                    }
                }

            }, dur);
        }

        // 迭代轮
        this.turnNext();
        // 其他运动
        this.otherMotion();
    }

    /**
     * 初始化棋盘界面div
     * @private
     */
    _initTableEle() {
        // $(".normalStyle").innerText = this._getHoverCss();

        this.bindTableEle.innerHTML = "";
        for (let y = 0; y < this.height; y++) {
            let lineDiv = div("tableLine");
            for (let x = 0; x < this.width; x++) {
                let tableBox = div(`tableBox`);


                /// 创建背景图片
                let bgEle = div("bz");


                let name = "";

                if (x === 0) {
                    if (y === 0) {
                        name = "left-top";
                    } else if (y === this.height - 1) {
                        name = "left-bottom";
                    } else {
                        name = "left";
                    }
                } else if (x === this.width - 1) {
                    if (y === 0) {
                        name = "right-top";
                    } else if (y === this.height - 1) {
                        name = "right-bottom";
                    } else {
                        name = "right";
                    }
                } else {
                    if (y === 0) {
                        name = "top";
                    } else if (y === this.height - 1) {
                        name = "bottom";
                    } else {
                        if ([3, 9, 15].includes(x) && [3, 9, 15].includes(y)) {
                            name = "star";
                        } else
                            name = "normal";
                    }
                }

                bgEle.style.backgroundImage = `url("img/${name}.png")`;
                bgEle.style.backgroundSize = `contain`;
                tableBox.appendChild(bgEle);

                /// 创建
                tableBox.insertBefore(this._createBlock(new Point(x, y)), tableBox.firstChild);

                lineDiv.appendChild(tableBox);
            }
            this.bindTableEle.appendChild(lineDiv);
        }
    }

    /**
     * 根据数据棋盘的某一个位置，创建一个div并返回，用于渲染函数
     * @param point
     * @return {HTMLDivElement}
     * @private
     */
    _createBlock(point) {
        let block = div(`block`);
        let n = this._get(point);

        if (GameObject.isPlayer(n)) {
            block.classList.add("playerBlock");
            block.style.backgroundColor = this.colorList[n - GameObject.BasePlayerNumber];
            // 是否开启棋子连接特效的开关
            if (this.animationSwitch.connect) {
                // 连接生动效果
                let up = point.up();
                let down = point.down();
                let left = point.left();
                let right = point.right();
                if (up.outOfBoard(this.width, this.height) || this._get(up) === n) {
                    block.style.borderTopLeftRadius = "0";
                    block.style.borderTopRightRadius = "0";
                }
                if (down.outOfBoard(this.width, this.height) || this._get(down) === n) {
                    block.style.borderBottomLeftRadius = "0";
                    block.style.borderBottomRightRadius = "0";
                }
                if (left.outOfBoard(this.width, this.height) || this._get(left) === n) {
                    block.style.borderBottomLeftRadius = "0";
                    block.style.borderTopLeftRadius = "0";
                }
                if (right.outOfBoard(this.width, this.height) || this._get(right) === n) {
                    block.style.borderBottomRightRadius = "0";
                    block.style.borderTopRightRadius = "0";
                }
            }
        } else {
            block.classList.add(GameObject.eval(n));
        }
        if (n === GameObject.fireStone) {
            // 隔一个移动时间再显示
            block.style.display = "none";
            setTimeout(() => {
                block.style.display = "block";
            }, NormalGame.fireStoneMoveMs);
        }
        if (n === GameObject.air) {
            // 添加点击事件
            block.addEventListener("click", () => {
                this.putPiece(point);
                this.rend();
            })
            //
            block.addEventListener("mouseenter", () => {
                block.style.outlineColor = `${this.colorList[this.turnIndex]}`;
            });
        }
        return block;
    }

    /**
     * 刷新渲染
     */
    rend() {
        // 先更新鼠标放上去的颜色
        $(".normalStyle").innerText = this._getHoverCss();

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let p = new Point(x, y);
                let tableBox = this._getBoxElementByLoc(p);
                tableBox.removeChild(tableBox.querySelector(".block"));
                tableBox.insertBefore(this._createBlock(p), tableBox.firstChild);
                // tableBox.appendChild(this._createBlock(p));
            }
        }
    }


}
