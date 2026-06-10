export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickRandomSubset(array) {
  const count = Math.min(array.length, Math.floor(Math.random() * 6) + 5); // 5-10
  return shuffleArray(array).slice(0, count);
}
