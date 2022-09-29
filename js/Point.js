/**
 *
 * by littlefean
 */
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

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

    hashCode() {
        return 100_0000 * this.x + this.y;
    }

    static evalHashCode(b) {
        let x = Math.floor(b / 100_0000);
        let y = b % 100_0000;
        return new Point(x, y);
    }

    distance(p) {
        return ((this.x - p.x) ** 2 + (this.y - p.y) ** 2) ** 0.5
    }

    // 返回一个特殊实例
    static NegOne() {
        return new Point(-1, -1);
    }
}
let pp = new Point(1, 1);
console.log(typeof pp);

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
