// The varialbe size of the puzzle
const SIZE = 4;

// An array of the completed puzzle to compare to
const COMPLETED_PUZZLE = [];
for (let i = 0; i < SIZE * SIZE - 1; i++) {
	COMPLETED_PUZZLE.push(i + 1);
}
COMPLETED_PUZZLE.push(0);

// The global start time to track how long it takes to solve
let startTime = 0;
let sortTime = 0;
let nodeCount = 0;

// Generates a random sliding puzzle (not guaranteed to be solvable ?)
function generatePuzzle() {
	const puzzle = [];
	const nums = COMPLETED_PUZZLE.slice(); // Copies the array

	for (let i = 0; i < COMPLETED_PUZZLE.length; i++) {
		const randomIndex = Math.floor(Math.random() * nums.length);
		const randomNum = nums[randomIndex];
		puzzle.push(randomNum);

		nums.splice(randomIndex, 1);
	}

	return puzzle;
}

// Checks whether a given starting board is solvable
// Thanks to https://www.cs.princeton.edu/courses/archive/spring19/cos226/assignments/8puzzle/specification.php
function checkSolvable(puzzle) {
	if (SIZE % 2 == 0) { // Even size
		// The board is solvable when the amount of inversions (see below) + the row number of the blank tile is odd when SIZE is even
		return (countInversions(puzzle) + Math.floor(puzzle.indexOf(0) / SIZE)) % 2 == 1;
	} else { // Odd size
		// The board is solvable when the amount of inversions (see below) is even when SIZE is even
		return countInversions(puzzle) % 2 == 0;
	}
}

// An inversion is any pair of tiles i and j where i < j but i appears after j when considering the board in row-major order
// Thanks to https://www.cs.princeton.edu/courses/archive/spring19/cos226/assignments/8puzzle/specification.php
function countInversions(puzzle) {
	let inversions = 0;

	for (let i = 0; i < SIZE * SIZE - 1; i++) {
		if(puzzle[i] == 0) continue;
		for (let j = i + 1; j < SIZE * SIZE; j++) {
			if(puzzle[j] == 0) continue;
			const iTile = puzzle[i];
			const jTile = puzzle[j];

			if(iTile < jTile) continue;

			inversions++;

		}
	}
	return inversions;
}

// Creates the dynamic horizontal bar for displaying
let horizontalBar = '\n';
for (let i = 0; i < SIZE; i++) {
	horizontalBar += '-----';
}
horizontalBar += '-\n';

// Displays the current puzzle to the console
function displayPuzzle(puzzle) {
	let display = '';

	for (let i = 0; i < puzzle.length; i++) {
		if(i % SIZE == 0) display += horizontalBar;
		display += `| ${puzzle[i]} ` + (puzzle[i] >= 10 ? '' : ' ');
		if(i % SIZE == SIZE - 1) display += '|';
	}

	display += horizontalBar;

	console.log(display);
}

// Solves the puzzle using the A* method
// with a Manhattan Distance heuristic
function solvePuzzleAStar(starting_state) {
	const priorityQueue = [[starting_state, calculateHeuristic(starting_state), 0]];	// The queue of states we still need to check [state, heuristic, moveCount]
	const processedStates = {};															// A list of all states we have visited to not duplicate [previous state, move to get to state]
	processedStates[starting_state] = [null, null];

	// Continuously processes the queue of the states with the lowest heuristic
	while(priorityQueue.length != 0) {
		const current = priorityQueue.pop();
		let currentState = current[0];

		// If we solved the puzzle, returns the moveset to solve it
		if(checkSolved(currentState)) {
			console.log(`Found a solution in ${(Date.now() - startTime) / 1000}s`);

			// Reversed back up the tree to find the solution
			const path = [processedStates[currentState][1]];
			while(processedStates[currentState][0] != null) {
				currentState = processedStates[currentState][0];
				path.push(processedStates[currentState][1]);
			}

			return path.slice(0, path.length - 1).reverse(); // Returns the path leading to the solution
		}

		// We didn't solve it, so try all other combinations from that state
		for(const nextState of nextStates(currentState)) {
			nodeCount++;

			// Logging for longer board solves
			if(nodeCount % 100000 == 0) {
				console.log(`Searched ${nodeCount} boards in ${(Date.now() - startTime) / 1000}s with ${priorityQueue.length} in queue (${sortTime / 1000}s)`);
			}

			const nextBoardState = nextState[0];
			const moveOfState = nextState[1];
			const moveCount = current[2] + 1;

			// If we've seen the state, don't check it again
			if(nextBoardState in processedStates) continue;

			const nextInQueue = [nextBoardState, calculateHeuristic(nextBoardState) + moveCount, moveCount];

			// Inserts the new state based on the calculated heuristic in reverse numerical order
			// using binary search
			const start = Date.now();
			const index = binarySearch(priorityQueue, nextInQueue[1]);
			if(index != -1) {
				priorityQueue.splice(index, 0, nextInQueue);
			} else {
				priorityQueue.splice(0, 0, nextInQueue);
			}
			sortTime += Date.now() - start;

			processedStates[nextBoardState] = [currentState, moveOfState];
		}
	}

	console.log('No solution :(');
	return [];
}

