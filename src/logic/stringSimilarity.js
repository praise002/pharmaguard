// Damerau-Levenshtein (optimal string alignment): like Levenshtein, but also
// counts an adjacent-character transposition as a single edit. Plain
// Levenshtein scores "coglaet" vs "colgate" as 4 edits (looks unrelated);
// treating the swapped letter pairs as transpositions scores it as 2 (looks
// like a lookalike), which matches how these counterfeit brand names are
// actually constructed.
export function damerauLevenshtein(a, b) {
  const al = a.length
  const bl = b.length
  const d = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0))

  for (let i = 0; i <= al; i++) d[i][0] = i
  for (let j = 0; j <= bl; j++) d[0][j] = j

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }

  return d[al][bl]
}

export function similarityRatio(a, b) {
  if (a === b) return 1
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - damerauLevenshtein(a, b) / maxLen
}
