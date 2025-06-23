import { suitColor } from "./deck"
import { type FreecellBoard, nextStates, won } from "./freecell"
import { PriorityQueue } from "./priority-queue"
import { renderFreecellBoard } from "./terminal"

/**
 * Heuristic function for Freecell solving.
 * This function estimates the cost to reach the goal state from the current state.
 * It considers foundation completeness, tableau disorder, buried cards, and mobility.
 * This is the secret sauce of the solver.
 */
function heuristic(freeCellBoard: FreecellBoard) {
    const { foundations, tableau, freeCells } = freeCellBoard

    const cardsInFoundations = foundations.reduce((sum, f) => sum + f.length, 0)
    const cardsLeft = 52 - cardsInFoundations

    // Foundation info
    const foundationRanks = foundations.map((f) => f.at(-1)?.rank ?? 0)
    const minFoundation = Math.min(...foundationRanks)
    const maxFoundation = Math.max(...foundationRanks)
    const foundationImbalance = maxFoundation - minFoundation
    const missingSuitPenalty =
        foundationRanks.filter((r) => r === 0 && maxFoundation > 3).length * 10

    // Buried penalty: penalize depth-weighted low cards
    let buriedPenalty = 0
    let lowCardPenalty = 0
    for (const col of tableau) {
        for (let i = 0; i < col.length - 1; i++) {
            const card = col[i]!
            const depth = col.length - i - 1
            if (card.rank <= 3) buriedPenalty += depth * 3
            else buriedPenalty += depth
        }
    }

    // Disorder penalty
    let disorderPenalty = 0
    for (const col of tableau) {
        for (let i = 1; i < col.length; i++) {
            const prev = col[i - 1]!
            const curr = col[i]!
            if (
                prev.rank !== curr.rank + 1 ||
                suitColor(prev.suit) === suitColor(curr.suit)
            ) {
                disorderPenalty += 2
                if (curr.rank <= 3) disorderPenalty += 2
            }
        }
    }

    // Low cards blocked by high same-color cards
    for (const col of tableau) {
        for (let i = 0; i < col.length - 1; i++) {
            const blocker = col[i]!
            for (let j = i + 1; j < col.length; j++) {
                const below = col[j]!
                if (
                    below.rank <= 3 &&
                    blocker.rank > below.rank &&
                    suitColor(blocker.suit) === suitColor(below.suit)
                ) {
                    lowCardPenalty += 3
                }
            }
        }
    }

    // Reward: empty mobility spaces
    const emptyFreeCells = freeCells.filter((c) => c === null).length
    const emptyColumns = tableau.filter((col) => col.length === 0).length

    // Reward: playable to foundation (safe only)
    let playableToFoundation = 0
    for (const pile of [...tableau, ...freeCells]) {
        const top = Array.isArray(pile) ? pile.at(-1) : pile
        if (!top) continue
        const suitIdx = "CDHS".indexOf(top.suit)
        const foundationRank = foundationRanks[suitIdx]!
        if (top.rank === foundationRank + 1 && top.rank - minFoundation <= 2) {
            playableToFoundation += 1
        }
    }

    // Endgame bonus
    let endgameBonus = 0
    if (cardsLeft <= 16) {
        endgameBonus = (16 - cardsLeft) * 5
    }

    return (
        cardsLeft * 6 +
        buriedPenalty * 5 +
        disorderPenalty * 4 +
        lowCardPenalty * 3 +
        foundationImbalance * 8 +
        missingSuitPenalty +
        -playableToFoundation * 6 +
        -emptyFreeCells * 7 +
        -emptyColumns * 10 +
        -endgameBonus
    )
}

/**
 * Generates a unique hash for the Freecell board state.
 * This is used to track visited states and avoid cycles.
 */
function hash(freeCellBoard: FreecellBoard): string {
    return JSON.stringify({
        tableau: freeCellBoard.tableau.toSorted((a, b) => {
            if (a.length === 0 && b.length === 0) return 0
            if (a.length === 0) return 1
            if (b.length === 0) return -1
            return a.length - b.length || a[0]!.rank - b[0]!.rank
        }),

        foundations: freeCellBoard.foundations,
        freeCells: freeCellBoard.freeCells.toSorted((a, b) => {
            if (a === null && b === null) return 0
            if (a === null) return 1
            if (b === null) return -1
            if (a.suit > b.suit) return 1
            if (a.suit < b.suit) return -1

            return a.rank - b.rank
        }),
    })
}

function reconstructPath(
    cameFrom: Map<string, FreecellBoard>,
    current: FreecellBoard
): FreecellBoard[] {
    let path: FreecellBoard[] = []
    let currentHash = hash(current)

    while (cameFrom.has(currentHash)) {
        path.push(current)
        current = cameFrom.get(currentHash)!
        currentHash = hash(current)
    }

    path.reverse()
    return path
}

/**
 * Solves the Freecell game using A* search algorithm.
 */
function solve(freeCellBoard: FreecellBoard) {
    let priorityQueue = new PriorityQueue<FreecellBoard>()
    priorityQueue.enqueue(freeCellBoard, heuristic(freeCellBoard))

    let scores = new Map<string, number>()
    scores.set(hash(freeCellBoard), 0)

    let cameFrom = new Map<string, FreecellBoard>()

    let count = 0
    while (!priorityQueue.isEmpty() && scores.size < 200_000) {
        let current = priorityQueue.dequeue()
        if (!current) {
            break
        }
        if (count++ % 10000 === 0) {
            console.clear()
            console.log(renderFreecellBoard(current, false))
            console.log(
                `Queue size: ${priorityQueue.size()}. Visited states: ${scores.size}`
            )
        }

        if (won(current)) {
            return {
                path: reconstructPath(cameFrom, current),
                priorityQueueSize: priorityQueue.size(),
                visitedStates: scores.size,
            }
        }

        for (let nextState of nextStates(current)) {
            let nextHash = hash(nextState)

            let tentativeScore = scores.get(hash(current))! + 1

            if (
                !scores.has(nextHash) ||
                tentativeScore < scores.get(nextHash)!
            ) {
                cameFrom.set(nextHash, current)
                scores.set(nextHash, tentativeScore)

                let fScore = tentativeScore + heuristic(nextState)
                priorityQueue.enqueue(nextState, fScore)
            }
        }
    }

    return null
}

export { solve }
