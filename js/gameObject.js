class GameObject {
    static air = 0;
    static wall = 1;
    static black = 2;
    static white = 3;
    static red = 4;

    static Players = [2, 3, 4];

    static eval(n) {
        for (let k in GameObject) {
            if (GameObject[k] === n) {
                return k;
            }
        }
        return "";
    }
}


