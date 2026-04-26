/**
 * Array Manipulation Utilities
 * For product filtering, cart operations, sorting
 */

/**
 * Chunk array into smaller arrays
 * @example chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) return [];

  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

/**
 * Get unique values from array
 * @example unique([1, 2, 2, 3, 3, 3]) // [1, 2, 3]
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Get unique values by key
 * @example uniqueBy([{id: 1}, {id: 1}, {id: 2}], 'id') // [{id: 1}, {id: 2}]
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Group array by key
 * @example groupBy([{cat: 'A', val: 1}, {cat: 'B', val: 2}], 'cat')
 * // { A: [{cat: 'A', val: 1}], B: [{cat: 'B', val: 2}] }
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    return {
      ...result,
      [group]: [...(result[group] || []), item],
    };
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by key (ascending)
 * @example sortBy([{price: 100}, {price: 50}], 'price') // [{price: 50}, {price: 100}]
 */
export function sortBy<T>(array: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * Shuffle array randomly
 * @example shuffle([1, 2, 3, 4, 5])
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random element from array
 * @example randomElement([1, 2, 3, 4, 5]) // 3
 */
export function randomElement<T>(array: T[]): T | undefined {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Remove duplicates from array of objects
 * @example removeDuplicates([{id: 1}, {id: 1}], 'id') // [{id: 1}]
 */
export function removeDuplicates<T>(array: T[], key: keyof T): T[] {
  return uniqueBy(array, key);
}

/**
 * Flatten nested array
 * @example flatten([[1, 2], [3, 4], [5]]) // [1, 2, 3, 4, 5]
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.flat() as T[];
}

/**
 * Partition array based on condition
 * @example partition([1, 2, 3, 4], x => x % 2 === 0) // [[2, 4], [1, 3]]
 */
export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];

  array.forEach((item) => {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  });

  return [pass, fail];
}

/**
 * Find difference between two arrays
 * @example difference([1, 2, 3], [2, 3, 4]) // [1]
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter((item) => !arr2.includes(item));
}

/**
 * Find intersection of two arrays
 * @example intersection([1, 2, 3], [2, 3, 4]) // [2, 3]
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter((item) => arr2.includes(item));
}

/**
 * Sum array of numbers
 * @example sum([1, 2, 3, 4, 5]) // 15
 */
export function sum(array: number[]): number {
  return array.reduce((acc, val) => acc + val, 0);
}

/**
 * Sum array of objects by key
 * @example sumBy([{price: 100}, {price: 200}], 'price') // 300
 */
export function sumBy<T>(array: T[], key: keyof T): number {
  return array.reduce((acc, item) => {
    const value = item[key];
    return acc + (typeof value === "number" ? value : 0);
  }, 0);
}

/**
 * Get average of numbers
 * @example average([1, 2, 3, 4, 5]) // 3
 */
export function average(array: number[]): number {
  if (array.length === 0) return 0;
  return sum(array) / array.length;
}

/**
 * Find min value in array
 * @example min([5, 2, 8, 1, 9]) // 1
 */
export function min(array: number[]): number {
  return Math.min(...array);
}

/**
 * Find max value in array
 * @example max([5, 2, 8, 1, 9]) // 9
 */
export function max(array: number[]): number {
  return Math.max(...array);
}

/**
 * Count occurrences in array
 * @example countBy(['a', 'b', 'a', 'c']) // { a: 2, b: 1, c: 1 }
 */
export function countBy<T>(array: T[]): Record<string, number> {
  return array.reduce((acc, item) => {
    const key = String(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Paginate array
 * @example paginate([1, 2, 3, 4, 5], 1, 2) // [1, 2]
 */
export function paginate<T>(array: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return array.slice(start, end);
}


/**
 * Move item in array
 * @example moveItem([1, 2, 3, 4], 0, 2) // [2, 3, 1, 4]
 */
export function moveItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array];
  const [item] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, item);
  return result;
}