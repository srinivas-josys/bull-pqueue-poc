export function calculatePrimes(n: number): number[] {
  const primes: number[] = [];
  let num = 2;

  while (primes.length < n) {
    if (primes.every((prime) => num % prime !== 0)) {
      primes.push(num);
    }
    num++;
  }
  console.log('Processed Task 1 - Primes');

  return primes;
}

export function multiplyMatrices(matrixSize: number): number[][] {
  const matrixA = Array.from({ length: matrixSize }, () =>
    Array.from({ length: matrixSize }, () => Math.random()),
  );
  const matrixB = Array.from({ length: matrixSize }, () =>
    Array.from({ length: matrixSize }, () => Math.random()),
  );

  const result = Array.from({ length: matrixSize }, () =>
    Array.from({ length: matrixSize }, () => 0),
  );

  for (let i = 0; i < matrixSize; i++) {
    for (let j = 0; j < matrixSize; j++) {
      for (let k = 0; k < matrixSize; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }
  console.log('Processed Task 2 Matrix');

  return result;
}
