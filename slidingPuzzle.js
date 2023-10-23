// The completed puzzle (4x4)
// The 0 tile represents the space
/**
0  1  2  3
4  5  6  7
8  9  10 11
12 13 14 15
*/

// Creates the completed puzzle with variable size
const SIZE = 3;

const COMPLETED_PUZZLE = [];
for (let i = 0; i < SIZE * SIZE - 1; i++) {
	COMPLETED_PUZZLE.push(i + 1);
}
COMPLETED_PUZZLE.push(0);

// The global start time to track how long it takes
let startTime = 0;

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

// Creates the dynamic horizontal bar
let horizontalBar = '\n';
for (let i = 0; i < SIZE; i++) {
	horizontalBar += '-----';
}
horizontalBar += '-\n';

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

let last = 99;

// A solver that uses the A* algorithm
function solvePuzzleAStar(starting_state) {
	let priorityQueue = [[starting_state, calculateHeuristic(starting_state)]];	// The queue of states we still need to check [state, heuristic]
	const processedStates = {};														// A list of all states we have visited to not duplicate [previous state, move to get to state]
	processedStates[starting_state] = [null, null];

	while(priorityQueue.length != 0) {
		let current_state = priorityQueue.pop()[0];

		// We solved it
		if(checkSolved(current_state)) {
			console.log('Found a solution!');

			displayPuzzle(current_state);

			// Reversed back up the tree to find the solution
			const path = [processedStates[current_state][1]];
			while(processedStates[current_state][0] != null) {
				current_state = processedStates[current_state][0];
				path.push(processedStates[current_state][1]);
			}

			return path.slice(0, path.length - 1).reverse(); // Returns the (backwards) path leading to the solution
		}

		// We didn't solve it, so try more combinations
		for(const nextState of nextStates(current_state)) {
			const nextBoardState = nextState[0];
			const moveOfState = nextState[1];

			// Check if we already saw that state
			if(!(nextBoardState in processedStates)) {
				priorityQueue.push([nextBoardState, calculateHeuristic(nextBoardState)]);
				processedStates[nextBoardState] = [current_state, moveOfState];
			}
		}

		priorityQueue = sortArray(priorityQueue);

		if(priorityQueue[priorityQueue.length - 1][1] < last) {
			last = priorityQueue[priorityQueue.length - 1][1];
			console.log(`Closest Solution Found: ${last} in ${(Date.now() - startTime) / 1000}s`);
			if(last < 4) displayPuzzle(priorityQueue[priorityQueue.length - 1][0]);
		}
	}

	console.log('No solution :(');
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

// Sorts the priority queue based on the heuristic
// using bubble sort (i'm lazy) O(n^2)
let timeSpent = 0;
function sortArray(arr) {
	const start = Date.now();
	for (let i = 0; i < arr.length; i++) {
		for (let j = 0; j < arr.length - i - 1; j++) {
			if(arr[j][1] < arr[j + 1][1]) { // Tests for the heuristic value
				// Swap
				const temp = arr[j];
				arr[j] = arr[j + 1];
				arr[j + 1] = temp;
			}
		}
	}

	timeSpent += Date.now() - start;
	return arr;
}

// Uses a heuristic of the minimum amount of moves needed
// to solve the puzzle
function calculateHeuristic(state) {
	let heuristic = 0;
	for (let i = 0; i < state.length; i++) {
		const num = state[i];
		if(num == 0) continue; // We don't care about the space
		heuristic += movesAway(i, COMPLETED_PUZZLE.indexOf(num));
	}
	return heuristic;
}

// Calculates the Manhattan distance between where the tile
// is and where it should be
function movesAway(a, b) {
	return Math.abs((a % SIZE) - (b % SIZE)) + Math.abs(Math.floor(a / SIZE) - Math.floor(b / SIZE));
}

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

	startTime = Date.now();
	const path = solvePuzzleAStar(puzzle);

	console.log('Time spent sorting: ' + timeSpent / 1000 + 's');
	// TODO: solution doesn't seem to be optimal
	console.log('Solution length: ' + path.length);

	const directions = [null, 'top', 'bottom', 'left', 'right'];
	for (const direction of path) {
		console.log(directions[direction]);
	}

}

main();