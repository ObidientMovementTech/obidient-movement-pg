
/**
 * Represents a mapping of Nigerian states to their Local Government Areas (LGAs).
 * Example:
 * {
 *   "Lagos": ["Ikeja", "Surulere"],
 *   "Kano": ["Nassarawa", "Tarauni"]
 * }
 */
export interface StatesAndLGAs {
  [state: string]: string[];
}
