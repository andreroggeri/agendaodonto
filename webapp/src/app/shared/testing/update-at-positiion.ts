/**
 * Clones an array and updates the element at the given position with the given data.
 */
export function cloneAndUpdateAtPosition<T>(
    position: number,
    currentData: T[],
    updatedData: Partial<T>,
) {
    const rows = [...currentData];
    rows[position] = {
        ...rows[position],
        ...updatedData,
    };
    return rows;
}
