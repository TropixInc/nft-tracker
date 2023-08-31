/**
 * It validates that the value is a valid JSON object
 * @param {string} [errorMessage] - A custom error message to display when the value is invalid.
 * @returns A Joi validation function.
 */
export function createJSONObjectValidator(errorMessage?: string): any {
  // TODO Create Joi extension to validate JSON object in a generic way
  return (value, { state }) => {
    if (value[0] !== '{' && !/^\s*\{/.test(value)) {
      return;
    }

    try {
      return { value: JSON.parse(value) };
    } catch (err) {
      const key = state?.key || state?.path;
      throw new Error(errorMessage || `${key} must be a valid JSON object`);
    }
  };
}
