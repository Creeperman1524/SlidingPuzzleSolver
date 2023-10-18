// The completed puzzle
// The 0 tile represents the space
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

function main() {
	puzzle = generatePuzzle()

	console.log(puzzle)
}

main()