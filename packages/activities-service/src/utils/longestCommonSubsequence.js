const longestCommonSubsequence = (seq1, seq2, isEqual = (a, b) => a === b) => {
  const dp = new Uint16Array(seq2.length + 1);
  for (let i = seq1.length - 1; ~i; i--) {
    for (let prev = 0, j = seq2.length - 1; ~j; j--) {
      const cur = dp[j];
      if (isEqual(seq1[i], seq2[j])) dp[j] = prev + 1;
      else dp[j] = Math.max(dp[j + 1], dp[j]);
      prev = cur;
    }
  }
  return dp[0];
};

module.exports = longestCommonSubsequence;
