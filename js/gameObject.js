/**
 * 枚举类
 * 此类不要实例化对象，仅作为棋盘的格子中可能出现的东西使用。
 */
class GameObject {
    /**
     * 空气
     * @type {number}
     */
    static air = 0;
    /**
     * 墙体、石头
     * @type {number}
     */
    static wall = 1;
    /**
     * 火石
     * @type {number}
     */
    static fireStone = -1;
    // 上面和css同名

    /**
     * 从2开始以上都是玩家，包括2
     * @type {number}
     */
    static BasePlayerNumber = 2;

    /**
     * 传入一个数字，解析这个数字是否是玩家数字
     * @param n
     * @return {boolean}
     */
    static isPlayer(n) {
        return n >= 2;
    }

    /**
     * 解析一个数字，返回这个数字表示的GameObject的字符串。
     * 用于渲染时候给div添加对应的css类名
     * @param n
     * @return {string}
     */
    static eval(n) {
        for (let k in GameObject) {
            if (GameObject[k] === n) {
                return k;
            }
        }
        return "";
    }
}


