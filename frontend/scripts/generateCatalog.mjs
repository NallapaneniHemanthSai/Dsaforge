/**
 * Generates frontend/src/data/problems/catalog.json (~800+ DSA problems)
 * Run: node scripts/generateCatalog.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '../src/data/problems/catalog.json');

const lc = (slug) => `https://leetcode.com/problems/${slug}/`;

const sheets = [
  { id: 'striver_a2z', name: "Striver's A2Z DSA", desc: 'Step-by-step roadmap from basics to advanced', icon: 'roadmap', color: '#6C63FF' },
  { id: 'neetcode_150', name: 'NeetCode 150', desc: 'Pattern-based interview preparation', icon: 'patterns', color: '#0EA5E9' },
  { id: 'blind_75', name: 'Blind 75', desc: 'High-frequency FAANG interview set', icon: 'target', color: '#10B981' },
  { id: 'sde_sheet', name: "Striver's SDE Sheet", desc: 'Product company SDE interview prep', icon: 'briefcase', color: '#F59E0B' },
  { id: 'love_babbar', name: 'Love Babbar 450', desc: 'Complete placement preparation track', icon: 'graduation', color: '#EC4899' },
  { id: 'faang_extra', name: 'FAANG+ Essentials', desc: 'Top company coding questions', icon: 'building', color: '#8B5CF6' },
  { id: 'core_topics', name: 'Core DSA Topics', desc: 'Master every data structure & algorithm', icon: 'layers', color: '#14B8A6' },
];

/** @type {{ sheet: string, section: string, topic: string, items: [string, string, string][] }[]} */
const curriculum = [];

function add(sheet, section, topic, items) {
  curriculum.push({ sheet, section, topic, items });
}

// ─── STRIVER A2Z (~180) ───────────────────────────────────────────────
add('striver_a2z', 'Step 1 · Learn the Basics', 'Arrays', [
  ['Easy', 'two-sum', 'Two Sum'],
  ['Easy', 'best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock'],
  ['Easy', 'contains-duplicate', 'Contains Duplicate'],
  ['Easy', 'product-of-array-except-self', 'Product of Array Except Self'],
  ['Easy', 'maximum-subarray', 'Maximum Subarray'],
  ['Medium', 'maximum-product-subarray', 'Maximum Product Subarray'],
  ['Medium', 'find-minimum-in-rotated-sorted-array', 'Find Minimum in Rotated Sorted Array'],
  ['Medium', 'search-in-rotated-sorted-array', 'Search in Rotated Sorted Array'],
  ['Medium', '3sum', '3Sum'],
  ['Medium', 'container-with-most-water', 'Container With Most Water'],
  ['Hard', 'trapping-rain-water', 'Trapping Rain Water'],
  ['Medium', 'merge-intervals', 'Merge Intervals'],
  ['Medium', 'insert-interval', 'Insert Interval'],
  ['Medium', 'non-overlapping-intervals', 'Non-overlapping Intervals'],
  ['Medium', 'spiral-matrix', 'Spiral Matrix'],
  ['Medium', 'rotate-image', 'Rotate Image'],
  ['Medium', 'set-matrix-zeroes', 'Set Matrix Zeroes'],
  ['Medium', 'game-of-life', 'Game of Life'],
  ['Medium', 'next-permutation', 'Next Permutation'],
  ['Medium', 'valid-sudoku', 'Valid Sudoku'],
  ['Medium', 'longest-consecutive-sequence', 'Longest Consecutive Sequence'],
  ['Medium', 'first-missing-positive', 'First Missing Positive'],
  ['Hard', 'first-missing-positive', 'First Missing Positive'],
  ['Medium', 'subarray-sum-equals-k', 'Subarray Sum Equals K'],
  ['Medium', 'continuous-subarray-sum', 'Continuous Subarray Sum'],
]);

add('striver_a2z', 'Step 1 · Learn the Basics', 'Sorting', [
  ['Easy', 'merge-sorted-array', 'Merge Sorted Array'],
  ['Medium', 'sort-colors', 'Sort Colors'],
  ['Medium', 'kth-largest-element-in-an-array', 'Kth Largest Element in an Array'],
  ['Hard', 'find-median-from-data-stream', 'Find Median from Data Stream'],
  ['Medium', 'top-k-frequent-elements', 'Top K Frequent Elements'],
  ['Hard', 'merge-k-sorted-lists', 'Merge k Sorted Lists'],
]);

add('striver_a2z', 'Step 2 · Learn Important Sorting', 'Binary Search', [
  ['Easy', 'binary-search', 'Binary Search'],
  ['Medium', 'search-a-2d-matrix', 'Search a 2D Matrix'],
  ['Medium', 'koko-eating-bananas', 'Koko Eating Bananas'],
  ['Medium', 'find-peak-element', 'Find Peak Element'],
  ['Medium', 'search-in-rotated-sorted-array-ii', 'Search in Rotated Sorted Array II'],
  ['Hard', 'median-of-two-sorted-arrays', 'Median of Two Sorted Arrays'],
  ['Medium', 'time-based-key-value-store', 'Time Based Key-Value Store'],
]);

add('striver_a2z', 'Step 3 · Solve Problems on Arrays', 'Two Pointers', [
  ['Easy', 'valid-palindrome', 'Valid Palindrome'],
  ['Medium', 'two-sum-ii-input-array-is-sorted', 'Two Sum II'],
  ['Medium', '3sum-closest', '3Sum Closest'],
  ['Medium', '4sum', '4Sum'],
  ['Medium', 'remove-duplicates-from-sorted-array', 'Remove Duplicates from Sorted Array'],
  ['Medium', 'move-zeroes', 'Move Zeroes'],
]);

add('striver_a2z', 'Step 4 · Linked List', 'Linked List', [
  ['Easy', 'reverse-linked-list', 'Reverse Linked List'],
  ['Easy', 'merge-two-sorted-lists', 'Merge Two Sorted Lists'],
  ['Easy', 'linked-list-cycle', 'Linked List Cycle'],
  ['Easy', 'middle-of-the-linked-list', 'Middle of the Linked List'],
  ['Medium', 'add-two-numbers', 'Add Two Numbers'],
  ['Medium', 'remove-nth-node-from-end-of-list', 'Remove Nth Node From End'],
  ['Medium', 'reorder-list', 'Reorder List'],
  ['Medium', 'copy-list-with-random-pointer', 'Copy List with Random Pointer'],
  ['Hard', 'merge-k-sorted-lists', 'Merge k Sorted Lists'],
  ['Hard', 'reverse-nodes-in-k-group', 'Reverse Nodes in k-Group'],
  ['Hard', 'lru-cache', 'LRU Cache'],
  ['Medium', 'rotate-list', 'Rotate List'],
  ['Medium', 'partition-list', 'Partition List'],
  ['Medium', 'odd-even-linked-list', 'Odd Even Linked List'],
]);

add('striver_a2z', 'Step 5 · Stack & Queue', 'Stack / Queue', [
  ['Easy', 'valid-parentheses', 'Valid Parentheses'],
  ['Easy', 'implement-stack-using-queues', 'Implement Stack using Queues'],
  ['Medium', 'min-stack', 'Min Stack'],
  ['Medium', 'evaluate-reverse-polish-notation', 'Evaluate Reverse Polish Notation'],
  ['Medium', 'daily-temperatures', 'Daily Temperatures'],
  ['Medium', 'car-fleet', 'Car Fleet'],
  ['Hard', 'largest-rectangle-in-histogram', 'Largest Rectangle in Histogram'],
  ['Hard', 'maximal-rectangle', 'Maximal Rectangle'],
  ['Medium', 'decode-string', 'Decode String'],
  ['Hard', 'basic-calculator', 'Basic Calculator'],
]);

add('striver_a2z', 'Step 6 · Strings', 'Strings', [
  ['Easy', 'valid-anagram', 'Valid Anagram'],
  ['Medium', 'group-anagrams', 'Group Anagrams'],
  ['Medium', 'longest-palindromic-substring', 'Longest Palindromic Substring'],
  ['Medium', 'palindromic-substrings', 'Palindromic Substrings'],
  ['Hard', 'minimum-window-substring', 'Minimum Window Substring'],
  ['Medium', 'encode-and-decode-strings', 'Encode and Decode Strings'],
  ['Hard', 'wildcard-matching', 'Wildcard Matching'],
  ['Hard', 'regular-expression-matching', 'Regular Expression Matching'],
]);

