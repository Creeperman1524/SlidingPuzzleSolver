// The completed puzzle
// The 0 tile represents the space
/**
0  1  2  3
4  5  6  7
8  9  10 11
12 13 14 15
*/
COMPLETED_PUZZLE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]

// Generates a random sliding puzzle (not guaranteed to be solvable ?)
function generatePuzzle() {
	const puzzle = []
	let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]

	for (let i = 0; i < COMPLETED_PUZZLE.length; i++) {
		const randomIndex = Math.floor(Math.random() * nums.length)
		const randomNum = nums[randomIndex]
		puzzle.push(randomNum)

		nums.splice(randomIndex, 1)
	}

	return puzzle
}

function displayPuzzle(puzzle) {
	let display = ''

	const horizontalBar = '\n---------------------\n'
	for (let i = 0; i < puzzle.length; i++) {
		if(i % 4 == 0) display += horizontalBar
		display += `| ${puzzle[i]} ` + (puzzle[i] >= 10 ? '' : ' ')
		if(i % 4 == 3) display += '|'
	}
	
	display += horizontalBar

	console.log(display)
}

// A solver that uses the BDF algorithm
function solvePuzzleBDF(puzzle) {
	const queue = []

	states = nextStates(puzzle)


}

function main() {
	puzzle = generatePuzzle()

	displayPuzzle(puzzle)
}

main()