/**
 * Returns a debounced version of the provided function.
 * The debounced function delays execution of `func` until `wait` milliseconds
 * have elapsed since the last invocation.
 *
 * @param func The function to debounce. Must be a function type (generic type T).
 * @param wait  Wait time in milliseconds before executing `func`.
 * @returns     The debounced function.
 *
 * @template T - Generic type for the function to debounce.
 *             Ensures `debounce` is reusable with any function signature.
 *             Constraints: `T` must be a function that accepts any arguments
 *             and returns any value (`(...args: any[]) => any`).
 */
export function debounce<
  T extends // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any[]) => any
>(func: T, wait: number) {
  // Stores the timeout ID returned by setTimeout, allowing cancellation with clearTimeout.
  let timeout: NodeJS.Timeout | null = null;

  // The debounced function that is returned.
  // Uses rest parameters (...args) to accept any arguments passed to it.
  // Parameters<T> utility type ensures type safety by inferring argument types from `func`.
  const debouncedFunc = (...args: Parameters<T>) => {
    // If a timeout is already pending, clear it to restart the debounce timer.
    if (timeout) clearTimeout(timeout);

    // Set a new timeout to execute `func` after `wait` milliseconds.
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };

  // Add a `cancel` method to `debouncedFunc` for manual cancellation of pending executions.
  debouncedFunc.cancel = () => {
    if (timeout) clearTimeout(timeout);
  };

  return debouncedFunc;
}