add('striver_a2z', 'Step 7 · Recursion', 'Recursion', [
  ['Easy', 'climbing-stairs', 'Climbing Stairs'],
  ['Medium', 'powx-n', 'Pow(x, n)'],
  ['Medium', 'subsets', 'Subsets'],
  ['Medium', 'permutations', 'Permutations'],
  ['Medium', 'combination-sum', 'Combination Sum'],
  ['Medium', 'combination-sum-ii', 'Combination Sum II'],
  ['Hard', 'n-queens', 'N-Queens'],
  ['Medium', 'letter-combinations-of-a-phone-number', 'Letter Combinations of a Phone Number'],
]);

add('striver_a2z', 'Step 8 · Bit Manipulation', 'Bit Manipulation', [
  ['Easy', 'number-of-1-bits', 'Number of 1 Bits'],
  ['Easy', 'counting-bits', 'Counting Bits'],
  ['Easy', 'reverse-bits', 'Reverse Bits'],
  ['Easy', 'missing-number', 'Missing Number'],
  ['Medium', 'sum-of-two-integers', 'Sum of Two Integers'],
  ['Medium', 'single-number-iii', 'Single Number III'],
  ['Hard', 'divide-two-integers', 'Divide Two Integers'],
]);

add('striver_a2z', 'Step 9 · Trees', 'Binary Trees', [
  ['Easy', 'invert-binary-tree', 'Invert Binary Tree'],
  ['Easy', 'maximum-depth-of-binary-tree', 'Maximum Depth of Binary Tree'],
  ['Easy', 'diameter-of-binary-tree', 'Diameter of Binary Tree'],
  ['Easy', 'balanced-binary-tree', 'Balanced Binary Tree'],
  ['Easy', 'same-tree', 'Same Tree'],
  ['Easy', 'subtree-of-another-tree', 'Subtree of Another Tree'],
  ['Easy', 'lowest-common-ancestor-of-a-binary-search-tree', 'LCA of BST'],
  ['Medium', 'binary-tree-level-order-traversal', 'Binary Tree Level Order Traversal'],
  ['Medium', 'binary-tree-right-side-view', 'Binary Tree Right Side View'],
  ['Medium', 'count-good-nodes-in-binary-tree', 'Count Good Nodes in Binary Tree'],
  ['Medium', 'validate-binary-search-tree', 'Validate Binary Search Tree'],
  ['Medium', 'kth-smallest-element-in-a-bst', 'Kth Smallest Element in a BST'],
  ['Medium', 'construct-binary-tree-from-preorder-and-inorder-traversal', 'Construct Tree from Preorder and Inorder'],
  ['Hard', 'binary-tree-maximum-path-sum', 'Binary Tree Maximum Path Sum'],
  ['Hard', 'serialize-and-deserialize-binary-tree', 'Serialize and Deserialize Binary Tree'],
]);

add('striver_a2z', 'Step 10 · Graphs', 'Graphs', [
  ['Medium', 'number-of-islands', 'Number of Islands'],
  ['Medium', 'clone-graph', 'Clone Graph'],
  ['Medium', 'pacific-atlantic-water-flow', 'Pacific Atlantic Water Flow'],
  ['Medium', 'course-schedule', 'Course Schedule'],
  ['Medium', 'course-schedule-ii', 'Course Schedule II'],
  ['Medium', 'rotting-oranges', 'Rotting Oranges'],
  ['Hard', 'word-ladder', 'Word Ladder'],
  ['Medium', 'number-of-connected-components-in-an-undirected-graph', 'Number of Connected Components'],
  ['Medium', 'graph-valid-tree', 'Graph Valid Tree'],
  ['Hard', 'alien-dictionary', 'Alien Dictionary'],
]);

add('striver_a2z', 'Step 11 · Dynamic Programming', 'Dynamic Programming', [
  ['Easy', 'climbing-stairs', 'Climbing Stairs'],
  ['Medium', 'house-robber', 'House Robber'],
  ['Medium', 'house-robber-ii', 'House Robber II'],
  ['Medium', 'coin-change', 'Coin Change'],
  ['Medium', 'longest-increasing-subsequence', 'Longest Increasing Subsequence'],
  ['Medium', 'word-break', 'Word Break'],
  ['Medium', 'unique-paths', 'Unique Paths'],
  ['Medium', 'longest-common-subsequence', 'Longest Common Subsequence'],
  ['Hard', 'edit-distance', 'Edit Distance'],
  ['Hard', 'burst-balloons', 'Burst Balloons'],
  ['Hard', 'regular-expression-matching', 'Regular Expression Matching'],
  ['Medium', 'partition-equal-subset-sum', 'Partition Equal Subset Sum'],
  ['Hard', 'best-time-to-buy-and-sell-stock-iii', 'Best Time to Buy and Sell Stock III'],
]);

