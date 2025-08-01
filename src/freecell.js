import { suitColor } from "./deck.js"

const foundationSuits = ["H", "D", "C", "S"]

function createFreecellBoard(deck) {
    let tableau = Array.from({ length: 8 }, () => [])
    let foundations = Array.from({ length: 4 }, () => [])
    let freeCells = Array.from({ length: 4 }, () => null)

    for (let i = 0; i < deck.length; i++) {
        tableau[i % 8].push(deck[i])
    }

    return {
        tableau,
        foundations,
        freeCells,
    }
}

function won(freeCellBoard) {
    return freeCellBoard.foundations.every(
        (foundation) => foundation.length === 13
    )
}

/**
 * Generates the next possible states from the current Freecell board.
 */
function nextStates(freeCellBoard) {
    let nextBoards = []
    let { tableau, foundations, freeCells } = freeCellBoard

    // Move cards from free cells
    for (let card of freeCells) {
        if (!card) continue

        // Try to move to foundations
        let foundation = foundations[foundationSuits.indexOf(card.suit)]
        if (
            (foundation.length === 0 && card.rank === 1) ||
            (foundation.length && foundation.at(-1).rank + 1 === card.rank)
        ) {
            let newFoundations = foundations.map((f) => [...f])
            newFoundations[foundations.indexOf(foundation)].push(card)
            let newFreeCells = freeCells.map((c) => c)
            newFreeCells[freeCells.indexOf(card)] = null
            nextBoards.push({
                tableau: [...tableau],
                foundations: newFoundations,
                freeCells: newFreeCells,
            })
        }

        // Try to move to tableau
        for (let target of tableau) {
            if (
                target.length === 0 ||
                (suitColor(target.at(-1).suit) !== suitColor(card.suit) &&
                    target.at(-1).rank === card.rank + 1)
            ) {
                let newTableau = tableau.map((t) => [...t])
                newTableau[tableau.indexOf(target)].push(card)
                let newFreeCells = freeCells.map((c) => c)
                newFreeCells[freeCells.indexOf(card)] = null
                nextBoards.push({
                    tableau: newTableau,
                    foundations: [...foundations],
                    freeCells: newFreeCells,
                })
            }
        }
    }

    // Move cards from tableau
    for (let i = 0; i < tableau.length; i++) {
        let source = tableau[i]
        if (source.length === 0) continue

        let card = source.at(-1)

        // Try to move to foundations
        let foundation = foundations[foundationSuits.indexOf(card.suit)]

        if (
            (foundation.length === 0 && card.rank === 1) ||
            (foundation.length && foundation.at(-1).rank + 1 === card.rank)
        ) {
            let newFoundations = foundations.map((f) => [...f])
            newFoundations[foundations.indexOf(foundation)].push(card)
            let newTableau = tableau.map((t) => [...t])
            newTableau[i] = source.slice(0, -1)
            nextBoards.push({
                tableau: newTableau,
                foundations: newFoundations,
                freeCells: [...freeCells],
            })
        }

        // Try to move to tableau
        for (let target of tableau) {
            if (
                target.length === 0 ||
                (suitColor(target.at(-1).suit) !== suitColor(card.suit) &&
                    target.at(-1).rank === card.rank + 1)
            ) {
                let newTableau = tableau.map((t) => [...t])
                newTableau[tableau.indexOf(target)].push(card)
                let newSource = source.slice(0, -1)
                newTableau[i] = newSource
                nextBoards.push({
                    tableau: newTableau,
                    foundations: [...foundations],
                    freeCells: [...freeCells],
                })
            }
        }

        // Try to move to free cells
        for (let j = 0; j < freeCells.length; j++) {
            if (!freeCells[j]) {
                let newFreeCells = freeCells.map((c) => c)
                newFreeCells[j] = card
                let newTableau = tableau.map((t) => [...t])
                newTableau[i] = source.slice(0, -1)
                nextBoards.push({
                    tableau: newTableau,
                    foundations: [...foundations],
                    freeCells: newFreeCells,
                })
            }
        }
    }

    return nextBoards
}

export { createFreecellBoard, nextStates, won }

