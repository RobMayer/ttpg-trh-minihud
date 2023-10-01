import { GameObject } from "@tabletop-playground/api";

const chunkString = (str: string, length: number) => [...(str.match(new RegExp(".{1," + length + "}", "g")) ?? [])];

export const chunker = <T>(obj: GameObject, key: string) => {
    const save = (data: T, version?: string) => {
        const toSave = JSON.stringify(data);
        if (toSave.length > 1000 * 63) {
            console.error("TOO LARGE TO SAVE");
            return false;
        }
        const chunks = chunkString(toSave, 1000);
        obj.setSavedData(JSON.stringify({ version, chunks: chunks.length, size: 1000 }), key);
        chunks.forEach((chunk, i) => {
            obj.setSavedData(chunk, `${key}[${i}]`);
        });
        return true;
    };

    const load = (fallback?: T): [T | undefined, { version?: string; chunks: number; size: number } | undefined] => {
        try {
            const metaRaw = obj.getSavedData(key);

            if (metaRaw === "") {
                return [fallback, undefined];
            }

            const meta = JSON.parse(metaRaw) as { version?: string; chunks: number; size: number };

            const res = JSON.parse(
                Array(meta.chunks)
                    .fill("")
                    .map((e, i) => obj.getSavedData(`${key}[${i}]`))
                    .join("")
            ) as T;
            return [res, meta];
        } catch (e) {
            console.error(e);
            return [fallback, undefined];
        }
    };

    return { save, load };
};