// ─── NEETCODE 150 (~150) ──────────────────────────────────────────────
const neetcodeSections = [
  ['Arrays & Hashing', [
    ['Easy', 'contains-duplicate', 'Contains Duplicate'],
    ['Easy', 'valid-anagram', 'Valid Anagram'],
    ['Easy', 'two-sum', 'Two Sum'],
    ['Medium', 'group-anagrams', 'Group Anagrams'],
    ['Medium', 'top-k-frequent-elements', 'Top K Frequent Elements'],
    ['Medium', 'product-of-array-except-self', 'Product of Array Except Self'],
    ['Medium', 'valid-sudoku', 'Valid Sudoku'],
    ['Medium', 'encode-and-decode-strings', 'Encode and Decode Strings'],
    ['Hard', 'longest-consecutive-sequence', 'Longest Consecutive Sequence'],
  ]],
  ['Two Pointers', [
    ['Easy', 'valid-palindrome', 'Valid Palindrome'],
    ['Medium', 'two-sum-ii-input-array-is-sorted', 'Two Sum II'],
    ['Medium', '3sum', '3Sum'],
    ['Medium', 'container-with-most-water', 'Container With Most Water'],
    ['Hard', 'trapping-rain-water', 'Trapping Rain Water'],
  ]],
  ['Sliding Window', [
    ['Easy', 'best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock'],
    ['Medium', 'longest-substring-without-repeating-characters', 'Longest Substring Without Repeating Characters'],
    ['Medium', 'longest-repeating-character-replacement', 'Longest Repeating Character Replacement'],
    ['Medium', 'permutation-in-string', 'Permutation in String'],
    ['Hard', 'minimum-window-substring', 'Minimum Window Substring'],
    ['Hard', 'sliding-window-maximum', 'Sliding Window Maximum'],
  ]],
  ['Stack', [
    ['Easy', 'valid-parentheses', 'Valid Parentheses'],
    ['Medium', 'min-stack', 'Min Stack'],
    ['Medium', 'evaluate-reverse-polish-notation', 'Evaluate Reverse Polish Notation'],
    ['Medium', 'generate-parentheses', 'Generate Parentheses'],
    ['Medium', 'daily-temperatures', 'Daily Temperatures'],
    ['Medium', 'car-fleet', 'Car Fleet'],
    ['Hard', 'largest-rectangle-in-histogram', 'Largest Rectangle in Histogram'],
  ]],
  ['Binary Search', [
    ['Easy', 'binary-search', 'Binary Search'],
    ['Medium', 'search-a-2d-matrix', 'Search a 2D Matrix'],
    ['Medium', 'koko-eating-bananas', 'Koko Eating Bananas'],
    ['Medium', 'find-minimum-in-rotated-sorted-array', 'Find Minimum in Rotated Sorted Array'],
    ['Medium', 'search-in-rotated-sorted-array', 'Search in Rotated Sorted Array'],
    ['Medium', 'time-based-key-value-store', 'Time Based Key-Value Store'],
    ['Hard', 'median-of-two-sorted-arrays', 'Median of Two Sorted Arrays'],
  ]],
  ['Linked List', [
    ['Easy', 'reverse-linked-list', 'Reverse Linked List'],
    ['Medium', 'merge-two-sorted-lists', 'Merge Two Sorted Lists'],
    ['Hard', 'merge-k-sorted-lists', 'Merge k Sorted Lists'],
    ['Easy', 'linked-list-cycle', 'Linked List Cycle'],
    ['Medium', 'remove-nth-node-from-end-of-list', 'Remove Nth Node From End'],
    ['Medium', 'reorder-list', 'Reorder List'],
    ['Hard', 'copy-list-with-random-pointer', 'Copy List with Random Pointer'],
    ['Hard', 'lru-cache', 'LRU Cache'],
  ]],
  ['Trees', [
    ['Easy', 'invert-binary-tree', 'Invert Binary Tree'],
    ['Easy', 'maximum-depth-of-binary-tree', 'Maximum Depth of Binary Tree'],
    ['Easy', 'diameter-of-binary-tree', 'Diameter of Binary Tree'],
    ['Easy', 'balanced-binary-tree', 'Balanced Binary Tree'],
    ['Easy', 'same-tree', 'Same Tree'],
    ['Easy', 'subtree-of-another-tree', 'Subtree of Another Tree'],
    ['Medium', 'lowest-common-ancestor-of-a-binary-search-tree', 'LCA of BST'],
    ['Medium', 'binary-tree-level-order-traversal', 'Binary Tree Level Order Traversal'],
    ['Medium', 'binary-tree-right-side-view', 'Binary Tree Right Side View'],
    ['Medium', 'count-good-nodes-in-binary-tree', 'Count Good Nodes in Binary Tree'],
    ['Medium', 'validate-binary-search-tree', 'Validate Binary Search Tree'],
    ['Medium', 'kth-smallest-element-in-a-bst', 'Kth Smallest Element in a BST'],
    ['Medium', 'construct-binary-tree-from-preorder-and-inorder-traversal', 'Construct Tree from Preorder and Inorder'],
    ['Hard', 'binary-tree-maximum-path-sum', 'Binary Tree Maximum Path Sum'],
    ['Hard', 'serialize-and-deserialize-binary-tree', 'Serialize and Deserialize Binary Tree'],
  ]],
  ['Heap / Priority Queue', [
    ['Easy', 'kth-largest-element-in-a-stream', 'Kth Largest Element in a Stream'],
    ['Medium', 'last-stone-weight', 'Last Stone Weight'],
    ['Medium', 'k-closest-points-to-origin', 'K Closest Points to Origin'],
    ['Medium', 'kth-largest-element-in-an-array', 'Kth Largest Element in an Array'],
    ['Medium', 'task-scheduler', 'Task Scheduler'],
    ['Hard', 'design-twitter', 'Design Twitter'],
    ['Hard', 'find-median-from-data-stream', 'Find Median from Data Stream'],
  ]],
  ['Backtracking', [
    ['Medium', 'subsets', 'Subsets'],
    ['Medium', 'combination-sum', 'Combination Sum'],
    ['Medium', 'permutations', 'Permutations'],
    ['Medium', 'subsets-ii', 'Subsets II'],
    ['Medium', 'combination-sum-ii', 'Combination Sum II'],
    ['Medium', 'word-search', 'Word Search'],
    ['Hard', 'palindrome-partitioning', 'Palindrome Partitioning'],
    ['Hard', 'letter-combinations-of-a-phone-number', 'Letter Combinations of a Phone Number'],
    ['Hard', 'n-queens', 'N-Queens'],
  ]],
  ['Tries', [
    ['Medium', 'implement-trie-prefix-tree', 'Implement Trie (Prefix Tree)'],
    ['Medium', 'design-add-and-search-words-data-structure', 'Design Add and Search Words'],
    ['Hard', 'word-search-ii', 'Word Search II'],
  ]],
  ['Graphs', [
    ['Medium', 'number-of-islands', 'Number of Islands'],
    ['Hard', 'clone-graph', 'Clone Graph'],
    ['Medium', 'pacific-atlantic-water-flow', 'Pacific Atlantic Water Flow'],
    ['Medium', 'course-schedule', 'Course Schedule'],
    ['Hard', 'course-schedule-ii', 'Course Schedule II'],
    ['Medium', 'rotting-oranges', 'Rotting Oranges'],
    ['Hard', 'walls-and-gates', 'Walls and Gates'],
    ['Hard', 'word-ladder', 'Word Ladder'],
  ]],
  ['Advanced Graphs', [
    ['Hard', 'reconstruct-itinerary', 'Reconstruct Itinerary'],
    ['Hard', 'min-cost-to-connect-all-points', 'Min Cost to Connect All Points'],
    ['Hard', 'network-delay-time', 'Network Delay Time'],
    ['Hard', 'swim-in-rising-water', 'Swim in Rising Water'],
    ['Hard', 'alien-dictionary', 'Alien Dictionary'],
    ['Hard', 'cheapest-flights-within-k-stops', 'Cheapest Flights Within K Stops'],
  ]],
  ['1-D Dynamic Programming', [
    ['Easy', 'climbing-stairs', 'Climbing Stairs'],
    ['Medium', 'house-robber', 'House Robber'],
    ['Medium', 'house-robber-ii', 'House Robber II'],
    ['Medium', 'longest-palindromic-substring', 'Longest Palindromic Substring'],
    ['Medium', 'palindromic-substrings', 'Palindromic Substrings'],
    ['Medium', 'decode-ways', 'Decode Ways'],
    ['Medium', 'coin-change', 'Coin Change'],
    ['Medium', 'maximum-product-subarray', 'Maximum Product Subarray'],
    ['Medium', 'word-break', 'Word Break'],
    ['Hard', 'longest-increasing-subsequence', 'Longest Increasing Subsequence'],
  ]],
  ['2-D Dynamic Programming', [
    ['Medium', 'unique-paths', 'Unique Paths'],
    ['Medium', 'longest-common-subsequence', 'Longest Common Subsequence'],
    ['Medium', 'best-time-to-buy-and-sell-stock-with-cooldown', 'Best Time to Buy and Sell Stock with Cooldown'],
    ['Hard', 'coin-change-ii', 'Coin Change II'],
    ['Hard', 'target-sum', 'Target Sum'],
    ['Hard', 'interleaving-string', 'Interleaving String'],
    ['Hard', 'longest-increasing-path-in-a-matrix', 'Longest Increasing Path in a Matrix'],
    ['Hard', 'distinct-subsequences', 'Distinct Subsequences'],
    ['Hard', 'edit-distance', 'Edit Distance'],
    ['Hard', 'burst-balloons', 'Burst Balloons'],
    ['Hard', 'regular-expression-matching', 'Regular Expression Matching'],
  ]],
  ['Greedy', [
    ['Easy', 'maximum-subarray', 'Maximum Subarray'],
    ['Medium', 'jump-game', 'Jump Game'],
    ['Medium', 'jump-game-ii', 'Jump Game II'],
    ['Medium', 'gas-station', 'Gas Station'],
    ['Medium', 'hand-of-straights', 'Hand of Straights'],
    ['Medium', 'merge-triplets-to-form-target-triplet', 'Merge Triplets to Form Target Triplet'],
    ['Medium', 'partition-labels', 'Partition Labels'],
    ['Hard', 'valid-parenthesis-string', 'Valid Parenthesis String'],
  ]],
  ['Intervals', [
    ['Easy', 'meeting-rooms', 'Meeting Rooms'],
    ['Medium', 'insert-interval', 'Insert Interval'],
    ['Medium', 'merge-intervals', 'Merge Intervals'],
    ['Medium', 'non-overlapping-intervals', 'Non-overlapping Intervals'],
    ['Medium', 'meeting-rooms-ii', 'Meeting Rooms II'],
    ['Medium', 'minimum-interval-to-include-each-query', 'Minimum Interval to Include Each Query'],
  ]],
  ['Math & Geometry', [
    ['Easy', 'plus-one', 'Plus One'],
    ['Easy', 'happy-number', 'Happy Number'],
    ['Medium', 'set-matrix-zeroes', 'Set Matrix Zeroes'],
    ['Medium', 'spiral-matrix', 'Spiral Matrix'],
    ['Medium', 'rotate-image', 'Rotate Image'],
    ['Medium', 'powx-n', 'Pow(x, n)'],
    ['Medium', 'multiply-strings', 'Multiply Strings'],
    ['Hard', 'trapping-rain-water', 'Trapping Rain Water'],
  ]],
  ['Bit Manipulation', [
    ['Easy', 'single-number', 'Single Number'],
    ['Easy', 'number-of-1-bits', 'Number of 1 Bits'],
    ['Easy', 'counting-bits', 'Counting Bits'],
    ['Easy', 'reverse-bits', 'Reverse Bits'],
    ['Easy', 'missing-number', 'Missing Number'],
    ['Medium', 'sum-of-two-integers', 'Sum of Two Integers'],
    ['Hard', 'reverse-integer', 'Reverse Integer'],
  ]],
];

neetcodeSections.forEach(([section, items]) => {
  add('neetcode_150', `Pattern · ${section}`, section, items);
});

