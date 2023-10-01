export const POINTER_TYPES = ["simple", "deco", "nouveau"] as const;
export const POINTER_ALIGNMENTS = ["left", "right"] as const;

export const BADGE_TYPES = ["shield"] as const;
export const BAR_TYPES = ["bar", "circle", "diamond", "shield", "crown", "hexagon", "flame", "skull"] as const;
export const BAR_EMPTY_MODES = ["hollow", "blank", "full", "empty"] as const;

export const COLOR_REGEX = /^[#r]([a-f0-9]{3}|[a-f0-9]{4}|[a-f0-9]{6}|[a-f0-9]{8})$/i;

export type Store = {
    bars: number[];
};

export type Config = {
    controls: boolean;
    static: boolean;
    zOffset: number;
    scale: number;
    pointerEnabled: boolean;
    pointer: {
        type: (typeof POINTER_TYPES)[number];
        alignment: "left" | "right";
        color: string;
    };
    bars: {
        name: string;
        type: (typeof BAR_TYPES)[number];
        emptyMode: (typeof BAR_EMPTY_MODES)[number];
        emptyColor: string;
        max: number;
        color: string;
        text: boolean;
        large: boolean;
        justify: "left" | "right";
    }[];
    leftBadgeEnabled: boolean;
    leftBadge: {
        type: (typeof BADGE_TYPES)[number];
        color: string;
    };
    rightBadgeEnabled: boolean;
    rightBadge: {
        type: (typeof BADGE_TYPES)[number];
        color: string;
    };
};

export type ConfigOptions = {
    controls?: boolean;
    static?: boolean;
    zOffset?: number;
    scale?: number;
    pointer?:
        | false
        | true
        | {
              type?: (typeof POINTER_TYPES)[number];
              alignment?: "left" | "right";
              color?: string;
          };
    bars?: {
        name: string;
        type?: (typeof BAR_TYPES)[number];
        emptyMode?: (typeof BAR_EMPTY_MODES)[number];
        emptyColor?: string;
        max: number;
        color?: string;
        text?: boolean;
        large?: boolean;
        justify?: "left" | "right";
    }[];
    leftBadge?:
        | (typeof BADGE_TYPES)[number]
        | {
              type: (typeof BADGE_TYPES)[number];
              color?: string;
          };
    rightBadge?:
        | (typeof BADGE_TYPES)[number]
        | {
              type: (typeof BADGE_TYPES)[number];
              color?: string;
          };
};
