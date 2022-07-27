### 关于renderer 中的diff算法中的 newIndexToOldIndexMap 和最长递增子序列的一些理解
2. newIndexToOldIndexMap这个数组的索引是当前子节点顺序的一个体现
3. 数组中的值 描述的是当前节点在老节点中的顺序
4. 索引递增, 值也递增, 则说明这些节点在前后dom树中的顺序是不变的


### compile-core
1. parse 将template中的字符创转换成ast树  => parse的产物为ast
2. transform 将上面的ast树进一步处理, 直接在ast树上进行修改, 这一步不返回任何东西
3. codegen 将经过transform处理过的ast转换成代码字符串
4. 使用new Function 处理(3)中的代码字符串, 生成一个render函数
5. 通过runtime-core中的方法调用将(4)中的render函数执行, 获取到虚拟node