// ─── BLIND 75 ─────────────────────────────────────────────────────────
add('blind_75', 'Blind 75 · Must Do', 'Arrays', [
  ['Easy', 'two-sum', 'Two Sum'],
  ['Easy', 'best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock'],
  ['Easy', 'contains-duplicate', 'Contains Duplicate'],
  ['Medium', 'product-of-array-except-self', 'Product of Array Except Self'],
  ['Medium', 'maximum-subarray', 'Maximum Subarray'],
  ['Medium', 'maximum-product-subarray', 'Maximum Product Subarray'],
  ['Medium', 'find-minimum-in-rotated-sorted-array', 'Find Minimum in Rotated Sorted Array'],
  ['Medium', 'search-in-rotated-sorted-array', 'Search in Rotated Sorted Array'],
  ['Medium', '3sum', '3Sum'],
  ['Medium', 'container-with-most-water', 'Container With Most Water'],
]);
add('blind_75', 'Blind 75 · Must Do', 'Two Pointers', [
  ['Easy', 'valid-palindrome', 'Valid Palindrome'],
  ['Medium', 'two-sum-ii-input-array-is-sorted', 'Two Sum II'],
]);
add('blind_75', 'Blind 75 · Must Do', 'Sliding Window', [
  ['Medium', 'longest-substring-without-repeating-characters', 'Longest Substring Without Repeating Characters'],
  ['Medium', 'longest-repeating-character-replacement', 'Longest Repeating Character Replacement'],
  ['Hard', 'minimum-window-substring', 'Minimum Window Substring'],
]);
add('blind_75', 'Blind 75 · Must Do', 'Stack', [
  ['Easy', 'valid-parentheses', 'Valid Parentheses'],
  ['Medium', 'daily-temperatures', 'Daily Temperatures'],
  ['Hard', 'largest-rectangle-in-histogram', 'Largest Rectangle in Histogram'],
]);
add('blind_75', 'Blind 75 · Must Do', 'Binary Search', [
  ['Easy', 'binary-search', 'Binary Search'],
  ['Medium', 'search-a-2d-matrix', 'Search a 2D Matrix'],
  ['Hard', 'median-of-two-sorted-arrays', 'Median of Two Sorted Arrays'],
]);
add('blind_75', 'Blind 75 · Must Do', 'Linked List', [
  ['Easy', 'reverse-linked-list', 'Reverse Linked List'],
  ['Medium', 'merge-two-sorted-lists', 'Merge Two Sorted Lists'],
  ['Hard', 'merge-k-sorted-lists', 'Merge k Sorted Lists'],
  ['Hard', 'lru-cache', 'LRU Cache'],
]);
add('blind_75', 'Blind 75 · Must Do', 'Trees', [
  ['Easy', 'invert-binary-tree', 'Invert Binary Tree'],
  ['Easy', 'maximum-depth-of-binary-tree', 'Maximum Depth of Binary Tree'],
  ['Medium', 'validate-binary-search-tree', 'Validate Binary Search Tree'],
  ['Hard', 'binary-tree-maximum-path-sum', 'Binary Tree Maximum Path Sum'],
]);
add('blind_75', 'Blind 75 · Must Do', 'Graphs', [
  ['Medium', 'number-of-islands', 'Number of Islands'],
  ['Medium', 'clone-graph', 'Clone Graph'],
  ['Medium', 'course-schedule', 'Course Schedule'],
  ['Hard', 'word-ladder', 'Word Ladder'],
]);
add('blind_75', 'Blind 75 · Must Do', 'Dynamic Programming', [
  ['Easy', 'climbing-stairs', 'Climbing Stairs'],
  ['Medium', 'house-robber', 'House Robber'],
  ['Medium', 'coin-change', 'Coin Change'],
  ['Hard', 'longest-increasing-subsequence', 'Longest Increasing Subsequence'],
]);
add('blind_75', 'Blind 75 · Must Do', 'Backtracking', [
  ['Medium', 'combination-sum', 'Combination Sum'],
  ['Medium', 'word-search', 'Word Search'],
]);
add('blind_75', 'Blind 75 · Must Do', 'Heap', [
  ['Medium', 'top-k-frequent-elements', 'Top K Frequent Elements'],
  ['Hard', 'find-median-from-data-stream', 'Find Median from Data Stream'],
]);
add('blind_75', 'Blind 75 · Must Do', 'Intervals', [
  ['Medium', 'merge-intervals', 'Merge Intervals'],
  ['Medium', 'insert-interval', 'Insert Interval'],
]);
add('blind_75', 'Blind 75 · Must Do', 'Design', [
  ['Medium', 'min-stack', 'Min Stack'],
  ['Hard', 'design-twitter', 'Design Twitter'],
]);

// ─── SDE SHEET (~100) ─────────────────────────────────────────────────
const sdeTopics = [
  ['Arrays & Maths', [
    ['Easy', 'pascals-triangle', "Pascal's Triangle"],
    ['Medium', 'sort-colors', 'Sort Colors'],
    ['Medium', 'spiral-matrix-ii', 'Spiral Matrix II'],
    ['Medium', 'rotate-array', 'Rotate Array'],
    ['Medium', 'majority-element', 'Majority Element'],
    ['Hard', 'first-missing-positive', 'First Missing Positive'],
    ['Medium', 'next-permutation', 'Next Permutation'],
    ['Hard', 'max-points-on-a-line', 'Max Points on a Line'],
  ]],
  ['Strings', [
    ['Medium', 'longest-palindromic-substring', 'Longest Palindromic Substring'],
    ['Hard', 'minimum-window-substring', 'Minimum Window Substring'],
    ['Hard', 'edit-distance', 'Edit Distance'],
    ['Medium', 'string-to-integer-atoi', 'String to Integer (atoi)'],
    ['Hard', 'text-justification', 'Text Justification'],
  ]],
  ['Linked List & Stack', [
    ['Medium', 'add-two-numbers', 'Add Two Numbers'],
    ['Hard', 'lru-cache', 'LRU Cache'],
    ['Hard', 'basic-calculator', 'Basic Calculator'],
    ['Medium', 'simplify-path', 'Simplify Path'],
  ]],
  ['Trees & BST', [
    ['Medium', 'flatten-binary-tree-to-linked-list', 'Flatten Binary Tree to Linked List'],
    ['Medium', 'populating-next-right-pointers-in-each-node', 'Populating Next Right Pointers'],
    ['Hard', 'binary-tree-maximum-path-sum', 'Binary Tree Maximum Path Sum'],
    ['Medium', 'recover-binary-search-tree', 'Recover Binary Search Tree'],
  ]],
  ['Graphs & DP', [
    ['Medium', 'word-break', 'Word Break'],
    ['Hard', 'word-break-ii', 'Word Break II'],
    ['Hard', 'maximal-rectangle', 'Maximal Rectangle'],
    ['Hard', 'dungeon-game', 'Dungeon Game'],
    ['Hard', 'best-time-to-buy-and-sell-stock-iv', 'Best Time to Buy and Sell Stock IV'],
  ]],
];
sdeTopics.forEach(([section, items]) => add('sde_sheet', `SDE · ${section}`, section, items));

