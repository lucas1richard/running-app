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
