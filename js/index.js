/**
 * Add the class or the classes to the HTML element
 * @param {Element} element An HTML element
 * @param {string|string[]} classNameOrNames A className or an array of classNames
 */
const addClass = (element, classNameOrNames) => {
  const classNames = Array.isArray(classNameOrNames) ? classNameOrNames : [classNameOrNames];

  for (const className of classNames) {
    element.classList.add(className);
  }
};

/**
 * Remove the class or the classes to the HTML element
 * @param {Element} element An HTML element
 * @param {string|string[]} classNameOrNames A className or an array of classNames
 */
const removeClass = (element, classNameOrNames) => {
  const classNames = Array.isArray(classNameOrNames) ? classNameOrNames : [classNameOrNames];

  for (const className of classNames) {
    element.classList.remove(className);
  }
};

/**
 * Append a element to an other
 * @param {Element} parent An HTML element
 * @param {Element} element An HTML elment
 */
const addChild = (parent, element) => {
  parent.appendChild(element);
};

/**
 * Modify the data attribute of an element
 * @param {Element} element An HTML element
 * @param {string} name The data attribute name
 * @param {string} value The new value
 */
const setDataAttribute = (element, name, value) => {
  element.setAttribute(`data-${name}`, value);
};

class Cell {
  /**
   * The cell class
   * @param {number} x The x coordinate
   * @param {number} y The y coordinate
   * @param {boolean} wall Wether the cell is a wall or not
   */
  constructor(x, y, wall = false) {
    this.x = x;
    this.y = y;

    this.f = Infinity;
    this.g = Infinity;

    this.neighbors = [];

    this.previous = undefined;

    this.wall = wall;
  }

  /**
   * Add a neighbor to the cell
   * @param {Cell} neighbor The neighbor
   */
  addNeighbor(neighbor) {
    this.neighbors.push(neighbor);
  }
}

class Grid {
  /**
   * The grid class
   * @param {Element} container An HTML element
   * @param {number} rows The number of rows
   * @param {number} cols The number of columns
   */
  constructor(container, rows, cols) {
    this.container = container;

    this.rows = rows;
    this.cols = cols;

    this.cells = [];
  }

  /**
   * Add a cell to the grid
   * @param {Cell} cell A cell
   */
  addCell(cell) {
    this.cells.push(cell);
  }

  /**
   * Get the cell at a certain position in the grid
   * @param {number} x The x coordinate
   * @param {number} y The y coordinate
   * @returns A Cell
   */
  getCell(x, y) {
    return this.cells.find((cell) => cell.x == x && cell.y == y);
  }

  /**
   * Show all the cell neighbors on the grid
   * @param {Cell} cell A cell
   */
  showNeighbors(cell) {
    for (const neighbor of cell.neighbors) {
      this.setState(neighbor, 'path');
    }
  }

  /**
   * Generate the grid
   */
  build() {
    for (let i = 0; i < this.rows; i++) {
      // Generate the html row element
      const htmlRow = document.createElement('div');
      addClass(htmlRow, 'row');

      for (let j = 0; j < this.cols; j++) {
        const isWall = Math.random(1) < 0.4;

        // Add the cell to the grid (on the class)
        this.addCell(new Cell(i, j, isWall));

        // Generate the html cell element
        const htmlCell = document.createElement('div');
        addClass(htmlCell, isWall ? ['cell', 'wall'] : 'cell');

        setDataAttribute(htmlCell, 'coords', `${i}-${j}`);

        addChild(htmlRow, htmlCell);
      }

      addChild(this.container, htmlRow);
    }
  }

  /**
   * Modify the state of a cell
   * @param {Cell} cell A cell
   * @param {string} state The new state
   */
  setState(cell, state) {
    const states = ['open', 'path'];

    const element = document.querySelector(`[data-coords='${cell.x}-${cell.y}']`);

    for (const state of states) {
      removeClass(element, state);
    }

    if (states.includes(state)) {
      addClass(element, state);
    }
  }

  /**
   * For each cell, add its neighbors
   */
  addNeighbors() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const current = this.getCell(i, j);

        // Left neighbor
        if (i > 0) current.addNeighbor(this.getCell(i - 1, j));

        // Top neighbor
        if (j > 0) current.addNeighbor(this.getCell(i, j - 1));

