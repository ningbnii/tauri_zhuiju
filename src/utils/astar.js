class BinaryHeap {
  constructor(compareFn) {
    this.heap = []
    this.compareFn = compareFn
  }

  // 插入
  insert(value) {
    this.heap.push(value)
    this.heapifyUp(this.heap.length - 1)
  }

  // 删除
  remove() {
    if (this.heap.length === 0) {
      return undefined
    }
    if (this.heap.length === 1) {
      return this.heap.pop()
    }
    const removedValue = this.heap[0]
    this.heap[0] = this.heap.pop()
    this.heapifyDown(0)
    return removedValue
  }

  // 向上调整堆 (最小堆)
  heapifyUp(index) {
    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2)
      if (this.compareFn(this.heap[parentIndex], this.heap[index]) > 0) {
        ;[this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]]
        index = parentIndex
      } else {
        break
      }
    }
  }

  // 向下调整堆 (最小堆)
  heapifyDown(index) {
    const length = this.heap.length
    while (index < length) {
      let leftIndex = index * 2 + 1
      let rightIndex = index * 2 + 2
      let minIndex = index
      // 与左子节点比较
      if (leftIndex < length && this.compareFn(this.heap[minIndex], this.heap[leftIndex]) > 0) {
        minIndex = leftIndex
      }
      // 与右子节点比较
      if (rightIndex < length && this.compareFn(this.heap[minIndex], this.heap[rightIndex]) > 0) {
        minIndex = rightIndex
      }
      // 如果最小的是自己，则不用调整
      if (minIndex === index) {
        break
      }
      // 否则交换
      ;[this.heap[index], this.heap[minIndex]] = [this.heap[minIndex], this.heap[index]]
      index = minIndex
    }
  }
}

// 优先队列 (最小优先级队列)
class PriorityQueue {
  constructor(compareFn) {
    this.heap = new BinaryHeap(compareFn)
  }

  // 入队
  enqueue(value) {
    this.heap.insert(value)
  }

  // 出队
  dequeue() {
    return this.heap.remove()
  }

  // 优先级最高的元素 (最小堆中是优先级最小的元素)
  peek() {
    return this.heap.heap[0]
  }

  // 队列是否为空
  isEmpty() {
    return this.heap.heap.length === 0
  }

  // 队列大小
  size() {
    return this.heap.heap.length
  }
}

// 构造节点类
class Node {
  // 数字序列值
  constructor(path, to, dimension, parent = null, clickNum = '', direction = '') {
    this.path = path // 节点路径, 1,2,3,4,5,6,7,8,0
    this.to = to // 目标状态 1,2,3,4,5,6,7,8,0
    this.dimension = dimension // 维度
    this.index = path.split(',').indexOf('0') // 空白格位置
    this.parent = parent // 父节点
    this.Gscore = this.calcGscore() // 从初始状态到当前状态的代价
    this.Hscore = this.calcHscore() // 从当前状态到目标状态的代价
    this.Fscore = this.calcFscore() // F = G + H
    this.clickNum = clickNum // 点击的数字
    // 记录移动方向
    this.direction = direction // up, down, left, right
  }

  // 计算Gscore
  calcGscore() {
    return this.parent ? this.parent.Gscore + 1 : 0
  }

  // 计算Hscore，曼哈顿距离
  calcHscore() {
    let count = 0
    let path = this.path.split(',')
    let to = this.to.split(',')
    for (let i = 0; i < path.length; i++) {
      if (path[i] == 0) continue
      let x = Math.abs((i % this.dimension) - (to.indexOf(path[i]) % this.dimension))
      let y = Math.abs(Math.floor(i / this.dimension) - Math.floor(to.indexOf(path[i]) / this.dimension))
      count += x + y
    }
    return count
  }

  // 计算Fscore
  calcFscore() {
    return this.Gscore + this.Hscore
  }

  // 交换
  // ch: 交换的位置, 0-8, 0表示与上下左右交换
  exchange(ch, direction) {
    let newPath = this.path.split(',')
    let temp = newPath[this.index]
    let clickNum = newPath[ch]
    newPath[this.index] = newPath[ch]
    newPath[ch] = temp
    // 交换后的新状态
    newPath = newPath.join(',')

    // 返回newPath和点击的数字
    return { path: newPath, clickNum: clickNum, direction: direction }
  }

