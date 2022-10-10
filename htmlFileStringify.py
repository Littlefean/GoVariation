# -*- encoding: utf-8 -*-
"""
此模块用于将html文件转化成一个html字符串
将所有的css和js集成在一起
PyCharm htmlFileStringify
2022年07月28日
by littlefean
"""
import os


def lineStrGetComment(string: str) -> str:
    """
    获取一个字符串中双引号内部的东西
    如果有多对双引号，则找最后一对双引号
    :return:
    """
    indexArr = [i for i, char in enumerate(string) if char == "\""]
    if len(indexArr) < 2:
        return ""

    left = indexArr[-2]
    right = indexArr[-1]
    return string[left + 1: right]


def htmlStringify(filePath: str) -> str:
    print(1)
    try:
        print(11)

        folderPath = os.sep.join(filePath.split(os.sep)[:-1])
        print(folderPath)
        print(111)
        content = ""
        with open(filePath, encoding="utf-8") as f:
            arr = f.readlines()
        for line in arr:
            if line.strip().startswith("<link "):
                # 替换css文件
                with open(lineStrGetComment(line), encoding="utf-8") as f:
                    content += f"<style>{f.read()}</style>"
            elif line.strip().startswith("<script src="):
                # 替换js文件
                with open(lineStrGetComment(line), encoding="utf-8") as f:
                    content += f"<script>{f.read()}</script>"
            else:
                content += line
    except Exception as e:
        return str(e)
    return content


def main():
    with open("show/index.html", "w", encoding="utf-8") as f:
        f.write(htmlStringify("index.html"))
    return None


if __name__ == "__main__":
    main()
