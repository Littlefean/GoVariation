/**
 * 坐标点类
 * 用来表示二维数组中的坐标点
 */
class Point {
    /**
     * 坐标点构造方法
     * @param x {Number}
     * @param y {Number}
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * 获取一个坐标的周围四个点，以数组形式返回
     * @return {Point[]}
     */
    getRound4() {
        return [
            new Point(this.x + 1, this.y),
            new Point(this.x - 1, this.y),
            new Point(this.x, this.y + 1),
            new Point(this.x, this.y - 1),
        ];
    }

    toString() {
        return `(x:${this.x},y:${this.y})`;
    }

    /**
     * 这个点是否在矩形棋盘内部
     * @param width
     * @param height
     */
    isInSquireBoard(width, height) {
        return (0 <= this.x && this.x < width) && (0 <= this.y && this.y < height);
    }

    outOfBoard(width, height) {
        return !((0 <= this.x && this.x < width) && (0 <= this.y && this.y < height));
    }

    /**
     * 转化成唯一的int值。用于点集类解析用。
     * @return {*}
     */
    hashCode() {
        return 100_0000 * this.x + this.y;
    }

    /**
     * 用于点集类解析用
     * @param b
     * @return {Point}
     */
    static evalHashCode(b) {
        let x = Math.floor(b / 100_0000);
        let y = b % 100_0000;
        return new Point(x, y);
    }

    /**
     * 返回两个点之间的直线距离
     * @param p
     * @return {number}
     */
    distance(p) {
        return ((this.x - p.x) ** 2 + (this.y - p.y) ** 2) ** 0.5
    }

    /**
     * 返回一个特殊实例
     * @return {Point}
     * @constructor
     */
    static NegOne() {
        return new Point(-1, -1);
    }

    up() {
        return new Point(this.x, this.y - 1);
    }

    down() {
        return new Point(this.x, this.y + 1);
    }

    left() {
        return new Point(this.x - 1, this.y);
    }

    right() {
        return new Point(this.x + 1, this.y);
    }
}


/**
 * 点集合
 * 封装了js原生的set。
 */
class PointSet {
    constructor() {
        this.s = new Set();
    }

    add(point) {
        this.s.add(point.hashCode());
    }

    have(point) {
        return this.s.has(point.hashCode());
    }

    clear() {
        this.s.clear();
    }

    notHave(point) {
        return !this.have(point);
    }

    remove(point) {
        if (this.s.has(point)) {
            this.s.delete(point.hashCode());
        }
    }

    /**
     * 把另一个点集里的点合并到自己的集合里
     * @param pointSet {PointSet}
     */
    merge(pointSet) {
        for (let p of pointSet.toArray()) {
            this.add(p);
        }
    }

    size() {
        return this.s.size;
    }

    toArray() {
        let res = [];
        for (let v of this.s) {
            res.push(Point.evalHashCode(v));
        }
        return res;
    }
}
