# getting started

when you have your package set up (I recommend using create-ttpg-package to do so), you'll just need to add "ttpg-trh-minihud" to your dependencies via "npm i ttpg-trh-minihud", "yarn add ttpg-trh-minihud", or "pnpm add ttpg-trh-minihud".

create a script that imports/requires "RegisterHUD" from "ttpg-trh-miniud" and give it the object that you want to register it to. You can also provide an initial config.

```typescript
import { refObject } from "@tabletop-playground/api";
import { RegisterHUD } from "ttpg-trh-minihud";

const config = {
    bars: [{ name: "health", max: 10 }],
};

RegisterHUD(refObject, config);
```

you can also pull an initial config from template metadata, letting you recycle the same script on a breadth of objects without setting a config for each use-case, so long as you're careful that the metadata is formatted correctly.

```typescript
import { refObject } from "@tabletop-playground/api";
import { RegisterHUD } from "ttpg-trh-minihud";

RegisterHUD(refObject, JSON.parse(refObject.getTemplateMetadata()).minihud);

/*

//template metadata
{
    "minihud" : {
        "bars": [ { "name": "health", "max": 10 } ]
    }
}
*/
```

this is fully typed, but here's a description of the config-options:

```typescript

{
    controls?: boolean; // are there buttons next to the health bars that let you modify them on the fly. Default: false
    static?: boolean; // is the right-click menu hidden? Default: false - it is available by defualt. Use this if your config is never going to change (you may want to make sure controls = true; you can still modify items via scripting even if this is true)
    zOffset?: number; // how far off the top of the geometry does the HUD start
    scale?: number; // how big should it be - multiplicative
    pointer?:
        | false // do not use a pointer - default
        | true // use the default pointer: simple-type, right-justified, #fff color
        | { //customize the pointer
              type?: "simple" | "deco" | "nouveau";
              alignment?: "left" | "right";
              color?: string; // hex-formatted color: eg: "#fff" or "#ffff" or "#ffffff" or "#ffffffff"
          };
    bars?: { // the actual healthbars you want to show
        name: string; //required; key used for scripting access;
        type?: "bar" | "circle" | "diamond" | "shield" | "crown" | "hexagon" | "flame" | "skull" //default is "bar" - all others besides "bar" will use image pips
        emptyMode?: "hollow" | "blank" | "full" | "empty"; // only used for non-bar types. how should empty-pips be displayed? default is "hollow"
        emptyColor?: string; // what color are the empty pips for non-bar types. default is #fff
        max: number; // required; what's the max HP of your mini, for example
        color?: string; // what color should the bar be, or pips? defaults to "#f00" for bar-type and "#fff" for non-bar type
        text?: boolean; // should the bar display "10 / 10" (or whatever). default is false, only works with bar-type.
        large?: boolean; // bars and pips will be of larger format
        justify?: "left" | "right"; // are the pips left or right aligned. No effect on bar-types.
    }[];
    leftBadge?: // left-aligned badge next to the bars.
        | "shield" // just the badge type, color will be assumed to be "#fff"
        | {
              type: "shield"; // what kind of badge - only shield for now, but I'll be adding more.
              color?: string; // color of the badge
          };
    rightBadge?: // right-alsigned badge next to the bars.
        | "shield" // just the badge type, color will be assumed to be "#fff"
        | {
              type: "shield"; // what kind of badge - only shield for now, but I'll be adding more.
              color?: string; // color of the badge
          };
};

```

if you want me to add more badges let me know - even better if you send me a 128x128 all-white (or white with black details I guess?) PNG with transparent background, and I'll add it in.

for additional pips, the process is slightly more involved - the ones that are there right now are derived from font-awesome. I'll be trying my hand at pulling in SVGs from Game-Icons.net, too - my point is that I need flattened single-path SVGs to make badges, if you want me to add something.
