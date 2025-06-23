/**
 * A simple implementation of a priority queue using a binary heap.
 */
class PriorityQueue<T> {
    private heap: { item: T; priority: number }[] = []

    enqueue(item: T, priority: number): void {
        this.heap.push({ item, priority })
        this.bubbleUp()
    }

    dequeue(): T | undefined {
        if (this.heap[0] === undefined) return undefined
        let top = this.heap[0].item
        let end = this.heap.pop()
        if (this.heap.length > 0 && end) {
            this.heap[0] = end
            this.bubbleDown()
        }
        return top
    }

    peek(): T | undefined {
        return this.heap[0]?.item
    }

    isEmpty(): boolean {
        return this.heap.length === 0
    }

    size(): number {
        return this.heap.length
    }

    private bubbleUp(): void {
        let idx = this.heap.length - 1
        while (idx > 0) {
            let parentIdx = Math.floor((idx - 1) / 2)
            if (this.heap[idx].priority >= this.heap[parentIdx].priority) break
            ;[this.heap[idx], this.heap[parentIdx]] = [
                this.heap[parentIdx],
                this.heap[idx],
            ]
            idx = parentIdx
        }
    }

    private bubbleDown(): void {
        let idx = 0
        let length = this.heap.length
        while (true) {
            let left = 2 * idx + 1
            let right = 2 * idx + 2
            let smallest = idx

            if (
                left < length &&
                this.heap[left].priority < this.heap[smallest].priority
            ) {
                smallest = left
            }
            if (
                right < length &&
                this.heap[right].priority < this.heap[smallest].priority
            ) {
                smallest = right
            }
            if (smallest === idx) break
            ;[this.heap[idx], this.heap[smallest]] = [
                this.heap[smallest],
                this.heap[idx],
            ]
            idx = smallest
        }
    }
}

export { PriorityQueue }
