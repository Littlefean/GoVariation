class GameObject {
    static air = 0;
    static wall = 1;

    static BasePlayerNumber = 2;  // 从2开始以上都是玩家
    static isPlayer(n) {
        return n >= 2;
    }

    static eval(n) {
        for (let k in GameObject) {
            if (GameObject[k] === n) {
                return k;
            }
        }
        return "";
    }
}


