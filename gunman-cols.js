class Gunman {
  constructor(matrix, walls) {
    this.matrix = matrix
    this.walls = walls
    this.gunmanPlaced = {}
    this.gunmanPlacedSaved = {}
    this.totalGunman = []

    this.shoot = false
    this.counterGunman = 0
  }

  init() {
    this.firstGunmanNode()
    const maxGunman = Math.max(...this.totalGunman)
    const maxGunmanWay = this.findMaxGunmanWay(maxGunman)
    return { maxGunman, maxGunmanWay }
  }

  findMaxGunmanWay(maxGunman) {
    const uniqueWay = [...new Set(this.gunmanPlacedSaved[maxGunman])]
    console.log('not unique')
    console.log(this.gunmanPlacedSaved[maxGunman].length)

    console.log('unique')
    console.log(uniqueWay)
    return uniqueWay.length
  }

  markGunman(nodeY, nodeX) {
    if (!this.gunmanPlaced[nodeY]) this.gunmanPlaced[nodeY] = []
    this.gunmanPlaced[nodeY].push(nodeX)
    this.gunmanPlaced[nodeY].sort()
    this.counterGunman += 1
  }

  saveGunmanPlaced() {
    if (!this.gunmanPlacedSaved[this.counterGunman]) this.gunmanPlacedSaved[this.counterGunman] = []
    this.gunmanPlacedSaved[this.counterGunman].push(JSON.stringify(this.gunmanPlaced))
    this.totalGunman.push(this.counterGunman)
    this.counterGunman = 0
    this.gunmanPlaced = {}
  }

  // First gunman
  firstGunmanNode() {
    let nodeX = 0
    let nodeY = 0
    let boolean = [true, false]
    let directionType = ['horizontal', 'vertical']
    for (let i = 0; i < this.matrix[0] * this.matrix[1]; i++) {
      nodeX = i % this.matrix[0]
      if (!(this.walls[nodeY] && this.walls[nodeY].includes(nodeX))) {
        this.markGunman(nodeY, nodeX)
        boolean.map(bool => {
          directionType.map(dir => {
            this.possGunmanNode(nodeY, nodeX, 'forward', 'backward', dir, bool)
            this.possGunmanNode(nodeY, nodeX, 'backward', 'backward', dir, bool)
            this.possGunmanNode(nodeY, nodeX, 'backward', 'forward', dir, bool)
            this.possGunmanNode(nodeY, nodeX, 'forward', 'forward', dir, bool)
          })
        })
      }

      if (nodeX == this.matrix[0] - 1) nodeY += 1
    }
  }

  // Possibility
  possGunmanNode(nodeY, nodeX, directionY, directionX, directionType, zigzag) {
    let directionParam = {}
    let zigzagActive = false
    let oppositeY = false
    let oppositeX = false
    for (let i = 0; i < this.matrix[0] * this.matrix[1] - 1; i++) {
      oppositeY = zigzagActive && directionType === 'vertical'
      oppositeX = zigzagActive && directionType === 'horizontal'
      directionY = this.changeDirectionOpposite(directionY, oppositeY)
      directionX = this.changeDirectionOpposite(directionX, oppositeX)
      directionParam.y = this.possDirectionParam(directionY, this.matrix[1])
      directionParam.x = this.possDirectionParam(directionX, this.matrix[0])

      let nextNode = this.possNextNode(nodeY, nodeX, directionParam, directionType, zigzag)
      nodeY = nextNode[0]
      nodeX = nextNode[1]
      zigzagActive = nextNode[2]

      if (!(this.walls[nodeY] && this.walls[nodeY].includes(nodeX))) {
        this.stepGunman(nodeY, nodeX)
        if (!this.shoot) this.markGunman(nodeY, nodeX)
      }
      this.shoot = false
    }
    this.saveGunmanPlaced()
  }

  possNextNode(nodeY, nodeX, directionParam, directionType, zigzag) {
    let zigzagActive = false
    let param1 = 'x',
      param2 = 'y',
      node1 = nodeX,
      node2 = nodeY
    if (directionType === 'vertical') {
      param1 = 'y'
      param2 = 'x'
      node1 = nodeY
      node2 = nodeX
    }

    if (node1 === directionParam[param1].trigger) {
      if (zigzag) {
        node1 = directionParam[param1].trigger
        zigzagActive = true
      } else {
        node1 = directionParam[param1].reset
      }
      node2 = node2 === directionParam[param2].trigger ? directionParam[param2].reset : node2 + directionParam[param2].increment
    } else {
      node1 = node1 + directionParam[param1].increment
    }

    return directionType === 'horizontal' ? [node2, node1, zigzagActive] : [node1, node2, zigzagActive]
  }

  possDirectionParam(direction, matrix) {
    const trigger = direction === 'forward' ? matrix - 1 : 0
    const reset = direction === 'forward' ? 0 : matrix - 1
    const increment = direction === 'forward' ? 1 : -1
    return { trigger, reset, increment }
  }

  changeDirectionOpposite(direction, opposite) {
    if (opposite) direction = direction === 'forward' ? 'backward' : 'forward'
    return direction
  }

  // Step
  stepGunman(nodeY, nodeX) {
    // up
    if (nodeY !== 0) this.stepDirection(nodeY, nodeX, 'y', 'backward')
    // left
    if (!this.shoot && nodeX !== 0) this.stepDirection(nodeY, nodeX, 'x', 'backward')
    // down
    if (!this.shoot && nodeY !== this.matrix[1] - 1) this.stepDirection(nodeY, nodeX, 'y', 'forward')
    // right
    if (!this.shoot && nodeX !== this.matrix[0] - 1) this.stepDirection(nodeY, nodeX, 'x', 'forward')
  }

  stepDirection(nodeY, nodeX, nodeType, directionType) {
    const increment = directionType === 'forward' ? 1 : -1
    const init = (nodeType === 'x' ? nodeX : nodeY) + increment
    let condition = function (i) {
      return i >= 0
    }
    if (directionType === 'forward')
      condition = function (i, matrix) {
        const max = nodeType === 'x' ? matrix[0] : matrix[1]
        return i < max
      }

    for (let i = init; condition(i, this.matrix); i += increment) {
      let findY = nodeType === 'y' ? i : nodeY
      let findX = nodeType === 'x' ? i : nodeX

      // wall
      if (this.walls[findY] && this.walls[findY].includes(findX)) break
      // gunmanPlaced
      if (this.gunmanPlaced[findY] && this.gunmanPlaced[findY].includes(findX)) {
        this.shoot = true
        break
      }
    }
  }
}

// Define
// const matrix = [4, 4]
// const walls = {}
// walls[0] = [0, 1, 2]
// walls[2] = [1]
// walls[3] = [0, 1, 2]

const matrix = [8, 8]
const walls = {}
walls[0] = [1, 3, 5, 7]
walls[1] = [5]
walls[2] = [0, 2, 5, 7]
walls[4] = [3]
walls[5] = [5, 7]
walls[6] = [1]
walls[7] = [4, 6]

// Execute
const gunman = new Gunman(matrix, walls)
const resulGunman = gunman.init()
console.log({ resulGunman })
