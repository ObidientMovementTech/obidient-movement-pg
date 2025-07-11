// types/statesLGAsAndWards.ts

/**
 * Represents a structure for states that includes LGAs and their corresponding wards.
 * Example:
 * {
 *   "Lagos": {
 *     lgas: {
 *       "Ikeja": {
 *         wards: ["Ward A", "Ward B"]
 *       }
 *     }
 *   }
 * }
 */
export interface StatesLGAsAndWards {
  [state: string]: {
    lgas: {
      [lga: string]: {
        wards: string[];
      };
    };
  };
}