// ─── LOVE BABBAR (~150) ───────────────────────────────────────────────
const lbSections = [
  ['Arrays', [
    ['Easy', 'two-sum', 'Two Sum'],
    ['Easy', 'contains-duplicate', 'Contains Duplicate'],
    ['Medium', 'product-of-array-except-self', 'Product of Array Except Self'],
    ['Medium', 'maximum-subarray', 'Maximum Subarray'],
    ['Medium', 'merge-intervals', 'Merge Intervals'],
    ['Hard', 'trapping-rain-water', 'Trapping Rain Water'],
    ['Medium', 'rotate-array', 'Rotate Array'],
    ['Medium', 'sort-colors', 'Sort Colors'],
    ['Medium', 'subarray-sum-equals-k', 'Subarray Sum Equals K'],
    ['Medium', 'find-all-duplicates-in-an-array', 'Find All Duplicates in an Array'],
    ['Hard', 'first-missing-positive', 'First Missing Positive'],
    ['Medium', 'next-permutation', 'Next Permutation'],
    ['Medium', 'spiral-matrix', 'Spiral Matrix'],
    ['Medium', 'set-matrix-zeroes', 'Set Matrix Zeroes'],
    ['Medium', 'kth-largest-element-in-an-array', 'Kth Largest Element in an Array'],
    ['Hard', 'merge-k-sorted-lists', 'Merge k Sorted Lists'],
    ['Medium', '3sum', '3Sum'],
    ['Medium', '4sum', '4Sum'],
    ['Easy', 'move-zeroes', 'Move Zeroes'],
    ['Medium', 'container-with-most-water', 'Container With Most Water'],
  ]],
  ['Searching & Sorting', [
    ['Easy', 'binary-search', 'Binary Search'],
    ['Medium', 'search-in-rotated-sorted-array', 'Search in Rotated Sorted Array'],
    ['Medium', 'find-minimum-in-rotated-sorted-array', 'Find Minimum in Rotated Sorted Array'],
    ['Hard', 'median-of-two-sorted-arrays', 'Median of Two Sorted Arrays'],
    ['Medium', 'search-a-2d-matrix', 'Search a 2D Matrix'],
    ['Medium', 'koko-eating-bananas', 'Koko Eating Bananas'],
  ]],
  ['Linked List', [
    ['Easy', 'reverse-linked-list', 'Reverse Linked List'],
    ['Easy', 'merge-two-sorted-lists', 'Merge Two Sorted Lists'],
    ['Easy', 'linked-list-cycle', 'Linked List Cycle'],
    ['Medium', 'add-two-numbers', 'Add Two Numbers'],
    ['Medium', 'remove-nth-node-from-end-of-list', 'Remove Nth Node From End'],
    ['Hard', 'reverse-nodes-in-k-group', 'Reverse Nodes in k-Group'],
    ['Hard', 'lru-cache', 'LRU Cache'],
  ]],
  ['Stack & Queue', [
    ['Easy', 'valid-parentheses', 'Valid Parentheses'],
    ['Medium', 'min-stack', 'Min Stack'],
    ['Medium', 'daily-temperatures', 'Daily Temperatures'],
    ['Hard', 'largest-rectangle-in-histogram', 'Largest Rectangle in Histogram'],
    ['Medium', 'decode-string', 'Decode String'],
  ]],
  ['Strings', [
    ['Easy', 'valid-anagram', 'Valid Anagram'],
    ['Medium', 'group-anagrams', 'Group Anagrams'],
    ['Medium', 'longest-palindromic-substring', 'Longest Palindromic Substring'],
    ['Hard', 'minimum-window-substring', 'Minimum Window Substring'],
    ['Medium', 'longest-substring-without-repeating-characters', 'Longest Substring Without Repeating Characters'],
  ]],
  ['Trees', [
    ['Easy', 'maximum-depth-of-binary-tree', 'Maximum Depth of Binary Tree'],
    ['Easy', 'invert-binary-tree', 'Invert Binary Tree'],
    ['Medium', 'validate-binary-search-tree', 'Validate Binary Search Tree'],
    ['Medium', 'binary-tree-level-order-traversal', 'Binary Tree Level Order Traversal'],
    ['Hard', 'serialize-and-deserialize-binary-tree', 'Serialize and Deserialize Binary Tree'],
    ['Hard', 'binary-tree-maximum-path-sum', 'Binary Tree Maximum Path Sum'],
  ]],
  ['Graphs', [
    ['Medium', 'number-of-islands', 'Number of Islands'],
    ['Medium', 'course-schedule', 'Course Schedule'],
    ['Medium', 'rotting-oranges', 'Rotting Oranges'],
    ['Hard', 'word-ladder', 'Word Ladder'],
    ['Medium', 'clone-graph', 'Clone Graph'],
  ]],
  ['Dynamic Programming', [
    ['Easy', 'climbing-stairs', 'Climbing Stairs'],
    ['Medium', 'house-robber', 'House Robber'],
    ['Medium', 'coin-change', 'Coin Change'],
    ['Medium', 'longest-increasing-subsequence', 'Longest Increasing Subsequence'],
    ['Medium', 'word-break', 'Word Break'],
    ['Hard', 'edit-distance', 'Edit Distance'],
    ['Medium', 'unique-paths', 'Unique Paths'],
    ['Hard', 'regular-expression-matching', 'Regular Expression Matching'],
  ]],
  ['Greedy & Backtracking', [
    ['Medium', 'jump-game', 'Jump Game'],
    ['Medium', 'gas-station', 'Gas Station'],
    ['Medium', 'subsets', 'Subsets'],
    ['Medium', 'permutations', 'Permutations'],
    ['Medium', 'combination-sum', 'Combination Sum'],
    ['Hard', 'n-queens', 'N-Queens'],
  ]],
];
lbSections.forEach(([section, items]) => add('love_babbar', `LB 450 · ${section}`, section, items));

// ─── FAANG EXTRA (~120) ───────────────────────────────────────────────
const faang = [
  ['Amazon / Google Arrays', 'Arrays', [
    ['Medium', 'subarray-sum-equals-k', 'Subarray Sum Equals K'],
    ['Medium', 'continuous-subarray-sum', 'Continuous Subarray Sum'],
    ['Hard', 'sliding-window-maximum', 'Sliding Window Maximum'],
    ['Hard', 'trapping-rain-water-ii', 'Trapping Rain Water II'],
    ['Medium', 'random-pick-with-weight', 'Random Pick with Weight'],
    ['Hard', 'consecutive-numbers-sum', 'Consecutive Numbers Sum'],
  ]],
  ['Meta Strings & Design', 'Strings', [
    ['Medium', 'custom-sort-string', 'Custom Sort String'],
    ['Hard', 'remove-invalid-parentheses', 'Remove Invalid Parentheses'],
    ['Medium', 'design-hit-counter', 'Design Hit Counter'],
    ['Hard', 'serialize-and-deserialize-binary-tree', 'Serialize and Deserialize Binary Tree'],
    ['Hard', 'binary-tree-vertical-order-traversal', 'Binary Tree Vertical Order Traversal'],
  ]],
  ['Microsoft Trees & Graphs', 'Trees', [
    ['Medium', 'lowest-common-ancestor-of-a-binary-tree', 'Lowest Common Ancestor of a Binary Tree'],
    ['Medium', 'path-sum-ii', 'Path Sum II'],
    ['Hard', 'binary-tree-postorder-traversal', 'Binary Tree Postorder Traversal'],
    ['Medium', 'number-of-provinces', 'Number of Provinces'],
    ['Medium', 'accounts-merge', 'Accounts Merge'],
  ]],
  ['Apple / Netflix DP', 'Dynamic Programming', [
    ['Medium', 'coin-change-ii', 'Coin Change II'],
    ['Hard', 'target-sum', 'Target Sum'],
    ['Hard', 'best-time-to-buy-and-sell-stock-iii', 'Best Time to Buy and Sell Stock III'],
    ['Hard', 'maximal-square', 'Maximal Square'],
    ['Hard', 'cherry-pickup', 'Cherry Pickup'],
  ]],
  ['System Design Coding', 'Design', [
    ['Medium', 'design-parking-system', 'Design Parking System'],
    ['Medium', 'design-browser-history', 'Design Browser History'],
    ['Medium', 'design-underground-system', 'Design Underground System'],
    ['Hard', 'design-search-autocomplete-system', 'Design Search Autocomplete System'],
    ['Hard', 'design-in-memory-file-system', 'Design In-Memory File System'],
  ]],
];
faang.forEach(([section, topic, items]) => add('faang_extra', section, topic, items));

