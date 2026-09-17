// 64-bit Hex Perceptual Hash Hamming Distance Comparator

export function calculateHammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    return 64; // maximum mismatch if lengths differ
  }

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const val1 = parseInt(hash1[i], 16);
    const val2 = parseInt(hash2[i], 16);
    let xor = val1 ^ val2;
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

export function isPerceptualDuplicate(
  hash1?: string,
  hash2?: string,
  threshold: number = 8
): boolean {
  if (!hash1 || !hash2) return false;
  if (hash1 === hash2) return true;
  return calculateHammingDistance(hash1, hash2) <= threshold;
}
