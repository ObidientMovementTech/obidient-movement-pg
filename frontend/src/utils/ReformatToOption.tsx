/**
 * Converts data from { id: any; name: any }[] format to { id: number; label: string; value: string; unavailable: boolean }[]
 * @param data The original data array
 * @returns The converted data array
 */
export function convertData(data: { id: any; name: any }[]): { id: number; label: string; value: string; unavailable: boolean }[] {
    return data.map((item, index) => {
      return {
        id: index + 1,
        label: item.name,
        value: item.name,
        unavailable: false,
      };
    });
  }