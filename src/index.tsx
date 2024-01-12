export { ConfigOptions, Controls } from "./types";

import {
    GameObject,
    HorizontalAlignment,
    HorizontalBox,
    LayoutBox,
    ProgressBar,
    TextBox,
    TextJustification,
    UIElement,
    UIPresentationStyle,
    VerticalAlignment,
    VerticalBox,
    WidgetSwitcher,
} from "@tabletop-playground/api";
import { boxChild, jsxInTTPG, parseColor, render, useRef } from "jsx-in-ttpg";
import { Modal, Tabs } from "ttpg-trh-ui";
import { BadgeEditor } from "./parts/badgeEditor";
import { BarEditor } from "./parts/barEditor";
import { PointerEditor } from "./parts/pointerEditor";
import { ConfigOptions, Store, Config, BLANK_IMG, Controls } from "./types";
import { chunker } from "./util/chunker";
import icons from "ttpg-trh-icons";

const PIPS = {
    circle: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/circle.png",
    circleEmpty: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/circle-empty.png",
    circleHollow: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/circle-hollow.png",

    diamond: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/diamond.png",
    diamondEmpty: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/diamond-empty.png",
    diamondHollow: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/diamond-hollow.png",

    shield: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/shield.png",
    shieldEmpty: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/shield-empty.png",
    shieldHollow: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/shield-hollow.png",

    crown: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/crown.png",
    crownEmpty: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/crown-empty.png",
    crownHollow: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/crown-hollow.png",

    hexagon: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/hexagon.png",
    hexagonEmpty: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/hexagon-empty.png",
    hexagonHollow: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/hexagon-hollow.png",

    flame: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/flame.png",
    flameEmpty: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/flame-empty.png",
    flameHollow: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/flame-hollow.png",

    skull: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/skull.png",
    skullEmpty: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/skull-empty.png",
    skullHollow: "https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/icons/pips/skull-hollow.png",
};

const ucFirst = (str: string = "") => str.slice(0, 1).toUpperCase() + str.slice(1, str.length);

const ALIGNMENT_VALUES = {
    left: 1,
    right: 0,
} as const;

const DEFAULT_CONFIG: ConfigOptions = {
    controls: false,
    static: false,
    scale: 1,
    zOffset: 0,
    pointer: false,
    bars: [],
};

const STORAGE: { [key: string]: Controls } = {};

export const HUDControls = (obj: GameObject): Controls | undefined => {
    return STORAGE[obj.getId()];
};

const getSize = (obj: GameObject, withRot: boolean = false) => {
    const ui = obj.getUIs();
    ui.forEach((u) => {
        obj.removeUIElement(u);
    });
    const bounds = obj.getExtent(withRot, false);
    const center = obj.getExtentCenter(withRot, false);
    ui.forEach((u) => {
        obj.addUI(u);
    });
    return [center, bounds];
};