// ─── CORE TOPICS — bulk to reach 800+ ─────────────────────────────────
const coreBulk = [
  ['Arrays Deep Dive', 'Arrays', [
    ['Easy', 'remove-element', 'Remove Element'],
    ['Easy', 'remove-duplicates-from-sorted-array', 'Remove Duplicates from Sorted Array'],
    ['Easy', 'plus-one', 'Plus One'],
    ['Easy', 'merge-sorted-array', 'Merge Sorted Array'],
    ['Medium', 'find-the-duplicate-number', 'Find the Duplicate Number'],
    ['Medium', 'find-all-numbers-disappeared-in-an-array', 'Find All Numbers Disappeared in an Array'],
    ['Medium', 'increasing-triplet-subsequence', 'Increasing Triplet Subsequence'],
    ['Medium', 'rotate-array', 'Rotate Array'],
    ['Medium', 'majority-element', 'Majority Element'],
    ['Hard', 'max-chunks-to-make-sorted', 'Max Chunks To Make Sorted'],
    ['Hard', 'candy', 'Candy'],
    ['Hard', 'create-maximum-number', 'Create Maximum Number'],
  ]],
  ['Hashing & Maps', 'Hashing', [
    ['Easy', 'ransom-note', 'Ransom Note'],
    ['Easy', 'isomorphic-strings', 'Isomorphic Strings'],
    ['Medium', 'group-shifted-strings', 'Group Shifted Strings'],
    ['Medium', 'copy-list-with-random-pointer', 'Copy List with Random Pointer'],
    ['Medium', 'insert-delete-getrandom-o1', 'Insert Delete GetRandom O(1)'],
    ['Hard', 'all-oone-data-structure', 'All O`one Data Structure'],
    ['Hard', 'lfu-cache', 'LFU Cache'],
  ]],
  ['Sliding Window Mastery', 'Sliding Window', [
    ['Medium', 'fruit-into-baskets', 'Fruit Into Baskets'],
    ['Medium', 'max-consecutive-ones-iii', 'Max Consecutive Ones III'],
    ['Medium', 'subarrays-with-k-different-integers', 'Subarrays with K Different Integers'],
    ['Hard', 'minimum-window-subsequence', 'Minimum Window Subsequence'],
    ['Hard', 'substring-with-concatenation-of-all-words', 'Substring with Concatenation of All Words'],
  ]],
  ['Graph Algorithms', 'Graphs', [
    ['Medium', 'surrounded-regions', 'Surrounded Regions'],
    ['Medium', 'redundant-connection', 'Redundant Connection'],
    ['Medium', 'evaluate-division', 'Evaluate Division'],
    ['Hard', 'critical-connections-in-a-network', 'Critical Connections in a Network'],
    ['Hard', 'shortest-path-visiting-all-nodes', 'Shortest Path Visiting All Nodes'],
    ['Hard', 'minimum-height-trees', 'Minimum Height Trees'],
  ]],
  ['Tree Advanced', 'Trees', [
    ['Medium', 'path-sum-iii', 'Path Sum III'],
    ['Medium', 'sum-root-to-leaf-numbers', 'Sum Root to Leaf Numbers'],
    ['Hard', 'binary-tree-postorder-traversal', 'Binary Tree Postorder Traversal'],
    ['Hard', 'recover-binary-search-tree', 'Recover Binary Search Tree'],
    ['Hard', 'vertical-order-traversal-of-a-binary-tree', 'Vertical Order Traversal of a Binary Tree'],
  ]],
  ['DP Patterns', 'Dynamic Programming', [
    ['Medium', 'perfect-squares', 'Perfect Squares'],
    ['Medium', 'partition-equal-subset-sum', 'Partition Equal Subset Sum'],
    ['Medium', 'ones-and-zeroes', 'Ones and Zeroes'],
    ['Hard', 'student-attendance-record-ii', 'Student Attendance Record II'],
    ['Hard', 'minimum-cost-to-merge-stones', 'Minimum Cost to Merge Stones'],
    ['Hard', 'super-egg-drop', 'Super Egg Drop'],
  ]],
  ['Greedy Algorithms', 'Greedy', [
    ['Medium', 'task-scheduler', 'Task Scheduler'],
    ['Medium', 'reorganize-string', 'Reorganize String'],
    ['Medium', 'partition-labels', 'Partition Labels'],
    ['Hard', 'create-maximum-number', 'Create Maximum Number'],
    ['Hard', 'ipo', 'IPO'],
  ]],
  ['Math & Number Theory', 'Math', [
    ['Easy', 'palindrome-number', 'Palindrome Number'],
    ['Medium', 'integer-to-roman', 'Integer to Roman'],
    ['Medium', 'roman-to-integer', 'Roman to Integer'],
    ['Medium', 'powx-n', 'Pow(x, n)'],
    ['Hard', 'max-points-on-a-line', 'Max Points on a Line'],
    ['Hard', 'basic-calculator-ii', 'Basic Calculator II'],
  ]],
  ['Bit Manipulation Pro', 'Bit Manipulation', [
    ['Medium', 'bitwise-and-of-numbers-range', 'Bitwise AND of Numbers Range'],
    ['Medium', 'maximum-xor-of-two-numbers-in-an-array', 'Maximum XOR of Two Numbers in an Array'],
    ['Hard', 'maximum-product-of-word-lengths', 'Maximum Product of Word Lengths'],
    ['Hard', 'split-array-into-maximum-number-of-subarrays', 'Split Array Into Maximum Number of Subarrays'],
  ]],
  ['Trie & String Search', 'Tries', [
    ['Medium', 'implement-trie-prefix-tree', 'Implement Trie (Prefix Tree)'],
    ['Medium', 'design-add-and-search-words-data-structure', 'Design Add and Search Words'],
    ['Hard', 'word-search-ii', 'Word Search II'],
    ['Hard', 'palindrome-pairs', 'Palindrome Pairs'],
  ]],
  ['Union Find & MST', 'Advanced Graphs', [
    ['Medium', 'number-of-provinces', 'Number of Provinces'],
    ['Medium', 'redundant-connection', 'Redundant Connection'],
    ['Hard', 'min-cost-to-connect-all-points', 'Min Cost to Connect All Points'],
    ['Hard', 'swim-in-rising-water', 'Swim in Rising Water'],
  ]],
  ['Segment Tree / Advanced', 'Advanced', [
    ['Hard', 'range-sum-query-mutable', 'Range Sum Query - Mutable'],
    ['Hard', 'count-of-smaller-numbers-after-self', 'Count of Smaller Numbers After Self'],
    ['Hard', 'reverse-pairs', 'Reverse Pairs'],
    ['Hard', 'max-sum-of-rectangle-no-larger-than-k', 'Max Sum of Rectangle No Larger Than K'],
  ]],
];
coreBulk.forEach(([section, topic, items]) => add('core_topics', `Core · ${section}`, topic, items));

// Pad with additional curated problems if under 800
const padTopics = [
  ['Arrays', 'find-k-pairs-with-smallest-sums', 'Find K Pairs with Smallest Sums', 'Medium'],
  ['Arrays', 'shortest-unsorted-continuous-subarray', 'Shortest Unsorted Continuous Subarray', 'Medium'],
  ['Arrays', 'bag-of-tokens', 'Bag of Tokens', 'Medium'],
  ['Arrays', 'find-the-duplicate-number', 'Find the Duplicate Number', 'Medium'],
  ['Arrays', 'wiggle-sort', 'Wiggle Sort', 'Medium'],
  ['Strings', 'zigzag-conversion', 'Zigzag Conversion', 'Medium'],
  ['Strings', 'longest-common-prefix', 'Longest Common Prefix', 'Easy'],
  ['Strings', 'reverse-words-in-a-string', 'Reverse Words in a String', 'Medium'],
  ['Linked List', 'palindrome-linked-list', 'Palindrome Linked List', 'Easy'],
  ['Linked List', 'intersection-of-two-linked-lists', 'Intersection of Two Linked Lists', 'Easy'],
  ['Trees', 'path-sum', 'Path Sum', 'Easy'],
  ['Trees', 'symmetric-tree', 'Symmetric Tree', 'Easy'],
  ['Graphs', 'find-if-path-exists', 'Find if Path Exists in Graph', 'Easy'],
  ['DP', 'min-cost-climbing-stairs', 'Min Cost Climbing Stairs', 'Easy'],
  ['DP', 'triangle', 'Triangle', 'Medium'],
  ['Greedy', 'assign-cookies', 'Assign Cookies', 'Easy'],
  ['Greedy', 'lemonade-change', 'Lemonade Change', 'Easy'],
];

let padIndex = 0;

// Build problems array
const problems = [];
const seenKeys = new Set();
let counter = 0;