  // 上移
  moveUp() {
    if (this.index < this.dimension) return false
    return this.exchange(this.index - this.dimension, 'up')
  }

  // 下移
  moveDown() {
    if (this.index >= this.dimension * (this.dimension - 1)) return false
    return this.exchange(this.index + this.dimension, 'down')
  }

  // 左移
  moveLeft() {
    if (this.index % this.dimension == 0) return false
    return this.exchange(this.index - 1, 'left')
  }

  // 右移
  moveRight() {
    if (this.index % this.dimension == this.dimension - 1) return false
    return this.exchange(this.index + 1, 'right')
  }

  // 判断是否为目标状态
  isEnd() {
    return this.path == this.to
  }
}

class Astar {
  constructor(start) {
    this.dimension = 3
    this.numLen = this.dimension * this.dimension
    this.moveNumArr = []
    this.start = start
  }

  // 阶乘
  factorial(n) {
    let result = 1
    for (let i = 1; i <= n; i++) {
      result *= i
    }
    return result
  }

  // 康拓展开
  cantor(path) {
    // const fac = [1, 1, 2, 6, 24, 120, 720, 5040, 40320] // 阶乘，用于计算康拓展开，fac[i]表示i的阶乘
    const fac = []
    path = path.split(',')
    for (let i = 0; i < this.numLen; i++) {
      fac[i] = this.factorial(i)
    }

    let sum = 0
    for (let i = 0; i < this.numLen; i++) {
      let cnt = 0
      for (let j = i + 1; j < this.numLen; j++) {
        if (path[j] < path[i]) cnt++
      }
      sum += cnt * fac[this.numLen - 1 - i]
    }
    return sum
  }

  // 初始化
  init() {
    // let openList = [] // 开放列表
    // 定义一个优先队列，openList，用于存放待扩展的节点
    const compareFn = (a, b) => a.Fscore - b.Fscore
    this.openList = new PriorityQueue(compareFn)

    this.closeList = [] // 关闭列表
    // 根据维度生成目标状态
    let end = Array.from({ length: this.numLen }, (v, k) => k + 1).join(',')
    end = end.slice(0, end.length - 1) + '0'
    let node = new Node(this.start, end, this.dimension) // 初始节点
    // openList.push(node) // 将初始节点加入开放列表
    this.openList.enqueue(node)
  }

  // A*算法
  calc() {
    this.init()
    while (!this.openList.isEmpty()) {
      // 从优先队列中取出F值最小的节点
      let current = this.openList.dequeue()

      this.closeList[current.path] = true
      // console.log(current.moveNum)

      // 找到当前节点的子节点
      let up = current.moveUp()
      let down = current.moveDown()
      let left = current.moveLeft()
      let right = current.moveRight()

      // 遍历子节点
      for (let i of [up, down, left, right]) {
        let $insertOpenlistFlag = true
        if (i) {
          let newNode = new Node(i.path, current.to, this.dimension, current, i.clickNum, i.direction)

          if (this.closeList[newNode.path]) {
            continue
          }

          // 如果子节点在openList中，比较新的G值和原来的G值，如果更小，并更新父节点
          // 遍历openList，找到相同状态的节点
          for (let j = 0; j < this.openList.heap.length; j++) {
            if (this.openList.heap[j].path == newNode.path) {
              $insertOpenlistFlag = false
              // 如果新的G值更小
              if (newNode.Gscore < this.openList.heap[j].Gscore) {
                this.openList.heap[j] = newNode
                break
              }
            }
          }

          if ($insertOpenlistFlag) {
            this.openList.enqueue(newNode)
            // openList.push(newNode)
          }

          // 如果子节点为目标节点，结束
          if (newNode.isEnd()) {
            // 根据父节点链找到路径
            let clickNumArr = []
            let temp = newNode
            while (temp) {
              temp.clickNum && clickNumArr.unshift(temp.clickNum)
              // 如果和parent的direction一样，则继续往上找
              if (temp.parent && temp.direction === temp.parent.direction) {
                temp = temp.parent.parent
              } else {
                temp = temp.parent
              }
            }
            return clickNumArr
          }
        }
      }
    }
  }
}

export default Astar
