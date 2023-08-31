type Predicate = <T>(value: T, index: number, array: T[]) => unknown;

/**
 * Given an object and a predicate, return a new object with only the values that satisfy the predicate
 * @param obj - The object to filter.
 * @param {Predicate} predicate - A function that takes three arguments:
 * @returns An object with the same keys as the original object, but with only the values that pass the
 * predicate.
 */
export function filterValues(obj: Record<string, any>, predicate: Predicate): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Object.fromEntries(Object.entries(obj).filter(([_, v], i, arr) => predicate(v, i, arr)));
}

/**
 * Filter out all the undefined and null values from an object
 * @param obj - The object to filter.
 * @returns An object with the same keys as the original object, but with values that are not undefined
 * or null.
 */
export function filterVoid(obj: Record<string, any>): Record<string, any> {
  return filterValues(obj, (v) => typeof v !== 'undefined' && v !== null);
}