// Returns a list of the next possible board states from
// a starting state in the form of
// [[puzzle, move],[puzzle, move]]
// Move: 1 = top, 2 = bottom, 3 = left, 4 = right
function nextStates(puzzle) {
	// The next puzzle states that can result from the current puzzle
	const states = [];

	// Move the four (or less) tiles around the 0
	const zeroIndex = puzzle.indexOf(0);

	const topIndex = zeroIndex > SIZE - 1 ? zeroIndex - SIZE : -1;
	const bottomIndex = zeroIndex < SIZE * (SIZE - 1) ? zeroIndex + SIZE : -1;
	const leftIndex = zeroIndex % SIZE != 0 ? zeroIndex - 1 : -1;
	const rightIndex = zeroIndex % SIZE != SIZE - 1 ? zeroIndex + 1 : -1;

	// Swaps (or moves) the blocks at each position with the 0 block
	if(topIndex != -1) {
		const p = puzzle.slice();
		p[zeroIndex] = p[topIndex];
		p[topIndex] = 0;
		states.push([p, 1]);
	}
	if(bottomIndex != -1) {
		const p = puzzle.slice();
		p[zeroIndex] = p[bottomIndex];
		p[bottomIndex] = 0;
		states.push([p, 2]);
	}
	if(leftIndex != -1) {
		const p = puzzle.slice();
		p[zeroIndex] = p[leftIndex];
		p[leftIndex] = 0;
		states.push([p, 3]);
	}
	if(rightIndex != -1) {
		const p = puzzle.slice();
		p[zeroIndex] = p[rightIndex];
		p[rightIndex] = 0;
		states.push([p, 4]);
	}

	return states;
}

// Uses binary search to insert a new board to search
// in O(log n) time
function binarySearch(arr, value) {
	let start = 0;
	let end = arr.length - 1;
	let middle = 0;

	while(start <= end) {
		middle = parseInt((end + start) / 2);

		if(arr[middle][1] > value) { 		// Belongs to the right end
			start = middle + 1;
		} else if(arr[middle][1] < value) {	// Belongs to the left end
			end = middle - 1;
		} else {						// We found the spot
			return middle;
		}
	}
	return -1; // Nothing in the array
}

// Uses a heuristic of the minimum amount of moves needed to solve the puzzle
function calculateHeuristic(state) {
	let heuristic = 0;
	for (let i = 0; i < state.length; i++) {
		const num = state[i];
		if(num == 0) continue; // We don't care about the space
		heuristic += movesAway(i, COMPLETED_PUZZLE.indexOf(num));
	}
	return heuristic;
}

// Calculates the Manhattan distance between where the tile is and where it should be
function movesAway(a, b) {
	return Math.abs((a % SIZE) - (b % SIZE)) + Math.abs(Math.floor(a / SIZE) - Math.floor(b / SIZE));
}

// Returns whether the puzzle has been solved
function checkSolved(puzzle) {
	for (let i = 0; i < COMPLETED_PUZZLE.length - 1; i++) {
		if(puzzle[i] != i + 1) return false;
	}
	return true;
}

function main() {
	if(SIZE < 3) {
		console.error('SIZE IS TOO SMALL');
		return;
	}

	const puzzle = generatePuzzle();
	displayPuzzle(puzzle);

	if(!checkSolvable(puzzle)) {
		console.log('Puzzle is not solvable :(');
		return;
	}

	console.log('Solving...');

	startTime = Date.now();
	const path = solvePuzzleAStar(puzzle);

	console.log('Moves: ' + path.length);
	console.log('Boards explored: ' + nodeCount);

	const directions = [null, 'top', 'bottom', 'left', 'right'];

	let pathString = 'Solution: ' + directions[path[0]];
	for (let i = 1; i < path.length; i++) {
		pathString += ', ' + directions[path[i]];
	}

	console.log(pathString);
}

main();

// puzzle = [1, 13, 9, 7, 6, 5, 10, 12, 14, 15, 0, 8, 2, 3, 11, 4];