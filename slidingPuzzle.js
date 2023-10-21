// The completed puzzle
// The 0 tile represents the space
/**
0  1  2  3
4  5  6  7
8  9  10 11
12 13 14 15
*/
const COMPLETED_PUZZLE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
// The global start time to track how long it takes
let startTime = 0;

// Generates a random sliding puzzle (not guaranteed to be solvable ?)
function generatePuzzle() {
	const puzzle = [];
	const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];

	for (let i = 0; i < COMPLETED_PUZZLE.length; i++) {
		const randomIndex = Math.floor(Math.random() * nums.length);
		const randomNum = nums[randomIndex];
		puzzle.push(randomNum);

		nums.splice(randomIndex, 1);
	}

	return puzzle;
}

function displayPuzzle(puzzle) {
	let display = '';

	const horizontalBar = '\n---------------------\n';
	for (let i = 0; i < puzzle.length; i++) {
		if(i % 4 == 0) display += horizontalBar;
		display += `| ${puzzle[i]} ` + (puzzle[i] >= 10 ? '' : ' ');
		if(i % 4 == 3) display += '|';
	}

	display += horizontalBar;

	console.log(display);
}

// A solver that uses the BDF algorithm
function solvePuzzleBFS(starting_state) {
	const queue = [starting_state];						// The queue of states we still need to check
	const processedStates = { starting_state: null };	// A list of all states we have visited to not duplicate

	while(queue.length != 0) {
		let current_state = queue.pop();

		// We solved it
		if(checkSolved(current_state)) {
			console.log('Found a solution!');

			displayPuzzle(current_state);

			// Reversed back up the tree to find the solution
			const path = [current_state];
			while(processedStates[current_state] != null) {
				current_state = processedStates[current_state];
				path.push(current_state);
			}

			return path; // Returns the (backwards) path leading to the solution
		}

		// We didn't solve it, so try more combinations
		for(const nextState of nextStates(current_state)) {
			// Check if we already saw that state
			if(!(nextState in processedStates)) {
				queue.push(nextState);
				processedStates[nextState] = current_state;
			}
		}
	}

	console.log('No solution :(');
}

let last = 99;

// A solver that uses the A* algorithm
function solvePuzzleAStar(starting_state) {
	let priorityQueue = [[starting_state, calculateHeuristic(starting_state)]];				// The queue of states we still need to check
	const processedStates = { starting_state: null };	// A list of all states we have visited to not duplicate

	while(priorityQueue.length != 0) {
		let current_state = priorityQueue.pop()[0];

		// We solved it
		if(checkSolved(current_state)) {
			console.log('Found a solution!');

			displayPuzzle(current_state);

			// Reversed back up the tree to find the solution
			const path = [current_state];
			while(processedStates[current_state] != null) {
				current_state = processedStates[current_state];
				path.push(current_state);
			}

			return path; // Returns the (backwards) path leading to the solution
		}

		// We didn't solve it, so try more combinations
		for(const nextState of nextStates(current_state)) {
			// Check if we already saw that state
			if(!(nextState in processedStates)) {
				priorityQueue.push([nextState, calculateHeuristic(nextState)]);
				processedStates[nextState] = current_state;
			}
		}

		priorityQueue = sortArray(priorityQueue);

		if(priorityQueue[priorityQueue.length - 1][1] < last) {
			last = priorityQueue[priorityQueue.length - 1][1];
			console.log(`Minimal Solution: ${last} in ${Date.now() - startTime}ms`);
			if(last < 4) displayPuzzle(priorityQueue[priorityQueue.length - 1][0]);
		}
	}

	console.log('No solution :(');
}

function nextStates(puzzle) {
	// The next puzzle states that can result from the current puzzle
	const states = [];

	// Move the four (or less) tiles around the 0
	const zeroIndex = puzzle.indexOf(0);

	const topIndex = zeroIndex > 3 ? zeroIndex - 4 : -1;
	const bottomIndex = zeroIndex < 12 ? zeroIndex + 4 : -1;
	const leftIndex = zeroIndex % 4 != 0 ? zeroIndex - 1 : -1;
	const rightIndex = zeroIndex % 4 != 3 ? zeroIndex + 1 : -1;

	// Swaps (or moves) the blocks at each position with the 0 block
	if(topIndex != -1) {
		const p = puzzle.slice();
		p[zeroIndex] = p[topIndex];
		p[topIndex] = 0;
		states.push(p);
	}
	if(bottomIndex != -1) {
		const p = puzzle.slice();
		p[zeroIndex] = p[bottomIndex];
		p[bottomIndex] = 0;
		states.push(p);
	}
	if(leftIndex != -1) {
		const p = puzzle.slice();
		p[zeroIndex] = p[leftIndex];
		p[leftIndex] = 0;
		states.push(p);
	}
	if(rightIndex != -1) {
		const p = puzzle.slice();
		p[zeroIndex] = p[rightIndex];
		p[rightIndex] = 0;
		states.push(p);
	}

	return states;
}

// Sorts the priority queue based on the heuristic
// using bubble sort (i'm lazy) O(n^2)
function sortArray(arr) {
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
	return Math.abs((a % 4) - (b % 4)) + Math.abs(Math.floor(a / 4) - Math.floor(b / 4));
}

function checkSolved(puzzle) {
	for (let i = 0; i < COMPLETED_PUZZLE.length - 1; i++) {
		if(puzzle[i] != i + 1) return false;
	}
	return true;
}

function main() {
	const puzzle = generatePuzzle();

	displayPuzzle(puzzle);
	console.log(calculateHeuristic(puzzle));

	startTime = Date.now();
	const path = solvePuzzleAStar(puzzle);
}

main();