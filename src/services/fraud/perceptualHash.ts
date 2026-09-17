/**
 * Perceptual and cryptographic receipt image fingerprinting
 */
export function computeHammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    return 64; // arbitrary maximum distance
  }
  let diff = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) diff++;
  }
  return diff;
}

export function areImagesSimilar(hash1: string, hash2: string, threshold = 2): boolean {
  if (hash1 === hash2) return true;
  return computeHammingDistance(hash1, hash2) <= threshold;
}