export const RegisterHUD = (obj: GameObject, init: ConfigOptions = DEFAULT_CONFIG) => {
    const ui = new UIElement();

    obj.onDestroyed.add((o) => {
        delete STORAGE[o.getId()];
    });

    const { load: loadStore, save: saveStore } = chunker<Store>(obj, "trh:hud.store");
    const { load: loadConfig, save: saveConfig } = chunker<Config>(obj, "trh:hud.config");

    const initConifg: Config = {
        controls: init.controls ?? false,
        static: init.static ?? false,
        zOffset: init.zOffset ?? 0,
        scale: init.scale ?? 1,
        pointerEnabled: (init.pointer ?? false) !== false,
        pointer:
            init.pointer === false || init.pointer === true
                ? {
                      type: "simple",
                      color: "#fff",
                      alignment: "right",
                  }
                : {
                      type: init.pointer?.type ?? "simple",
                      color: init.pointer?.color ?? "#fff",
                      alignment: init.pointer?.alignment ?? "right",
                  },
        bars: (init.bars ?? []).map((barInit) => {
            return {
                name: barInit.name,
                max: barInit.max,
                type: barInit?.type ?? "bar",
                emptyMode: barInit?.emptyMode ?? "hollow",
                emptyColor: barInit?.emptyColor ?? "#fff",
                color: barInit?.color ?? (barInit?.type ?? "bar") === "bar" ? "#f00" : "#fff",
                large: barInit?.large ?? false,
                text: barInit?.text ?? false,
                justify: barInit?.justify ?? "left",
            };
        }),
        leftBadgeEnabled: init.leftBadge !== undefined,
        leftBadge:
            init.leftBadge === undefined
                ? {
                      url: "",
                      color: "#fff",
                  }
                : typeof init.leftBadge === "string"
                ? {
                      url: init.leftBadge,
                      color: "#fff",
                  }
                : {
                      url: init.leftBadge.url,
                      color: init.leftBadge?.color ?? "#fff",
                  },
        rightBadgeEnabled: init.rightBadge !== undefined,
        rightBadge:
            init.rightBadge === undefined
                ? {
                      url: "",
                      color: "#fff",
                  }
                : typeof init.rightBadge === "string"
                ? {
                      url: init.rightBadge,
                      color: "#fff",
                  }
                : {
                      url: init.rightBadge.url,
                      color: init.rightBadge?.color ?? "#fff",
                  },
    };

    const [config] = loadConfig(initConifg) as [Config, { version?: string; chunks: number; size: number }];
    const [store] = loadStore({ bars: config.bars.map((bar) => bar.max) }) as [Store, { version?: string; chunks: number; size: number }];

    const [center, bounds] = getSize(obj);

    const switchRef = useRef<WidgetSwitcher>();
    const hudRef = useRef<LayoutBox>();
    const wrapperRef = useRef<LayoutBox>();
    const barlistRef = useRef<VerticalBox>();
    const valuelistRef = useRef<VerticalBox>();

    const updateBar = (idx: number) => {
        const { type: barType, max } = config.bars[idx];
        const value = store.bars[idx];

        if (barType === "bar") {
            const progressBar = config.controls
                ? ((barlistRef.current?.getChildAt(idx) as HorizontalBox | undefined)?.getChildAt(1) as ProgressBar | undefined)
                : (barlistRef.current?.getChildAt(idx) as ProgressBar | undefined);
            progressBar?.setProgress(max === 0 ? 1 : Math.max(value, 0) / max);

            const innerBar = ((valuelistRef.current?.getChildAt(idx) as HorizontalBox | undefined)?.getChildAt(1) as LayoutBox | undefined)?.getChild() as ProgressBar | undefined;

            if (config.bars[idx]?.text) {
                progressBar?.setText(`${Math.max(value, 0)} / ${max}`);
            }
            innerBar?.setProgress(max === 0 ? 1 : Math.max(value, 0) / max);
            innerBar?.setText(`${Math.max(value, 0)} / ${max}`);
        } else {
            const boxWrapper = config.controls
                ? (((barlistRef.current?.getChildAt(idx) as HorizontalBox | undefined)?.getChildAt(1) as LayoutBox | undefined)?.getChild() as HorizontalBox | undefined)
                : ((barlistRef.current?.getChildAt(idx) as LayoutBox | undefined)?.getChild() as HorizontalBox | undefined);

            const innerBar = ((valuelistRef.current?.getChildAt(idx) as HorizontalBox | undefined)?.getChildAt(1) as LayoutBox | undefined)?.getChild() as HorizontalBox | undefined;

            if (boxWrapper) {
                boxWrapper.removeAllChildren();
                const bar = config.bars[idx];
                [
                    ...Array(value)
                        .fill(0)
                        .map(() => <image height={bar.large ? 24 : 16} url={PIPS[barType]} color={bar.color} />),
                    ...(bar.emptyMode !== "blank"
                        ? Array(bar.max - value)
                              .fill(0)
                              .map(() => <image height={bar.large ? 24 : 16} url={PIPS[(barType + ucFirst(bar.emptyMode as string)) as keyof typeof PIPS]} color={bar.emptyColor ?? bar.color} />)
                        : []),
                ].map((el) => {
                    boxWrapper.addChild(render(el));
                });
            }

            if (innerBar) {
                innerBar.removeAllChildren();
                const bar = config.bars[idx];
                [
                    ...Array(value)
                        .fill(0)
                        .map(() => <image height={16} url={PIPS[barType]} color={bar.color} />),
                    ...(bar.emptyMode !== "blank"
                        ? Array(bar.max - value)
                              .fill(0)
                              .map(() => <image height={16} url={PIPS[(barType + ucFirst(bar.emptyMode as string)) as keyof typeof PIPS]} color={bar.emptyColor ?? bar.color} />)
                        : []),
                ].map((el) => {
                    innerBar.addChild(render(el));
                });
            }
        }
    };

    const controls: Controls = {
        set: (key, value) => {
            const idx = config.bars.findIndex((each) => each.name === key);
            if (idx >= 0) {
                const max = config.bars[idx].max;
                const val = Math.min(max, Math.min(value));
                if (val !== store.bars[idx]) {
                    store.bars[idx] = Math.max(value, 0);
                    saveStore(store);
                    updateBar(idx);
                    return true;
                }
            }
            return false;
        },
        decrement: (key) => {
            const idx = config.bars.findIndex((each) => each.name === key);
            if (idx >= 0) {
                const max = config.bars[idx].max;
                const value = (store.bars[idx] ?? max) - 1;
                if (value < 0) {
                    return false;
                }
                store.bars[idx] = Math.max(value, 0);
                saveStore(store);
                updateBar(idx);
                return true;
            }
            return false;
        },
        increment: (key) => {
            const idx = config.bars.findIndex((each) => each.name === key);
            if (idx >= 0) {
                const max = config.bars[idx].max;
                const val = store.bars[idx] + 1;
                if (val > max) {
                    return false;
                }
                store.bars[idx] = Math.min(val, max);
                saveStore(store);
                updateBar(idx);
                return true;
            }
            return false;
        },
        setMax: (key, max) => {
            const idx = config.bars.findIndex((each) => each.name === key);
            if (idx >= 0) {
                max = Math.max(max, 0);
                config.bars[idx].max = max;

                saveConfig(config);
                if (max < store.bars[idx]) {
                    store.bars[idx] = max;
                    saveStore(store);
                }
                updateBar(idx);
                return true;
            }
            return false;
        },
        setColor: (key, color, emptyColor) => {
            const idx = config.bars.findIndex((each) => each.name === key);
            if (idx >= 0) {
                const clr = parseColor(color);
                if (clr) {
                    config.bars[idx].color = color;
                }
                if (emptyColor && parseColor(emptyColor)) {
                    config.bars[idx].emptyColor = emptyColor;
                }
                saveConfig(config);
                updateBar(idx);
            }
            return false;
        },
        setLeftBadge: (url) => {
            if (url === null) {
                config.leftBadgeEnabled = false;
            } else {
                config.leftBadgeEnabled = true;
                config.leftBadge.url = url;
                repaint();
            }
            repaint();
        },
        setLeftBadgeColor: (color) => {
            const clr = parseColor(color);
            if (clr) {
                config.leftBadge.color = color;
                repaint();
            }
        },
        setRightBadge: (url) => {
            if (url === null) {
                config.rightBadgeEnabled = false;
                repaint();
            } else {
                config.rightBadgeEnabled = true;
                config.rightBadge.url = url;
                repaint();
            }
        },
        setRightBadgeColor: (color) => {
            const clr = parseColor(color);
            if (clr) {
                config.rightBadge.color = color;
                repaint();
            }
        },
    };

    const buildValues = () => {
        return config.bars.map((bar, i) => {
            const curRef = useRef<TextBox>();
            const maxRef = useRef<TextBox>();

            const barType = bar.type;
            const emptyMode = bar.emptyMode;

            return (
                <horizontalbox valign={VerticalAlignment.Center} gap={8}>
                    {boxChild(1, <text>{bar.name}</text>)}
                    <layout width={256}>
                        {barType === "bar" ? (
                            <progressbar value={(store.bars[i] ?? bar.max) / bar.max} label={`${store.bars[i] ?? bar.max} / ${bar.max}`} barColor={bar.color} />
                        ) : (
                            <horizontalbox gap={4}>
                                {[
                                    ...Array(store.bars[i] ?? config.bars[i].max)
                                        .fill(0)
                                        .map(() => <image height={16} url={PIPS[barType]} color={bar.color} />),
                                    ...(emptyMode !== "blank"
                                        ? Array(bar.max - (store.bars[i] ?? config.bars[i].max))
                                              .fill(0)
                                              .map(() => (
                                                  <image
                                                      height={16}
                                                      url={PIPS[emptyMode === "full" ? barType : ((barType + ucFirst(emptyMode as string)) as keyof typeof PIPS)]}
                                                      color={bar.emptyColor ?? bar.color}
                                                  />
                                              ))
                                        : []),
                                ]}
                            </horizontalbox>
                        )}
                    </layout>

                    {boxChild(
                        1,
                        <input
                            type={"positive-integer"}
                            value={`${store.bars[i] ?? bar.max}`}
                            ref={curRef}
                            onCommit={(el, p, v) => {
                                const n = Number(v);
                                if (!isNaN(n)) {
                                    controls.set(bar.name, n);
                                    const idx = config.bars.findIndex((each) => each.name === bar.name);
                                    el.setText(`${store.bars[idx]}`);
                                    maxRef.current?.setText(`${config.bars[idx].max}`);
                                }
                            }}
                        />
                    )}
                    {boxChild(
                        1,
                        <input
                            type={"positive-integer"}
                            value={`${bar.max}`}
                            ref={maxRef}
                            onCommit={(el, p, v) => {
                                const n = Number(v);
                                if (!isNaN(n)) {
                                    controls.setMax(bar.name, n);
                                    const idx = config.bars.findIndex((each) => each.name === bar.name);
                                    el.setText(`${config.bars[idx].max}`);
                                    curRef.current?.setText(`${store.bars[idx]}`);
                                }
                            }}
                        />
                    )}
                </horizontalbox>
            );
        });
    };

    const buildHud = () => {
        return (
            <verticalbox halign={HorizontalAlignment.Left}>
                <horizontalbox valign={VerticalAlignment.Center} halign={HorizontalAlignment.Fill} gap={8}>
                    {config.leftBadgeEnabled && <image width={64} color={config.leftBadge.color} url={config.leftBadge.url === "" ? BLANK_IMG : config.leftBadge.url} />}
                    <layout width={256} hidden={config.bars.length === 0}>
                        <verticalbox halign={HorizontalAlignment.Fill}>
                            <verticalbox halign={HorizontalAlignment.Fill} gap={2} ref={barlistRef}>
                                {(config.bars ?? []).map((bar, i) => {
                                    const value = store.bars[i] ?? bar.max;

                                    const barText = bar.text ? `${value} / ${bar.max}` : undefined;
                                    const barValue = value / (bar.max ?? 1);
                                    const barType = bar.type ?? "bar";

                                    if (barType === "bar") {
                                        return config.controls ? (
                                            <horizontalbox valign={VerticalAlignment.Center}>
                                                <imagebutton
                                                    url={icons.arrows.caretLeft}
                                                    onClick={(el) => {
                                                        controls.decrement(bar.name);
                                                    }}
                                                    height={10}
                                                />
                                                {boxChild(1, <progressbar value={barValue} size={bar.large ? 16 : 8} label={barText} barColor={bar.color ?? "#f00"} />)}
                                                <imagebutton
                                                    url={icons.arrows.caretRight}
                                                    onClick={(el) => {
                                                        controls.increment(bar.name);
                                                    }}
                                                    height={10}
                                                />
                                            </horizontalbox>
                                        ) : (
                                            <progressbar value={barValue} size={bar.large ? 16 : 8} label={barText} barColor={bar.color ?? "#f00"} />
                                        );
                                    } else {
                                        const emptyMode = bar.emptyMode;
                                        return config.controls ? (
                                            <horizontalbox valign={VerticalAlignment.Center}>
                                                <imagebutton
                                                    url={icons.arrows.caretLeft}
                                                    onClick={(el) => {
                                                        controls.decrement(bar.name);
                                                    }}
                                                    height={10}
                                                />
                                                {boxChild(
                                                    1,
                                                    <layout halign={bar.justify === "right" ? HorizontalAlignment.Right : HorizontalAlignment.Left}>
                                                        <horizontalbox gap={4}>
                                                            {[
                                                                ...Array(value)
                                                                    .fill(0)
                                                                    .map(() => <image height={bar.large ? 24 : 16} url={PIPS[barType]} color={bar.color} />),
                                                                ...(emptyMode !== "blank"
                                                                    ? Array(bar.max - value)
                                                                          .fill(0)
                                                                          .map(() => (
                                                                              <image
                                                                                  height={bar.large ? 24 : 16}
                                                                                  url={PIPS[emptyMode === "full" ? barType : ((barType + ucFirst(emptyMode as string)) as keyof typeof PIPS)]}
                                                                                  color={bar.emptyColor ?? bar.color}
                                                                              />
                                                                          ))
                                                                    : []),
                                                            ]}
                                                        </horizontalbox>
                                                    </layout>
                                                )}
                                                <imagebutton
                                                    url={icons.arrows.caretRight}
                                                    onClick={(el) => {
                                                        controls.increment(bar.name);
                                                    }}
                                                    height={10}
                                                />
                                            </horizontalbox>
                                        ) : (
                                            <layout halign={bar.justify === "right" ? HorizontalAlignment.Right : HorizontalAlignment.Left}>
                                                <horizontalbox gap={2}>
                                                    {[
                                                        ...Array(value)
                                                            .fill(0)
                                                            .map(() => <image height={bar.large ? 32 : 24} url={PIPS[barType]} color={bar.color} />),
                                                        ...(emptyMode !== "blank"
                                                            ? Array(bar.max - value)
                                                                  .fill(0)
                                                                  .map(() => (
                                                                      <image
                                                                          height={bar.large ? 32 : 24}
                                                                          url={PIPS[emptyMode === "full" ? barType : ((barType + ucFirst(emptyMode as string)) as keyof typeof PIPS)]}
                                                                          color={bar.emptyColor ?? bar.color}
                                                                      />
                                                                  ))
                                                            : []),
                                                    ]}
                                                </horizontalbox>
                                            </layout>
                                        );
                                    }
                                })}
                            </verticalbox>
                        </verticalbox>
                    </layout>
                    {config.rightBadgeEnabled && <image width={64} color={config.rightBadge.color} url={config.rightBadge.url === "" ? BLANK_IMG : config.rightBadge.url} />}
                </horizontalbox>
                {config.pointerEnabled ? (
                    <image
                        color={config.pointer.color}
                        url={`https://raw.githubusercontent.com/RobMayer/ttpg-trh-ui/main/hosted/projects/minihud/pointer-${config.pointer.type}-${config.pointer.alignment}.png`}
                    />
                ) : null}
            </verticalbox>
        );
    };

    const repaint = () => {
        hudRef.current?.setChild(render(buildHud()));
        valuelistRef.current?.removeAllChildren();
        buildValues().map((each) => {
            valuelistRef.current?.addChild(render(each));
        });
    };

    if (!config.static) {
        obj.onCustomAction.add((o, p, id) => {
            if (id === "minihud" && !config.static) {
                ui.anchorX = 0.5;
                ui.scale = 0.25;
                obj.updateUI(ui);
                switchRef.current?.setActiveIndex(1);
            }
        });
        obj.addCustomAction("Edit MiniHUD", "Edit the MiniHUD configuration", "minihud");
    }

    const hud = render(
        <layout ref={wrapperRef} padding={{ bottom: Number(((bounds.z * 10) / 0.25 + config.zOffset).toFixed(0)) }}>
            <switch ref={switchRef}>
                <layout ref={hudRef}>{buildHud()}</layout>
                <layout padding={4} width={960} height={480}>
                    <Modal
                        title="Mini-HUD"
                        onClose={() => {
                            saveConfig(config);
                            saveStore(store);
                            repaint();
                            ui.anchorX = config.pointerEnabled ? ALIGNMENT_VALUES[config.pointer.alignment] : 0.5;
                            ui.scale = config.scale / 4;
                            wrapperRef.current?.setPadding(undefined, undefined, undefined, Number(((bounds.z * 10) / 0.25 + config.zOffset).toFixed(0)));
                            obj.updateUI(ui);
                            switchRef.current?.setActiveIndex(0);
                        }}
                        footer={[
                            <button
                                onClick={() => {
                                    saveConfig(config);
                                    saveStore(store);
                                    repaint();
                                    ui.anchorX = config.pointerEnabled ? ALIGNMENT_VALUES[config.pointer.alignment] : 0.5;
                                    ui.scale = config.scale / 4;
                                    wrapperRef.current?.setPadding(undefined, undefined, undefined, Number(((bounds.z * 10) / 0.25 + config.zOffset).toFixed(0)));
                                    obj.updateUI(ui);
                                    switchRef.current?.setActiveIndex(0);
                                }}
                            >
                                Save and Close
                            </button>,
                        ]}
                    >
                        <Tabs titles={["Values", "Bars", "Other"]}>
                            <verticalbox gap={4} ref={valuelistRef}>
                                {buildValues()}
                            </verticalbox>
                            <verticalbox>
                                <BarEditor config={config} store={store} repaint={repaint} />
                            </verticalbox>
                            <layout padding={8}>
                                <horizontalbox gap={16} halign={HorizontalAlignment.Fill}>
                                    {boxChild(
                                        1,
                                        <verticalbox gap={4}>
                                            <text justify={TextJustification.Center} size={18}>
                                                General Settings
                                            </text>
                                            <horizontalbox gap={4}>
                                                <layout width={96}></layout>
                                                {boxChild(
                                                    1,
                                                    <checkbox
                                                        checked={config.controls}
                                                        onChange={(el, p, v) => {
                                                            config.controls = v;
                                                        }}
                                                        label={"Show External Controls"}
                                                    />
                                                )}
                                            </horizontalbox>
                                            <horizontalbox gap={4}>
                                                <layout width={96} halign={HorizontalAlignment.Right}>
                                                    Scale
                                                </layout>
                                                {boxChild(
                                                    1,
                                                    <input
                                                        type={"float"}
                                                        value={`${config.scale}`}
                                                        onChange={(el, p, v) => {
                                                            const n = Number(v);
                                                            if (!isNaN(n)) {
                                                                config.scale = n;
                                                            }
                                                        }}
                                                    />
                                                )}

                                                <layout width={96} halign={HorizontalAlignment.Right}>
                                                    Z-Offset
                                                </layout>
                                                {boxChild(
                                                    1,
                                                    <input
                                                        type={"float"}
                                                        value={`${config.zOffset}`}
                                                        onCommit={(el, p, v) => {
                                                            const n = Number(v);
                                                            if (!isNaN(n)) {
                                                                config.zOffset = n;
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </horizontalbox>
                                        </verticalbox>
                                    )}
                                    {boxChild(
                                        1,
                                        <verticalbox gap={8}>
                                            <BadgeEditor which={"Left"} config={config} />
                                            <BadgeEditor which={"Right"} config={config} />
                                            <PointerEditor config={config} />
                                        </verticalbox>
                                    )}
                                </horizontalbox>
                            </layout>
                        </Tabs>
                    </Modal>
                </layout>
            </switch>
        </layout>
    );

    ui.anchorX = config.pointerEnabled ? ALIGNMENT_VALUES[config.pointer.alignment] : 0.5;
    ui.anchorY = 1.0;
    ui.presentationStyle = UIPresentationStyle.ViewAligned;
    ui.scale = config.scale / 4;
    ui.useTransparency = true;
    // ui.zoomVisibility = UIZoomVisibility.Both;
    ui.widget = hud;
    ui.position = center.subtract(obj.getPosition());

    obj.addUI(ui);

    STORAGE[obj.getId()] = controls;
};
