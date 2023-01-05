/**
 * 三角形棋盘，一个子有六口气
 * 这个js文件里只含有一个类
 * by littlefean
 */

class TriangleModeGame {
    /**
     * 构造方法
     * @param optionData 一个对象，包涵宽度高度等棋盘设置信息
     * @param Element 渲染时候绑定的div标签元素 就是HTML中的 .gameArea 元素
     */
    constructor(optionData, Element) {
        this.width = optionData.width;
        this.height = optionData.height;

    }

}
