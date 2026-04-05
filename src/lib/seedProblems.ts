import type { ProblemDoc } from "@/lib/problemDoc";

export const SEED_PROBLEMS: ProblemDoc[] = [
  {
    slug: "lower-bound",
    title: "Lower Bound (Binary Search)",
    topic: "Binary Search",
    pattern: "Lower Bound / First index with a[i] ≥ x",
    link: "https://www.geeksforgeeks.org/problems/implement-lower-bound/1",
    content: {
      statementMd:
        "Given a **sorted** array `a` and a value `x`, return the **first index** `i` such that `a[i] >= x`.\nIf no such index exists, return `n` (the array length).",
      inputMd: "- `a`: sorted integer array\n- `x`: integer target",
      outputMd: "- First index `i` with `a[i] >= x`, else `n`",
      exampleMd: "```txt\na = [1, 3, 3, 5, 8], x = 4\noutput = 3\n```",
      exampleExplanationMd: "`a[3] = 5` is the first value `>= 4`.",
      brute: {
        intuitionMd: "Just find the first position where the condition becomes true.",
        approachMd:
          "Scan from left to right; return the first index with `a[i] >= x`. If none, return `n`.",
        visualization: null,
        codeJava:
          "public class LowerBoundLinear {\n" +
          "    // Returns the first index i such that a[i] >= x, or n if it doesn't exist.\n" +
          "    public static int lowerBound(int[] a, int x) {\n" +
          "        for (int i = 0; i < a.length; i++) {\n" +
          "            if (a[i] >= x) return i;\n" +
          "        }\n" +
          "        return a.length;\n" +
          "    }\n" +
          "}\n",
        time: "O(N)",
        space: "O(1)",
        complexityExplanationMd:
          "- **Time `O(N)`**: in the worst case, you may scan all `n` elements.\n- **Space `O(1)`**: only a few variables are used.",
      },
      optimal: {
        intuitionMd:
          "Think of **“first true”** in a monotonic boolean array.\n\nBecause the array is sorted, the predicate `a[i] >= x` becomes:\n\n`false false false ... true true true`\n\nThe lower bound is the first index where it becomes `true`.",
        approachMd:
          "Maintain a search space `[lo, hi)` such that the answer is always inside it.\n\n- Invariant: all indices `< lo` are **definitely false** (`a[i] < x`)\n- Invariant: all indices `>= hi` are **definitely true** (or “past the array”)\n- Shrink until `lo == hi` → that index is the first `true`",
        visualization: null,
        codeJava:
          "public class LowerBoundBinarySearch {\n" +
          "    // Returns the first index i such that a[i] >= x, or n if it doesn't exist.\n" +
          "    public static int lowerBound(int[] a, int x) {\n" +
          "        int lo = 0, hi = a.length; // [lo, hi)\n" +
          "        while (lo < hi) {\n" +
          "            int mid = lo + (hi - lo) / 2;\n" +
          "            if (a[mid] >= x) {\n" +
          "                hi = mid;   // mid might be the answer\n" +
          "            } else {\n" +
          "                lo = mid + 1; // answer is strictly right of mid\n" +
          "            }\n" +
          "        }\n" +
          "        return lo;\n" +
          "    }\n" +
          "}\n",
        time: "O(log N)",
        space: "O(1)",
        complexityExplanationMd:
          "- **Time `O(log N)`**: binary search halves the range each step.\n- **Space `O(1)`**: iterative binary search uses constant extra space.",
      },
      quickRevision: {
        brute: [
          "Scan left to right; first a[i] >= x is the answer.",
          "If none found, return n.",
          "Time O(N), Space O(1).",
        ],
        optimal: [
          "Model as first-true over predicate a[i] >= x in sorted array.",
          "Use [lo, hi) and shrink until lo == hi.",
          "Time O(log N), Space O(1).",
        ],
      },
    },
  },
  {
    slug: "jump-game-ii",
    title: "Jump Game II",
    topic: "Greedy",
    pattern: "Range expansion (BFS levels)",
    link: "https://leetcode.com/problems/jump-game-ii/",
    content: {
      statementMd:
        "You are given an array `nums` where `nums[i]` is the maximum jump length from index `i`.\nStarting at index `0`, return the **minimum number of jumps** needed to reach the last index.",
      inputMd: "- `nums`: integer array",
      outputMd: "- Minimum jumps to reach `n - 1`",
      exampleMd: "```txt\nnums = [2, 3, 1, 1, 4]\noutput = 2\n```",
      exampleExplanationMd: "Jump `0 -> 1`, then `1 -> 4`.",
      brute: {
        intuitionMd:
          "If we know the best answer to reach smaller indices, we can build the best answer for later indices.",
        approachMd:
          "Let `dp[i]` be the minimum jumps to reach index `i`.\nFor each `i`, try all `j < i` that can reach `i`.",
        visualization: null,
        codeJava:
          "import java.util.Arrays;\n\n" +
          "public class JumpGameIIBruteForce {\n" +
          "    public static int jump(int[] nums) {\n" +
          "        int n = nums.length;\n" +
          "        int[] dp = new int[n];\n" +
          "        Arrays.fill(dp, (int)1e9);\n" +
          "        dp[0] = 0;\n\n" +
          "        for (int i = 1; i < n; i++) {\n" +
          "            for (int j = 0; j < i; j++) {\n" +
          "                if (j + nums[j] >= i) {\n" +
          "                    dp[i] = Math.min(dp[i], dp[j] + 1);\n" +
          "                }\n" +
          "            }\n" +
          "        }\n" +
          "        return dp[n - 1];\n" +
          "    }\n" +
          "}\n",
        time: "O(N^2)",
        space: "O(N)",
        complexityExplanationMd:
          "- **Time `O(N^2)`**: for every `i`, you scan all earlier `j`.\n- **Space `O(N)`**: the DP array stores answers for all indices.",
      },
      optimal: {
        intuitionMd:
          "Every index you can reach with `k` jumps forms a **range**.\nFrom that range, one more jump can expand to a new range.\n\nTrack:\n\n- `currentEnd`: end of the current jump range\n- `farthest`: farthest index reachable from within the current range",
        approachMd: "Scan once, maintaining the current “level” end.",
        visualization: null,
        codeJava:
          "public class JumpGameIIOptimal {\n" +
          "    public static int jump(int[] nums) {\n" +
          "        int n = nums.length;\n" +
          "        if (n <= 1) return 0;\n\n" +
          "        int jumps = 0;\n" +
          "        int currentEnd = 0;\n" +
          "        int farthest = 0;\n\n" +
          "        for (int i = 0; i < n - 1; i++) {\n" +
          "            farthest = Math.max(farthest, i + nums[i]);\n\n" +
          "            // We reached the end of the current jump range: take a jump.\n" +
          "            if (i == currentEnd) {\n" +
          "                jumps++;\n" +
          "                currentEnd = farthest;\n" +
          "            }\n" +
          "        }\n" +
          "        return jumps;\n" +
          "    }\n" +
          "}\n",
        time: "O(N)",
        space: "O(1)",
        complexityExplanationMd:
          "- **Time `O(N)`**: each index is processed once.\n- **Space `O(1)`**: only a few pointers/counters are used.",
      },
      quickRevision: {
        brute: [
          "DP: dp[i] = min jumps to i; try all j<i that can reach i.",
          "Simple but slow for large N.",
          "Time O(N^2), Space O(N).",
        ],
        optimal: [
          "Greedy BFS-level view: currentEnd is current range, farthest is next range.",
          "When i hits currentEnd, take a jump and extend to farthest.",
          "Time O(N), Space O(1).",
        ],
      },
    },
  },
  {
    slug: "n-queen",
    title: "N-Queen",
    topic: "Backtracking",
    pattern: "Row-by-row + hashing (cols/diagonals)",
    link: "https://leetcode.com/problems/n-queens/",
    content: {
      statementMd:
        "Place `n` queens on an `n x n` chessboard such that **no two queens attack each other**.\nReturn **all distinct solutions**, where each solution is a board of `'.'` and `'Q'`.",
      inputMd: "- `n`: board size and number of queens",
      outputMd: "- List of all valid boards",
      exampleMd: "```txt\nn = 4\noutput = 2 solutions\n```",
      exampleExplanationMd:
        "There are exactly 2 non-attacking configurations for `n = 4`.",
      brute: {
        intuitionMd:
          "Try to place queens row by row; for each placement, check if it conflicts with earlier queens.",
        approachMd:
          "Backtrack row by row. To validate a placement, scan up-left, up-right, and up (column).",
        visualization: null,
        codeJava:
          "import java.util.ArrayList;\n" +
          "import java.util.List;\n\n" +
          "public class NQueensBruteForce {\n" +
          "    public static List<List<String>> solveNQueens(int n) {\n" +
          "        char[][] board = new char[n][n];\n" +
          "        for (int r = 0; r < n; r++) {\n" +
          "            for (int c = 0; c < n; c++) board[r][c] = '.';\n" +
          "        }\n\n" +
          "        List<List<String>> ans = new ArrayList<>();\n" +
          "        backtrack(0, board, ans);\n" +
          "        return ans;\n" +
          "    }\n\n" +
          "    private static void backtrack(int row, char[][] board, List<List<String>> ans) {\n" +
          "        int n = board.length;\n" +
          "        if (row == n) {\n" +
          "            ans.add(toList(board));\n" +
          "            return;\n" +
          "        }\n\n" +
          "        for (int col = 0; col < n; col++) {\n" +
          "            if (isSafe(row, col, board)) {\n" +
          "                board[row][col] = 'Q';\n" +
          "                backtrack(row + 1, board, ans);\n" +
          "                board[row][col] = '.';\n" +
          "            }\n" +
          "        }\n" +
          "    }\n\n" +
          "    private static boolean isSafe(int row, int col, char[][] board) {\n" +
          "        int n = board.length;\n" +
          "        // Check column\n" +
          "        for (int r = 0; r < row; r++) if (board[r][col] == 'Q') return false;\n" +
          "        // Diagonal up-left\n" +
          "        for (int r = row - 1, c = col - 1; r >= 0 && c >= 0; r--, c--)\n" +
          "            if (board[r][c] == 'Q') return false;\n" +
          "        // Diagonal up-right\n" +
          "        for (int r = row - 1, c = col + 1; r >= 0 && c < n; r--, c++)\n" +
          "            if (board[r][c] == 'Q') return false;\n" +
          "        return true;\n" +
          "    }\n\n" +
          "    private static List<String> toList(char[][] board) {\n" +
          "        List<String> out = new ArrayList<>();\n" +
          "        for (char[] row : board) out.add(new String(row));\n" +
          "        return out;\n" +
          "    }\n" +
          "}\n",
        time: "O(N! · N)",
        space: "O(N^2)",
        complexityExplanationMd:
          "- **Time ~`O(N! · N)`**: backtracking explores permutations of columns; safety checks cost `O(N)` by scanning.\n- **Space `O(N^2)`**: the board is stored as an `n x n` grid.",
      },
      optimal: {
        intuitionMd:
          "When you place a queen at `(row, col)`, you block:\n\n- the column `col`\n- the main diagonal `(row - col)`\n- the anti-diagonal `(row + col)`\n\nHash these constraints to get O(1) safety checks.",
        approachMd:
          "Use boolean arrays for O(1) safety checks:\n\n- `cols[c]`\n- `diag1[row - col + (n - 1)]`\n- `diag2[row + col]`",
        visualization: {
          steps: [
            {
              label: "Initial Board (n=4)",
              description: "Empty 4x4 board, all positions available",
              nodes: [
                { id: "0-0", position: { x: 0, y: 0 }, data: { label: "0,0" } },
                { id: "0-1", position: { x: 100, y: 0 }, data: { label: "0,1" } },
                { id: "0-2", position: { x: 200, y: 0 }, data: { label: "0,2" } },
                { id: "0-3", position: { x: 300, y: 0 }, data: { label: "0,3" } },
                { id: "1-0", position: { x: 0, y: 100 }, data: { label: "1,0" } },
                { id: "1-1", position: { x: 100, y: 100 }, data: { label: "1,1" } },
                { id: "1-2", position: { x: 200, y: 100 }, data: { label: "1,2" } },
                { id: "1-3", position: { x: 300, y: 100 }, data: { label: "1,3" } },
                { id: "2-0", position: { x: 0, y: 200 }, data: { label: "2,0" } },
                { id: "2-1", position: { x: 100, y: 200 }, data: { label: "2,1" } },
                { id: "2-2", position: { x: 200, y: 200 }, data: { label: "2,2" } },
                { id: "2-3", position: { x: 300, y: 200 }, data: { label: "2,3" } },
                { id: "3-0", position: { x: 0, y: 300 }, data: { label: "3,0" } },
                { id: "3-1", position: { x: 100, y: 300 }, data: { label: "3,1" } },
                { id: "3-2", position: { x: 200, y: 300 }, data: { label: "3,2" } },
                { id: "3-3", position: { x: 300, y: 300 }, data: { label: "3,3" } },
              ],
              edges: [],
            },
            {
              label: "Place Q at (0,0)",
              description: "Mark column 0 and diagonals as blocked",
              nodes: [
                { id: "0-0", position: { x: 0, y: 0 }, data: { label: "Q" }, style: { background: "#facc15", border: "2px solid #eab308" } },
                { id: "0-1", position: { x: 100, y: 0 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "0-2", position: { x: 200, y: 0 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "0-3", position: { x: 300, y: 0 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "1-0", position: { x: 0, y: 100 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "1-1", position: { x: 100, y: 100 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "1-2", position: { x: 200, y: 100 }, data: { label: "1,2" } },
                { id: "1-3", position: { x: 300, y: 100 }, data: { label: "1,3" } },
                { id: "2-0", position: { x: 0, y: 200 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "2-1", position: { x: 100, y: 200 }, data: { label: "2,1" } },
                { id: "2-2", position: { x: 200, y: 200 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "2-3", position: { x: 300, y: 200 }, data: { label: "2,3" } },
                { id: "3-0", position: { x: 0, y: 300 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "3-1", position: { x: 100, y: 300 }, data: { label: "3,1" } },
                { id: "3-2", position: { x: 200, y: 300 }, data: { label: "3,2" } },
                { id: "3-3", position: { x: 300, y: 300 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
              ],
              edges: [
                { id: "e-0-1", source: "0-0", target: "1-1", type: "straight", label: "diag" },
                { id: "e-0-2", source: "0-0", target: "2-2", type: "straight", label: "diag" },
                { id: "e-0-3", source: "0-0", target: "3-3", type: "straight", label: "diag" },
              ],
            },
            {
              label: "Place Q at (1,2)",
              description: "First valid position in row 1",
              nodes: [
                { id: "0-0", position: { x: 0, y: 0 }, data: { label: "Q" }, style: { background: "#facc15", border: "2px solid #eab308" } },
                { id: "0-1", position: { x: 100, y: 0 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "0-2", position: { x: 200, y: 0 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "0-3", position: { x: 300, y: 0 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "1-0", position: { x: 0, y: 100 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "1-1", position: { x: 100, y: 100 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "1-2", position: { x: 200, y: 100 }, data: { label: "Q" }, style: { background: "#facc15", border: "2px solid #eab308" } },
                { id: "1-3", position: { x: 300, y: 100 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "2-0", position: { x: 0, y: 200 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "2-1", position: { x: 100, y: 200 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "2-2", position: { x: 200, y: 200 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "2-3", position: { x: 300, y: 200 }, data: { label: "2,3" } },
                { id: "3-0", position: { x: 0, y: 300 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "3-1", position: { x: 100, y: 300 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
                { id: "3-2", position: { x: 200, y: 300 }, data: { label: "3,2" } },
                { id: "3-3", position: { x: 300, y: 300 }, data: { label: "✗" }, style: { background: "#fee2e2", color: "#dc2626" } },
              ],
              edges: [
                { id: "e-1-2-0", source: "1-2", target: "0-0", type: "straight", label: "diag" },
                { id: "e-1-2-3", source: "1-2", target: "2-3", type: "straight", label: "diag" },
                { id: "e-1-2-col", source: "1-2", target: "2-2", type: "straight", label: "col" },
                { id: "e-1-2-3-3", source: "1-2", target: "3-3", type: "straight", label: "diag" },
              ],
            },
            {
              label: "Complete Solution",
              description: ".Q.. ...Q Q... ..Q. or .Q.. ..Q. ...Q .Q..",
              nodes: [
                { id: "0-0", position: { x: 0, y: 0 }, data: { label: "." } },
                { id: "0-1", position: { x: 100, y: 0 }, data: { label: "Q" }, style: { background: "#facc15", border: "2px solid #eab308" } },
                { id: "0-2", position: { x: 200, y: 0 }, data: { label: "." } },
                { id: "0-3", position: { x: 300, y: 0 }, data: { label: "." } },
                { id: "1-0", position: { x: 0, y: 100 }, data: { label: "." } },
                { id: "1-1", position: { x: 100, y: 100 }, data: { label: "." } },
                { id: "1-2", position: { x: 200, y: 100 }, data: { label: "." } },
                { id: "1-3", position: { x: 300, y: 100 }, data: { label: "Q" }, style: { background: "#facc15", border: "2px solid #eab308" } },
                { id: "2-0", position: { x: 0, y: 200 }, data: { label: "Q" }, style: { background: "#facc15", border: "2px solid #eab308" } },
                { id: "2-1", position: { x: 100, y: 200 }, data: { label: "." } },
                { id: "2-2", position: { x: 200, y: 200 }, data: { label: "." } },
                { id: "2-3", position: { x: 300, y: 200 }, data: { label: "." } },
                { id: "3-0", position: { x: 0, y: 300 }, data: { label: "." } },
                { id: "3-1", position: { x: 100, y: 300 }, data: { label: "." } },
                { id: "3-2", position: { x: 200, y: 300 }, data: { label: "Q" }, style: { background: "#facc15", border: "2px solid #eab308" } },
                { id: "3-3", position: { x: 300, y: 300 }, data: { label: "." } },
              ],
              edges: [
                { id: "col1", source: "0-1", target: "1-1", type: "straight", label: "col" },
                { id: "col2", source: "0-1", target: "2-1", type: "straight", label: "col" },
                { id: "col3", source: "0-1", target: "3-1", type: "straight", label: "col" },
                { id: "d1", source: "1-3", target: "2-2", type: "straight", label: "diag" },
                { id: "d2", source: "1-3", target: "0-2", type: "straight", label: "diag" },
              ],
            },
          ],
        },
        codeJava:
          "import java.util.ArrayList;\n" +
          "import java.util.List;\n\n" +
          "public class NQueensOptimal {\n" +
          "    public static List<List<String>> solveNQueens(int n) {\n" +
          "        char[][] board = new char[n][n];\n" +
          "        for (int r = 0; r < n; r++) {\n" +
          "            for (int c = 0; c < n; c++) board[r][c] = '.';\n" +
          "        }\n\n" +
          "        boolean[] cols = new boolean[n];\n" +
          "        boolean[] diag1 = new boolean[2 * n - 1]; // row - col + (n - 1)\n" +
          "        boolean[] diag2 = new boolean[2 * n - 1]; // row + col\n\n" +
          "        List<List<String>> ans = new ArrayList<>();\n" +
          "        backtrack(0, board, cols, diag1, diag2, ans);\n" +
          "        return ans;\n" +
          "    }\n\n" +
          "    private static void backtrack(\n" +
          "            int row,\n" +
          "            char[][] board,\n" +
          "            boolean[] cols,\n" +
          "            boolean[] diag1,\n" +
          "            boolean[] diag2,\n" +
          "            List<List<String>> ans\n" +
          "    ) {\n" +
          "        int n = board.length;\n" +
          "        if (row == n) {\n" +
          "            ans.add(toList(board));\n" +
          "            return;\n" +
          "        }\n\n" +
          "        for (int col = 0; col < n; col++) {\n" +
          "            int d1 = row - col + (n - 1);\n" +
          "            int d2 = row + col;\n" +
          "            if (cols[col] || diag1[d1] || diag2[d2]) continue;\n\n" +
          "            cols[col] = diag1[d1] = diag2[d2] = true;\n" +
          "            board[row][col] = 'Q';\n" +
          "            backtrack(row + 1, board, cols, diag1, diag2, ans);\n" +
          "            board[row][col] = '.';\n" +
          "            cols[col] = diag1[d1] = diag2[d2] = false;\n" +
          "        }\n" +
          "    }\n\n" +
          "    private static List<String> toList(char[][] board) {\n" +
          "        List<String> out = new ArrayList<>();\n" +
          "        for (char[] row : board) out.add(new String(row));\n" +
          "        return out;\n" +
          "    }\n" +
          "}\n",
        time: "O(N!)",
        space: "O(N^2)",
        complexityExplanationMd:
          "- **Time ~`O(N!)`**: same backtracking search space, but safety checks are O(1).\n- **Space `O(N^2)`**: board plus O(N) hashing arrays.",
      },
      quickRevision: {
        brute: [
          "Backtrack row-by-row; validate by scanning column/diagonals each time.",
          "Safety check costs O(N) per placement attempt.",
          "Time ~O(N!·N), Space O(N^2).",
        ],
        optimal: [
          "Backtrack row-by-row; hash used cols/diagonals with boolean arrays.",
          "Safety check becomes O(1).",
          "Time ~O(N!), Space O(N^2).",
        ],
      },
    },
  },
  {
    slug: "job-sequencing",
    title: "Job Sequencing (Greedy)",
    topic: "Greedy",
    pattern: "Sort by profit + place latest slot",
    link: "https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1",
    content: {
      statementMd:
        "You are given `N` jobs. Each job takes **1 unit of time** and has:\n\n- a `deadline` (latest time slot it can be completed)\n- a `profit` (earned if completed before or on its deadline)\n\nSchedule jobs to **maximize total profit** (and typically also compute number of jobs done).",
      inputMd: "- Jobs array with `(id, deadline, profit)`",
      outputMd: "- Usually: `[jobsDone, totalProfit]`",
      exampleMd:
        "```txt\njobs = [(1,2,100), (2,1,19), (3,2,27), (4,1,25), (5,3,15)]\noutput = [2, 127]\n```",
      exampleExplanationMd:
        "Choose profitable jobs and place them within deadlines (e.g., profit 100 at slot 2, profit 27 at slot 1).",
      brute: {
        intuitionMd: "Try all ways to place jobs into time slots, track the best profit.",
        approachMd:
          "Let `M = maxDeadline`. Create `slot[1..M]` to track used time slots.\nBacktrack over jobs: for each job, try to place it into any free slot `t <= deadline` (or skip it).",
        visualization: null,
        codeJava:
          "public class JobSequencingBruteForce {\n" +
          "    static class Job {\n" +
          "        int id, deadline, profit;\n" +
          "        Job(int id, int deadline, int profit) {\n" +
          "            this.id = id;\n" +
          "            this.deadline = deadline;\n" +
          "            this.profit = profit;\n" +
          "        }\n" +
          "    }\n\n" +
          "    static int bestProfit;\n" +
          "    static int bestCount;\n\n" +
          "    public static int[] jobScheduling(Job[] jobs) {\n" +
          "        int maxDeadline = 0;\n" +
          "        for (Job j : jobs) maxDeadline = Math.max(maxDeadline, j.deadline);\n" +
          "        boolean[] slot = new boolean[maxDeadline + 1]; // 1..maxDeadline\n\n" +
          "        bestProfit = 0;\n" +
          "        bestCount = 0;\n" +
          "        dfs(0, jobs, slot, 0, 0);\n" +
          "        return new int[] { bestCount, bestProfit };\n" +
          "    }\n\n" +
          "    private static void dfs(int i, Job[] jobs, boolean[] slot, int count, int profit) {\n" +
          "        if (i == jobs.length) {\n" +
          "            if (profit > bestProfit) {\n" +
          "                bestProfit = profit;\n" +
          "                bestCount = count;\n" +
          "            }\n" +
          "            return;\n" +
          "        }\n\n" +
          "        // Option 1: skip\n" +
          "        dfs(i + 1, jobs, slot, count, profit);\n\n" +
          "        // Option 2: try placing in any free slot <= deadline\n" +
          "        Job j = jobs[i];\n" +
          "        int last = Math.min(j.deadline, slot.length - 1);\n" +
          "        for (int t = 1; t <= last; t++) {\n" +
          "            if (slot[t]) continue;\n" +
          "            slot[t] = true;\n" +
          "            dfs(i + 1, jobs, slot, count + 1, profit + j.profit);\n" +
          "            slot[t] = false;\n" +
          "        }\n" +
          "    }\n" +
          "}\n",
        time: "O(2^N · M)",
        space: "O(M)",
        complexityExplanationMd:
          "- **Time ~`O(2^N · M)`**: each job can be skipped/taken; taking may try up to `M` slots.\n- **Space `O(M)`**: the slot array tracks used time slots.",
      },
      optimal: {
        intuitionMd:
          "To maximize profit:\n\n1. Prefer high-profit jobs.\n2. For each chosen job, schedule it as **late as possible** before its deadline, so earlier slots remain available for other jobs.",
        approachMd:
          "Sort by profit descending. Maintain a boolean array of available time slots.\n\nFor each job, scan backwards from `min(deadline, maxDeadline)` to find the latest free slot.",
        visualization: null,
        codeJava:
          "import java.util.Arrays;\n\n" +
          "public class JobSequencingOptimal {\n" +
          "    static class Job {\n" +
          "        int id, deadline, profit;\n" +
          "        Job(int id, int deadline, int profit) {\n" +
          "            this.id = id;\n" +
          "            this.deadline = deadline;\n" +
          "            this.profit = profit;\n" +
          "        }\n" +
          "    }\n\n" +
          "    // Returns [jobsDone, totalProfit]\n" +
          "    public static int[] jobScheduling(Job[] jobs) {\n" +
          "        Arrays.sort(jobs, (a, b) -> b.profit - a.profit);\n\n" +
          "        int maxDeadline = 0;\n" +
          "        for (Job j : jobs) maxDeadline = Math.max(maxDeadline, j.deadline);\n\n" +
          "        boolean[] slot = new boolean[maxDeadline + 1]; // 1..maxDeadline\n" +
          "        int count = 0, profit = 0;\n\n" +
          "        for (Job j : jobs) {\n" +
          "            for (int t = Math.min(j.deadline, maxDeadline); t >= 1; t--) {\n" +
          "                if (!slot[t]) {\n" +
          "                    slot[t] = true;\n" +
          "                    count++;\n" +
          "                    profit += j.profit;\n" +
          "                    break;\n" +
          "                }\n" +
          "            }\n" +
          "        }\n" +
          "        return new int[] { count, profit };\n" +
          "    }\n" +
          "}\n",
        time: "O(N log N + N · M)",
        space: "O(M)",
        complexityExplanationMd:
          "- **Time `O(N log N)`** to sort by profit, plus **`O(N · M)`** for backward slot scans.\n- **Space `O(M)`** for the time-slot array.",
      },
      quickRevision: {
        brute: [
          "Backtracking over jobs; try placing each into any free slot <= deadline (or skip).",
          "Correct but blows up quickly.",
          "Time ~O(2^N·M), Space O(M).",
        ],
        optimal: [
          "Sort by profit descending.",
          "Place each job at the latest free slot <= deadline.",
          "Time O(N log N + N·M), Space O(M).",
        ],
      },
    },
  },
  {
    slug: "find-leaf-nodes",
    title: "Find Leaf Nodes (Tree)",
    topic: "Trees",
    pattern: "DFS/BFS traversal",
    link: "https://www.geeksforgeeks.org/print-leaf-nodes-binary-tree-right-left/",
    content: {
      statementMd: "Given the root of a binary tree, return (or print) all **leaf nodes**.",
      inputMd: "- `root`: binary tree root",
      outputMd: "- List of leaf values (any order depending on traversal)",
      exampleMd: "```txt\n    1\n   / \\\n  2   3\n /\n4\n\noutput = [4, 3]\n```",
      exampleExplanationMd: "Nodes `4` and `3` have no children.",
      brute: {
        intuitionMd: "Traverse all nodes; whenever you see a node with no children, it’s a leaf.",
        approachMd: "Level-order (BFS): visit all nodes and collect leaves.",
        visualization: null,
        codeJava:
          "import java.util.ArrayList;\n" +
          "import java.util.LinkedList;\n" +
          "import java.util.List;\n" +
          "import java.util.Queue;\n\n" +
          "public class FindLeafNodesBFS {\n" +
          "    static class TreeNode {\n" +
          "        int val;\n" +
          "        TreeNode left, right;\n" +
          "        TreeNode(int val) { this.val = val; }\n" +
          "    }\n\n" +
          "    public static List<Integer> leafNodes(TreeNode root) {\n" +
          "        List<Integer> leaves = new ArrayList<>();\n" +
          "        if (root == null) return leaves;\n\n" +
          "        Queue<TreeNode> q = new LinkedList<>();\n" +
          "        q.add(root);\n" +
          "        while (!q.isEmpty()) {\n" +
          "            TreeNode node = q.poll();\n" +
          "            if (node.left == null && node.right == null) {\n" +
          "                leaves.add(node.val);\n" +
          "                continue;\n" +
          "            }\n" +
          "            if (node.left != null) q.add(node.left);\n" +
          "            if (node.right != null) q.add(node.right);\n" +
          "        }\n" +
          "        return leaves;\n" +
          "    }\n" +
          "}\n",
        time: "O(N)",
        space: "O(N)",
        complexityExplanationMd:
          "- **Time `O(N)`**: each node is visited once.\n- **Space `O(N)`**: worst-case queue size can be `O(N)` for a wide tree.",
      },
      optimal: {
        intuitionMd:
          "A **leaf** is any node with `left == null` and `right == null`.\nDFS naturally reaches leaves and can collect them with only recursion stack space.",
        approachMd: "DFS is simpler and uses stack space proportional to tree height.",
        visualization: null,
        codeJava:
          "import java.util.ArrayList;\n" +
          "import java.util.List;\n\n" +
          "public class FindLeafNodesDFS {\n" +
          "    static class TreeNode {\n" +
          "        int val;\n" +
          "        TreeNode left, right;\n" +
          "        TreeNode(int val) { this.val = val; }\n" +
          "    }\n\n" +
          "    public static List<Integer> leafNodes(TreeNode root) {\n" +
          "        List<Integer> leaves = new ArrayList<>();\n" +
          "        dfs(root, leaves);\n" +
          "        return leaves;\n" +
          "    }\n\n" +
          "    private static void dfs(TreeNode node, List<Integer> leaves) {\n" +
          "        if (node == null) return;\n" +
          "        if (node.left == null && node.right == null) {\n" +
          "            leaves.add(node.val);\n" +
          "            return;\n" +
          "        }\n" +
          "        dfs(node.left, leaves);\n" +
          "        dfs(node.right, leaves);\n" +
          "    }\n" +
          "}\n",
        time: "O(N)",
        space: "O(H)",
        complexityExplanationMd:
          "- **Time `O(N)`**: each node is visited once.\n- **Space `O(H)`**: recursion stack depth is tree height `H` (worst-case `N` for a skewed tree).",
      },
      quickRevision: {
        brute: [
          "BFS/level-order: visit all nodes and collect those with no children.",
          "Queue can grow large for wide trees.",
          "Time O(N), Space O(N).",
        ],
        optimal: [
          "DFS: when node has no children, add it to answer.",
          "Uses recursion stack proportional to height.",
          "Time O(N), Space O(H).",
        ],
      },
    },
  },
];
