import Papa from "papaparse";

export async function loadCsv<T>(fileName: string): Promise<T[]> {
    const response = await fetch(`/data/${fileName}`);

    if (!response.ok) {
        throw new Error(`Could not load ${fileName}`);
    }

    const csvText = await response.text();

    const result = Papa.parse<T>(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
    });

    return result.data;
}