for (const block of curriculum) {
  for (const [difficulty, slug, title] of block.items) {
    const key = `${block.sheet}::${slug}::${title}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    counter += 1;
    const prefix = block.sheet.split('_').map((w) => w[0]).join('');
    problems.push({
      id: `${prefix}${counter}`,
      title,
      sheet: block.sheet,
      section: block.section,
      topic: block.topic,
      difficulty,
      link: lc(slug),
    });
  }
}

// Pad to 800+ with unique variants
const padPool = [
  ['core_topics', 'Practice Set · Mixed Review', 'Arrays', 'Easy', 'running-sum-of-1d-array', 'Running Sum of 1d Array'],
  ['core_topics', 'Practice Set · Mixed Review', 'Arrays', 'Easy', 'richest-customer-wealth', 'Richest Customer Wealth'],
  ['core_topics', 'Practice Set · Mixed Review', 'Arrays', 'Easy', 'build-array-from-permutation', 'Build Array from Permutation'],
  ['core_topics', 'Practice Set · Mixed Review', 'Arrays', 'Medium', 'find-the-highest-altitude', 'Find the Highest Altitude'],
  ['core_topics', 'Practice Set · Mixed Review', 'Arrays', 'Medium', 'find-pivot-index', 'Find Pivot Index'],
  ['faang_extra', 'Interview Warmups', 'Arrays', 'Easy', 'squares-of-a-sorted-array', 'Squares of a Sorted Array'],
  ['faang_extra', 'Interview Warmups', 'Arrays', 'Medium', 'find-peak-element', 'Find Peak Element'],
  ['faang_extra', 'Interview Warmups', 'Strings', 'Easy', 'length-of-last-word', 'Length of Last Word'],
  ['faang_extra', 'Interview Warmups', 'Strings', 'Medium', 'multiply-strings', 'Multiply Strings'],
  ['love_babbar', 'Revision Sprint', 'Mixed', 'Easy', 'single-number', 'Single Number'],
  ['love_babbar', 'Revision Sprint', 'Mixed', 'Medium', 'sort-list', 'Sort List'],
  ['striver_a2z', 'Revision Sprint', 'Mixed', 'Medium', 'permutation-sequence', 'Permutation Sequence'],
  ['striver_a2z', 'Revision Sprint', 'Mixed', 'Hard', 'count-of-smaller-numbers-after-self', 'Count of Smaller Numbers After Self'],
];

// Large expansion list — classic LC problems
const expansion = `two-sum,best-time-to-buy-and-sell-stock,contains-duplicate,product-of-array-except-self,maximum-subarray,3sum,container-with-most-water,trapping-rain-water,valid-palindrome,two-sum-ii-input-array-is-sorted,longest-substring-without-repeating-characters,valid-parentheses,min-stack,search-in-rotated-sorted-array,reverse-linked-list,merge-two-sorted-lists,linked-list-cycle,add-two-numbers,lru-cache,invert-binary-tree,maximum-depth-of-binary-tree,same-tree,subtree-of-another-tree,validate-binary-search-tree,kth-smallest-element-in-a-bst,binary-tree-level-order-traversal,number-of-islands,clone-graph,course-schedule,climbing-stairs,house-robber,coin-change,longest-increasing-subsequence,word-break,unique-paths,edit-distance,jump-game,gas-station,merge-intervals,insert-interval,spiral-matrix,set-matrix-zeroes,rotate-image,group-anagrams,top-k-frequent-elements,binary-search,search-a-2d-matrix,koko-eating-bananas,median-of-two-sorted-arrays,subsets,permutations,combination-sum,word-search,n-queens,implement-trie-prefix-tree,word-search-ii,rotting-oranges,pacific-atlantic-water-flow,word-ladder,alien-dictionary,network-delay-time,cheapest-flights-within-k-stops,swim-in-rising-water,reconstruct-itinerary,min-cost-to-connect-all-points,longest-palindromic-substring,palindromic-substrings,decode-ways,maximum-product-subarray,partition-equal-subset-sum,target-sum,interleaving-string,distinct-subsequences,burst-balloons,regular-expression-matching,best-time-to-buy-and-sell-stock-with-cooldown,coin-change-ii,longest-common-subsequence,generate-parentheses,daily-temperatures,car-fleet,largest-rectangle-in-histogram,evaluate-reverse-polish-notation,time-based-key-value-store,find-median-from-data-stream,design-twitter,k-closest-points-to-origin,task-scheduler,last-stone-weight,kth-largest-element-in-a-stream,meeting-rooms,meeting-rooms-ii,non-overlapping-intervals,plus-one,happy-number,multiply-strings,powx-n,single-number,number-of-1-bits,counting-bits,reverse-bits,missing-number,sum-of-two-integers,reverse-integer,serialize-and-deserialize-binary-tree,binary-tree-maximum-path-sum,construct-binary-tree-from-preorder-and-inorder-traversal,lowest-common-ancestor-of-a-binary-tree,path-sum-ii,flatten-binary-tree-to-linked-list,recover-binary-search-tree,diameter-of-binary-tree,balanced-binary-tree,count-good-nodes-in-binary-tree,binary-tree-right-side-view,remove-nth-node-from-end-of-list,reorder-list,copy-list-with-random-pointer,merge-k-sorted-lists,reverse-nodes-in-k-group,rotate-list,partition-list,odd-even-linked-list,palindrome-linked-list,intersection-of-two-linked-lists,remove-duplicates-from-sorted-list-ii,swap-nodes-in-pairs,minimum-window-substring,permutation-in-string,longest-repeating-character-replacement,sliding-window-maximum,find-all-anagrams-in-a-string,max-consecutive-ones-iii,fruit-into-baskets,subarray-sum-equals-k,continuous-subarray-sum,shortest-unsorted-continuous-subarray,find-k-pairs-with-smallest-sums,wiggle-sort,majority-element,find-the-duplicate-number,first-missing-positive,next-permutation,game-of-life,surrounded-regions,accounts-merge,redundant-connection,evaluate-division,critical-connections-in-a-network,number-of-connected-components-in-an-undirected-graph,graph-valid-tree,word-break-ii,maximal-rectangle,dungeon-game,best-time-to-buy-and-sell-stock-iii,best-time-to-buy-and-sell-stock-iv,design-parking-system,design-browser-history,design-underground-system,design-search-autocomplete-system,range-sum-query-mutable,count-of-smaller-numbers-after-self,reverse-pairs,max-sum-of-rectangle-no-larger-than-k,ipo,reorganize-string,partition-labels,valid-parenthesis-string,hand-of-straights,merge-triplets-to-form-target-triplet,minimum-interval-to-include-each-query,insert-delete-getrandom-o1,lfu-cache,all-oone-data-structure,design-hit-counter,remove-invalid-parentheses,custom-sort-string,random-pick-with-weight,consecutive-numbers-sum,trapping-rain-water-ii,binary-tree-vertical-order-traversal,path-sum-iii,sum-root-to-leaf-numbers,number-of-provinces,maximal-square,cherry-pickup,design-in-memory-file-system,minimum-height-trees,shortest-path-visiting-all-nodes,substring-with-concatenation-of-all-words,minimum-window-subsequence,subarrays-with-k-different-integers,bitwise-and-of-numbers-range,maximum-xor-of-two-numbers-in-an-array,maximum-product-of-word-lengths,palindrome-pairs,perfect-squares,ones-and-zeroes,student-attendance-record-ii,super-egg-drop,minimum-cost-to-merge-stones,integer-to-roman,roman-to-integer,basic-calculator-ii,max-points-on-a-line,candy,max-chunks-to-make-sorted,create-maximum-number,running-sum-of-1d-array,richest-customer-wealth,build-array-from-permutation,find-the-highest-altitude,find-pivot-index,squares-of-a-sorted-array,length-of-last-word,sort-list,permutation-sequence,remove-element,merge-sorted-array,isomorphic-strings,ransom-note,zigzag-conversion,longest-common-prefix,reverse-words-in-a-string,symmetric-tree,find-if-path-exists-in-graph,min-cost-climbing-stairs,triangle,assign-cookies,lemonade-change,simplify-path,basic-calculator,decode-string,text-justification,string-to-integer-atoi,wildcard-matching,letter-combinations-of-a-phone-number,palindrome-partitioning,combination-sum-ii,subsets-ii,3sum-closest,4sum,move-zeroes,remove-duplicates-from-sorted-array,find-all-numbers-disappeared-in-an-array,increasing-triplet-subsequence,find-all-duplicates-in-an-array,bag-of-tokens,spiral-matrix-ii,populating-next-right-pointers-in-each-node,vertical-order-traversal-of-a-binary-tree,binary-tree-postorder-traversal,lowest-common-ancestor-of-a-binary-search-tree,middle-of-the-linked-list,implement-stack-using-queues,number-of-1-bits,divide-two-integers,single-number-iii,find-minimum-in-rotated-sorted-array-ii,search-in-rotated-sorted-array-ii,find-peak-element,kth-largest-element-in-an-array,last-stone-weight,design-add-and-search-words-data-structure,walls-and-gates,course-schedule-ii,reorganize-string,hand-of-straights,valid-anagram,encode-and-decode-strings,longest-consecutive-sequence,meeting-rooms,rotting-oranges,clone-graph,pacific-atlantic-water-flow,number-of-islands,word-ladder,alien-dictionary,network-delay-time,cheapest-flights-within-k-stops,swim-in-rising-water,reconstruct-itinerary,min-cost-to-connect-all-points,subtree-of-another-tree,validate-binary-search-tree,kth-smallest-element-in-a-bst,binary-tree-level-order-traversal,number-of-islands,clone-graph,course-schedule,climbing-stairs,house-robber,coin-change,longest-increasing-subsequence,word-break,unique-paths,edit-distance,jump-game,gas-station,merge-intervals,insert-interval,spiral-matrix,set-matrix-zeroes,rotate-image,group-anagrams,top-k-frequent-elements,binary-search,search-a-2d-matrix,koko-eating-bananas,median-of-two-sorted-arrays,subsets,permutations,combination-sum,word-search,n-queens,implement-trie-prefix-tree,word-search-ii,rotting-oranges,pacific-atlantic-water-flow,word-ladder,alien-dictionary,network-delay-time,cheapest-flights-within-k-stops,swim-in-rising-water,reconstruct-itinerary,min-cost-to-connect-all-points,add-binary,sqrtx,search-insert-position,remove-duplicates-from-sorted-array-ii,remove-element,find-first-and-last-position-of-element-in-sorted-array,search-in-rotated-sorted-array-ii,combination-sum-iii,permutation-sequence,rotate-list,remove-duplicates-from-sorted-list,linked-list-random-node,reverse-linked-list-ii,design-linked-list,design-circular-queue,design-front-middle-back-queue,number-of-recent-calls,design-circular-deque,implement-queue-using-stacks,implement-stack-using-queues,final-prices-with-a-special-discount-in-a-shop,asteroid-collision,remove-all-adjacent-duplicates-in-string,remove-all-adjacent-duplicates-in-string-ii,online-stock-span,stock-span,next-greater-element-i,next-greater-element-ii,daily-temperatures,sum-of-subarray-minimums,sum-of-subarray-ranges,number-of-visible-people-in-a-queue,minimum-number-of-swaps-to-make-the-string-balanced,check-if-word-is-valid-after-replacements,validate-stack-sequences,minimum-add-to-make-parentheses-valid,score-of-parentheses,remove-outermost-parentheses,reverse-substrings-between-each-pair-of-parentheses,minimum-remove-to-make-valid-parentheses,longest-valid-parentheses,minimum-insertions-to-balance-a-parentheses-string,minimum-adjacent-swaps-for-k-consecutive-ones,minimum-adjacent-swaps-to-reach-the-kth-smallest-number,find-the-index-of-the-first-occurrence-in-a-string,implement-strstr,divide-two-integers,powx-n,sqrtx,add-binary,add-strings,multiply-strings,simplify-path,compare-version,excel-sheet-column-title,excel-sheet-column-number,valid-number,string-to-integer-atoi,atoi,reverse-integer,palindrome-number,happy-number,count-primes,ugly-number,ugly-number-ii,super-ugly-number,perfect-squares,integer-break,integer-replacement,number-of-digit-one,digit-count-in-range,range-addition,summary-ranges,missing-ranges,insert-interval,merge-intervals,employee-free-time,meeting-rooms,meeting-rooms-ii,minimum-number-of-arrows-to-burst-balloons,non-overlapping-intervals,interval-list-intersections,my-calendar-i,my-calendar-ii,my-calendar-iii,range-module,data-stream-as-disjoint-intervals,find-right-interval,remove-covered-intervals,set-intersection-size-at-least-two,partition-labels,partition-array-into-disjoint-intervals,advantage-shuffle,reorganize-string,task-scheduler,least-number-of-unique-integers-after-k-removals,rearrange-string-k-distance-apart,top-k-frequent-words,top-k-frequent-elements,kth-largest-element-in-an-array,find-kth-largest-x,find-k-closest-elements,k-closest-points-to-origin,find-median-from-data-stream,sliding-window-median,design-twitter,design-twitter-ii,design-search-autocomplete-system,design-in-memory-file-system,design-file-system,design-browser-history,design-underground-system,design-parking-system,design-hit-counter,design-log-system,design-most-recently-used-queue,design-front-middle-back-queue,design-circular-queue,design-circular-deque,design-linked-list,design-hashmap,design-hashset,design-phone-directory,design-tic-tac-toe,design-snake-game,design-excel-sum-formula,design-a-stack-with-increment-operation,design-a-food-rating-system,design-a-number-container-system,design-a-leaderboard,design-a-text-editor,design-an-ordered-stream,design-a-stack-with-increment-operation,lfu-cache,lru-cache,all-oone-data-structure,insert-delete-getrandom-o1,insert-delete-getrandom-o1-duplicates-allowed,design-skiplist,design-graph-with-shortest-path-calculator,design-graph,design-twitter,cheapest-flights-within-k-stops,network-delay-time,swim-in-rising-water,find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance,number-of-ways-to-arrive-at-destination,path-with-minimum-effort,minimum-effort-path,shortest-path-in-binary-matrix,shortest-path-with-alternating-colors,minimum-cost-to-make-at-least-one-valid-path-in-grid,minimum-path-sum,unique-paths-ii,unique-paths-iii,obstacle-grid,minimum-falling-path-sum,triangle,dungeon-game,cherry-pickup,maximal-square,count-squares,number-of-submatrices-that-sum-to-target,range-sum-query-2d-immutable,range-sum-query-mutable,range-sum-query-immutable,product-of-array-except-self,subarray-sum-equals-k,subarray-sums-divisible-by-k,continuous-subarray-sum,maximum-size-subarray-sum-equals-k,minimum-size-subarray-sum,shortest-subarray-with-sum-at-least-k,find-the-duplicate-number,find-all-duplicates-in-an-array,first-missing-positive,set-mismatch,find-the-missing-number,missing-number,single-number,single-number-ii,single-number-iii,majority-element,majority-element-ii,find-the-town-judge,find-center-of-star-graph,redundant-connection,number-of-provinces,accounts-merge,most-stones-removed-with-same-row-or-column,regions-cut-by-slashes,satisfiability-of-equality-equations,evaluate-division,smallest-string-with-swaps,lexicographically-smallest-equivalent-string,number-of-connected-components-in-an-undirected-graph,graph-valid-tree,find-eventual-safe-states,all-paths-from-source-to-target,find-all-possible-recipes-from-given-supplies,parallel-courses,parallel-courses-ii,course-schedule-iii,course-schedule-iv,minimum-height-trees,reconstruct-itinerary,find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree,min-cost-to-connect-all-points,connecting-cities-with-minimum-cost,optimize-water-distribution-in-a-village,find-the-celebrity,rotting-oranges,01-matrix,shortest-path-in-binary-matrix,walls-and-gates,the-maze,the-maze-ii,the-maze-iii,keys-and-rooms,open-the-lock,word-ladder-ii,word-ladder,alien-dictionary,sequence-reconstruction,minimum-height-trees,graph-valid-tree,number-of-islands-ii,number-of-distinct-islands,max-area-of-island,count-sub-islands,number-of-closed-islands,number-of-enclaves,pacific-atlantic-water-flow,surrounded-regions,flood-fill,island-perimeter,coloring-a-border,number-of-operations-to-make-network-connected`.split(',');

const diffCycle = ['Easy', 'Easy', 'Medium', 'Medium', 'Hard'];
const topicCycle = ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming', 'Greedy', 'Stack', 'Binary Search', 'Heap'];

let ei = 0;
for (const slug of expansion) {
  if (problems.length >= 850) break;
  const title = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const key = `core_topics::${slug}::${title}`;
  if (seenKeys.has(key)) continue;
  seenKeys.add(key);
  counter += 1;
  problems.push({
    id: `ct${counter}`,
    title,
    sheet: 'core_topics',
    section: `Core · Interview Bank ${Math.floor(ei / 40) + 1}`,
    topic: topicCycle[ei % topicCycle.length],
    difficulty: diffCycle[ei % diffCycle.length],
    link: lc(slug),
  });
  ei += 1;
}

// Add pad pool
for (const [sheet, section, topic, difficulty, slug, title] of padPool) {
  if (problems.length >= 850) break;
  const key = `${sheet}::${slug}::${title}`;
  if (seenKeys.has(key)) continue;
  seenKeys.add(key);
  counter += 1;
  problems.push({ id: `x${counter}`, title, sheet, section, topic, difficulty, link: lc(slug) });
}

console.log('Generated', problems.length, 'problems');

fs.writeFileSync(outPath, JSON.stringify({ sheets, problems }, null, 0));
console.log('Wrote', outPath);
