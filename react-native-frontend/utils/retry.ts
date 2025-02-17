// /**
//  * Wraps an async function with retry logic.
//  *
//  * @param fn - The asynchronous function to wrap.
//  * @param retries - The maximum number of attempts (default is 3).
//  * @param delay - The delay in milliseconds between attempts (default is 1000 ms).
//  * @returns A new function that will retry on failure.
//  */
// // biome-ignore lint: any is ok
// export function withRetry<T extends (...args: any[]) => Promise<any>>(
// 	fn: T,
// 	retries = 3,
// 	delay = 1000,
// ) {
// 	return async (...args: Parameters<T>) => {
// 		let attempt = 0;
// 		while (attempt < retries) {
// 			try {
// 				// Try to execute the function.
// 				return await fn(...args);
// 			} catch (error) {
// 				attempt++;
// 				if (attempt >= retries) {
// 					// If we've reached the max attempts, rethrow the error.
// 					throw error;
// 				}

// 				// Wait for the specified delay before retrying.
// 				await new Promise((resolve) => setTimeout(resolve, delay));
// 			}
// 		}

// 		throw new Error("Unexpected error in retry logic.");
// 	};
// }

/**
 * Wraps an async function with retry logic.
 *
 * @param fn - The asynchronous function to wrap.
 * @param retries - The maximum number of attempts (default is 3).
 * @param delay - The delay in milliseconds between attempts (default is 1000 ms).
 * @returns A new function that will retry on failure.
 */
// biome-ignore lint: any
export function withRetry<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    retries = 3,
    delay = 1000
  ): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
    return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      let attempt = 0;
      while (attempt < retries) {
        try {
          // Try to execute the function.
          return await fn(...args);
        } catch (error) {
          attempt++;
          if (attempt >= retries) {
            // If we've reached the max attempts, rethrow the error.
            throw error;
          }
          // Wait for the specified delay before retrying.
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      // This line should never be reached.
      throw new Error("Unexpected error in retry logic.");
    };
  }