关于renderer 中的diff算法中的 newIndexToOldIndexMap 和最长递增子序列的一些理解
1. newIndexToOldIndexMap这个数组的索引是当前子节点顺序的一个体现
2. 数组中的值 描述的是当前节点在老节点中的顺序
3. 索引递增, 值也递增, 则说明这些节点在前后dom树中的顺序是不变的