        // Right neighbor
        if (i < this.rows - 1) current.addNeighbor(this.getCell(i + 1, j));

        // Bottom neighbor
        if (j < this.cols - 1) current.addNeighbor(this.getCell(i, j + 1));

        // Top left neighbor
        if (i > 0 && j > 0) current.addNeighbor(this.getCell(i - 1, j - 1));

        // Top right neighbor
        if (i < this.rows - 1 && j > 0) current.addNeighbor(this.getCell(i + 1, j - 1));

        // Bottom left neighbor
        if (i < this.rows - 1 && j < this.cols - 1) current.addNeighbor(this.getCell(i + 1, j + 1));

        // Bottom right neighbor
        if (i > 0 && j < this.cols - 1) current.addNeighbor(this.getCell(i - 1, j + 1));
      }
    }
  }
}

class OpenList {
  /**
   * The open list class
   * @param {Grid} grid A grid
   * @param {Cell[]} defaultArr The default list array
   */
  constructor(grid, defaultArr = []) {
    this.grid = grid;
    this.arr = defaultArr;

    for (const cell of defaultArr) {
      this.grid.setState(cell, 'open');
    }
  }

  /**
   * Add a cell to the list
   * @param {Cell} cell A cell
   */
  addCell(cell) {
    this.grid.setState(cell, 'open');
    this.arr.push(cell);
  }

  /**
   * Remove a cell from the list
   * @param {Cell} cell A cell
   */
  removeCell(cell) {
    this.grid.setState(cell, null);
    this.arr = this.arr.filter((_cell) => _cell !== cell);
  }

  /**
   * Get the lowest node of the list
   */
  get lowestNode() {
    let lowest = this.arr[0];

    for (const node of this.arr) {
      if (node.f < lowest.f) lowest = node;
    }

    return lowest;
  }

  /**
   * Check if the list is empty
   */
  get empty() {
    return this.arr.length === 0;
  }
}

/**
 * Get the distance between two cells
 * @param {Cell} nodeA A cell
 * @param {Cell} nodeB A cell
 * @returns A number
 */
const dist = (nodeA, nodeB) => {
  return Math.sqrt(Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y));
};

/**
 * Heuristic (see wikipedia a* pathfinding)
 * @param {Cell} nodeA A cell
 * @param {Cell} nodeB A cell
 * @returns A number
 */
const heuristic = (nodeA, nodeB) => {
  return dist(nodeA, nodeB);
};

/**
 * Get the paths of the cells 
 * @param {Cell} start The start cell
 * @returns An array of cells
 */
const getPathCells = (start) => {
  const path = [start];
  let current = start;

  while (current.previous !== undefined) {
    path.push(current.previous);
    current = current.previous;
  }

  return path;
};

/**
 * Main function
 */
const main = async () => {
  const ROWS = 50;
  const COLS = 50;

  const app = document.querySelector('#app');

  const gridElement = document.createElement('div');
  addClass(gridElement, 'grid');
  addChild(app, gridElement);

  const grid = new Grid(gridElement, ROWS, COLS);
  grid.build();
  grid.addNeighbors();

  const startNode = grid.getCell(0, 0);
  const endNode = grid.getCell(grid.rows - 1, grid.cols - 1);

  startNode.wall = false;
  endNode.wall = false;

  startNode.g = 0;
  startNode.f = heuristic(startNode, endNode);

  const openSet = new OpenList(grid, [startNode]);

  while (!openSet.empty) {
    const current = openSet.lowestNode;

    openSet.removeCell(current);

    if (current === endNode) {
      for (const cell of getPathCells(current)) {
        grid.setState(cell, 'path');
      }

      break;
    }

    for (const neighbor of current.neighbors) {
      tmpG = current.g + dist(current, neighbor);

      if (tmpG < neighbor.g && !neighbor.wall) {
        neighbor.g = tmpG;
        neighbor.previous = current;
        neighbor.f = tmpG + heuristic(neighbor, endNode);

        if (!openSet.arr.includes(neighbor)) {
          openSet.addCell(neighbor);
        }
      }
    }

    await (async () => new Promise((resolve) => setTimeout(resolve, 1)))();
  }
};

window.addEventListener('load', main);
