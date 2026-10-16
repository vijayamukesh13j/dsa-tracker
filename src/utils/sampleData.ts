import type { Problem } from '../types/problem';
import { addDaysToDate, getTodayISO } from './spacedRepetition';

export function getSampleProblems(): Problem[] {
  const today = getTodayISO();
  const yesterday = addDaysToDate(today, -1);
  const twoDaysAgo = addDaysToDate(today, -2);
  const eightDaysAgo = addDaysToDate(today, -8);
  const fourteenDaysAgo = addDaysToDate(today, -14);
  const twentyDaysAgo = addDaysToDate(today, -20);

  return [
    {
      id: 'sample-1',
      title: '146. LRU Cache',
      problemNumber: '146',
      url: 'https://leetcode.com/problems/lru-cache/description/',
      platform: 'leetcode',
      difficulty: 'Medium',
      patterns: ['Doubly Linked List', 'Hash Table'],
      confidence: 4,
      dateFirstSolved: twentyDaysAgo,
      lastRevisionDate: '',
      nextRevisionDate: addDaysToDate(today, 8),
      revisionCount: 0,
      solveTimeMinutes: 24,
      isFavorite: true,
      createdAt: twentyDaysAgo,
      updatedAt: today,
      notes: {
        keyIntuition:
          'Combine a Doubly Linked List for O(1) node additions & removals with a Hash Map for O(1) key lookups. Using dummy head and tail nodes completely eliminates edge cases when inserting or evicting!',
        mistakes:
          'Initially forgot to remove the evicted node key from the dictionary when capacity overflowed. Also make sure to update existing key values without incrementing size.',
        timeComplexity: 'O(1) for both get() and put()',
        spaceComplexity: 'O(Capacity) for hash map & linked list nodes',
        language: 'python',
        codeSnippet: `class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {} # key -> Node
        self.left, self.right = Node(), Node()
        self.left.next, self.right.prev = self.right, self.left

    def remove(self, node: Node):
        prev, nxt = node.prev, node.next
        prev.next, nxt.prev = nxt, prev

    def insert(self, node: Node):
        prev, nxt = self.right.prev, self.right
        prev.next = node
        node.prev, node.next = prev, nxt
        nxt.prev = node

    def get(self, key: int) -> int:
        if key in self.cache:
            self.remove(self.cache[key])
            self.insert(self.cache[key])
            return self.cache[key].val
        return -1

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.remove(self.cache[key])
        self.cache[key] = Node(key, value)
        self.insert(self.cache[key])
        if len(self.cache) > self.cap:
            lru = self.left.next
            self.remove(lru)
            del self.cache[lru.key]`,
      },
      revisionHistory: [],
    },
    {
      id: 'sample-2',
      title: '42. Trapping Rain Water',
      problemNumber: '42',
      url: 'https://leetcode.com/problems/trapping-rain-water/',
      platform: 'leetcode',
      difficulty: 'Hard',
      patterns: ['Two Pointers', 'Monotonic Stack'],
      confidence: 2,
      dateFirstSolved: fourteenDaysAgo,
      lastRevisionDate: '',
      nextRevisionDate: addDaysToDate(today, -1), // 1 day OVERDUE!
      revisionCount: 0,
      solveTimeMinutes: 35,
      isFavorite: true,
      createdAt: fourteenDaysAgo,
      updatedAt: today,
      notes: {
        keyIntuition:
          'Water above index i is min(maxLeft, maxRight) - height[i]. With two pointers (left & right), always advance the side with the smaller max boundary, because that smaller boundary is the definitive bottleneck regardless of what lies between!',
        mistakes:
          'Tried nested scans first which was O(N^2). Then DP arrays which was O(N) space. The two-pointer solution reduces space to O(1) cleanly.',
        timeComplexity: 'O(N) single pass',
        spaceComplexity: 'O(1) extra auxiliary space',
        language: 'python',
        codeSnippet: `def trap(height: list[int]) -> int:
    if not height: return 0
    l, r = 0, len(height) - 1
    left_max, right_max = height[l], height[r]
    water = 0

    while l < r:
        if left_max < right_max:
            l += 1
            left_max = max(left_max, height[l])
            water += left_max - height[l]
        else:
            r -= 1
            right_max = max(right_max, height[r])
            water += right_max - height[r]

    return water`,
      },
      revisionHistory: [],
    },
    {
      id: 'sample-3',
      title: '3. Longest Substring Without Repeating Characters',
      problemNumber: '3',
      url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
      platform: 'leetcode',
      difficulty: 'Medium',
      patterns: ['Sliding Window'],
      confidence: 3,
      dateFirstSolved: eightDaysAgo,
      lastRevisionDate: '',
      nextRevisionDate: today, // DUE TODAY!
      revisionCount: 0,
      solveTimeMinutes: 18,
      isFavorite: false,
      createdAt: eightDaysAgo,
      updatedAt: today,
      notes: {
        keyIntuition:
          'Maintain a sliding window [l, r] and a hash map tracking last seen index of each character. When character is repeated inside the window, jump left pointer to max(left, last_seen[c] + 1).',
        mistakes:
          'Failing to use max(left, last_seen[c] + 1) will cause the left pointer to jump backwards to an index before current left!',
        timeComplexity: 'O(N) linear time',
        spaceComplexity: 'O(min(M, N)) where M is character charset size',
        language: 'python',
        codeSnippet: `def lengthOfLongestSubstring(s: str) -> int:
    last_seen = {}
    max_len = 0
    left = 0

    for right, char in enumerate(s):
        if char in last_seen and last_seen[char] >= left:
            left = last_seen[char] + 1
        last_seen[char] = right
        max_len = max(max_len, right - left + 1)

    return max_len`,
      },
      revisionHistory: [],
    },
    {
      id: 'sample-4',
      title: '206. Reverse Linked List',
      problemNumber: '206',
      url: 'https://leetcode.com/problems/reverse-linked-list/',
      platform: 'leetcode',
      difficulty: 'Easy',
      patterns: ['In-place Reversal of LL'],
      confidence: 5,
      dateFirstSolved: yesterday,
      lastRevisionDate: '',
      nextRevisionDate: addDaysToDate(today, 28),
      revisionCount: 0,
      solveTimeMinutes: 6,
      isFavorite: false,
      createdAt: yesterday,
      updatedAt: today,
      notes: {
        keyIntuition:
          'Pointer reversal dance: cache nxt = curr.next, point curr.next = prev, step prev = curr, step curr = nxt. When curr is None, prev is the new head.',
        mistakes:
          'Losing reference to curr.next before updating pointer.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        language: 'python',
        codeSnippet: `def reverseList(head: Optional[ListNode]) -> Optional[ListNode]:
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
      },
      revisionHistory: [],
    },
    {
      id: 'sample-5',
      title: '200. Number of Islands',
      problemNumber: '200',
      url: 'https://leetcode.com/problems/number-of-islands/',
      platform: 'leetcode',
      difficulty: 'Medium',
      patterns: ['Tree BFS/DFS', 'Graphs / Union Find'],
      confidence: 1,
      dateFirstSolved: twoDaysAgo,
      lastRevisionDate: '',
      nextRevisionDate: addDaysToDate(today, -1), // 1 day OVERDUE!
      revisionCount: 0,
      solveTimeMinutes: 40,
      isFavorite: true,
      createdAt: twoDaysAgo,
      updatedAt: today,
      notes: {
        keyIntuition:
          'Scan 2D grid. When cell is "1", increment island counter and immediately launch DFS/BFS to sink all 4-directionally connected land to "0" (or mark visited in-place).',
        mistakes:
          'Forgot boundary checks inside DFS before accessing grid indices. Also missed Python recursion depth limit on 300x300 grids (BFS with deque is safer in interviews).',
        timeComplexity: 'O(M * N)',
        spaceComplexity: 'O(M * N) for BFS queue or DFS recursion stack in worst case',
        language: 'python',
        codeSnippet: `def numIslands(grid: list[list[str]]) -> int:
    if not grid: return 0
    rows, cols = len(grid), len(grid[0])
    islands = 0

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '0' # sink the island
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                islands += 1
                dfs(r, c)

    return islands`,
      },
      revisionHistory: [],
    },
  ];
}
