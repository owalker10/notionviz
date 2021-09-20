export const median = (nums: number[]): number => {
  const sorted = [...nums].sort();
  const half = Math.floor(nums.length / 2);
  return nums.length % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
};

export const sum = (nums: number[]): number => nums.reduce((s, n) => s + n, 0);

export const countNotEmpty = (arr: unknown[]): number =>
  arr.filter((el) => el !== undefined).length;

export const countEmpty = (arr: unknown[]): number =>
  arr.filter((el) => el === undefined).length;

export const notEmpty = <T>(arr: T[]): T[] =>
  arr.filter((el) => el !== undefined);
