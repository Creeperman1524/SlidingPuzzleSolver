// Thanks to https://codepen.io/camchambers/pen/rNzdJzG

const size = 3;
const numberOfTiles = size ** 2;
let zeroTileIndex = numberOfTiles;

const tileContainer = document.getElementById('tiles');

// The bottom buttons
const solveButton = document.getElementById('solve');
solveButton.addEventListener('click', function() {
	solve();
});

const scrambleButton = document.getElementById('scramble');
scrambleButton.addEventListener('click', function() {
	shuffle();
});

const resetButton = document.getElementById('reset');
resetButton.addEventListener('click', function() {
	removeTiles();
	loadTiles();
});

newGame();
function newGame() {
	loadTiles();
}

// Dynamically creates the tiles on the board
function loadTiles() {
	zeroTileIndex = numberOfTiles;
	for (let b = 1; b <= numberOfTiles; b++) {
		const newTile = document.createElement('button');
		newTile.id = `btn${b}`;
		newTile.setAttribute('index', b);
		newTile.innerHTML = b;
		newTile.classList.add('tileButton');
		newTile.addEventListener('click', function() {
			swap(parseInt(this.getAttribute('index')));
		});
		tileContainer.append(newTile);
	}
	const zeroTileId = 'btn' + zeroTileIndex;
	const zeroTile = document.getElementById(zeroTileId);
	zeroTile.classList.add('zeroTile');
}

// Remove the tiles from the board to be reset
function removeTiles() {
	let child = tileContainer.lastElementChild;
	while(child) {
		tileContainer.removeChild(child);
		child = tileContainer.lastElementChild;
	}
}

// Plays ranodm moves between minShuffles and maxShuffles to shuffle the board
function shuffle() {
	const minShuffles = 100;
	const maxShuffles = 300;
	const shuffles = minShuffles + Math.floor(Math.random() * (maxShuffles - minShuffles));

	for (let i = 0; i < shuffles; i++) {
		setTimeout(function timer() {
			const x = Math.floor(Math.random() * 4) + 1;
			move(x);
		}, i * 10);
	}
}

// Moves the zeroTile in the numerical direction inputted
function move(direction) {
	let tileToSwap = 0;

	switch (direction) {
	case 1:	// Up
		tileToSwap = zeroTileIndex - size;
		break;
	case 2: // Down
		tileToSwap = zeroTileIndex + size;
		break;
	case 3:	// Left
		tileToSwap = zeroTileIndex - 1;
		break;
	case 4: // Right
		tileToSwap = zeroTileIndex + 1;
		break;
	}
	swap(tileToSwap);
}

// Swaps the zeroTile and the tile that is "clicked"
// This has bounds checking, for when the shuffle gives out of bounds positions
function swap(clicked) {
	if (clicked < 1 || clicked > (numberOfTiles)) return;

	// Right
	if (clicked == zeroTileIndex + 1) {
		if (clicked % size != 1) {
			setSelected(clicked);
		}
	// Left
	} else if (clicked == zeroTileIndex - 1) {
		if (clicked % size != 0) {
			setSelected(clicked);
		}
	// Up
	} else if (clicked == zeroTileIndex + size) {
		setSelected(clicked);
	// Down
	} else if (clicked == zeroTileIndex - size) {
		setSelected(clicked);
	}
}

// Converts the current board state to an array that the solver can use
function convertToArray() {
	let puzzle = [];
	for (let i = 1; i <= numberOfTiles; i++) puzzle.push(document.getElementById(`btn${i}`).innerHTML);

	// Remaps the '9' tile to 0 as used in the solver as well as converting it from strings -> ints
	puzzle = puzzle.map((x) => {
		return x == '9' ? 0 : parseInt(x);
	});

	return puzzle;
}

// Solves the puzzle and displays the path
async function solve() {
	const puzzle = convertToArray();

	// eslint-disable-next-line no-undef
	const path = solvePuzzle(puzzle);

	for(const m of path) {
		move(m);
		await new Promise(r => setTimeout(r, 100));
	}
}

// Changes the styling of the swapped tile and zeroTile
function setSelected(index) {
	const currentTile = document.getElementById(`btn${zeroTileIndex}`);
	const currentTileText = currentTile.innerHTML;
	currentTile.classList.remove('zeroTile');

	const newTile = document.getElementById(`btn${index}`);
	currentTile.innerHTML = newTile.innerHTML;
	newTile.innerHTML = currentTileText;
	newTile.classList.add('zeroTile');
	zeroTileIndex = index;
}