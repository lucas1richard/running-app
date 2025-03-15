// const longestCommonSubsequence = (seq1, seq2, isEqual = (a, b) => a === b) => {
//   const dp = new Uint16Array(seq2.length + 1);
//   for (let i = seq1.length - 1; ~i; i--) {
//     for (let prev = 0, j = seq2.length - 1; ~j; j--) {
//       const cur = dp[j];
//       if (isEqual(seq1[i], seq2[j])) dp[j] = prev + 1;
//       else dp[j] = Math.max(dp[j + 1], dp[j]);
//       prev = cur;
//     }
//   }
//   return dp[0];
// };

// module.exports = longestCommonSubsequence;

const longestCommonSubsequence = (seq1, seq2, isEqual = (a, b) => a === b) => {
  const sym = Symbol('x');
  const memo = Array.apply(null, new Array(seq1.length)).map(() => new Array(seq2.length).fill(sym));

  const recurse = (i, j) => {
    if (i >= seq1.length || j >= seq2.length) return 0;

    if (memo[i][j] === sym) {
      if (isEqual(seq1[i], seq2[j])) memo[i][j] = 1 + recurse(i + 1, j + 1);
      else memo[i][j] = Math.max(recurse(i + 1, j), recurse(i, j + 1));
    }

    return memo[i][j];
  };

  return recurse(0, 0);
};

module.exports = longestCommonSubsequence;