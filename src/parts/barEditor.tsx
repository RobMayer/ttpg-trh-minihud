import { TextJustification, HorizontalAlignment, SelectionBox, TextBox, CheckBox } from "@tabletop-playground/api";
import { jsxInTTPG, boxChild, RefObject, useRef } from "jsx-in-ttpg";
import { DynamicList, icons, PatternInput } from "ttpg-trh-ui";
import { Store, Config, BAR_TYPES, COLOR_REGEX, BAR_EMPTY_MODES, POINTER_ALIGNMENTS } from "../types";

export const BarEditor = ({ handle, config, store, repaint }: { store: Store; config: Config; handle: RefObject<{ refresh: () => void; setPopulator: () => void }>; repaint: () => void }) => {
    return (
        <DynamicList
            title={""}
            handle={handle}
            options={[
                <imagebutton
                    height={16}
                    url={icons.actions.add}
                    onClick={() => {
                        if (!config.bars) {
                            config.bars = [];
                        }
                        if (!store.bars) {
                            store.bars = [];
                        }
                        config.bars.push({
                            name: "",
                            color: "#04f",
                            max: 10,
                            type: "bar",
                            text: false,
                            large: false,
                            justify: "left",
                            emptyColor: "#fff",
                            emptyMode: "hollow",
                        });
                        store.bars.push(10);
                        handle.current?.refresh();
                    }}
                />,
            ]}
            populator={() => {
                return [
                    <horizontalbox gap={4}>
                        {boxChild(3, <text justify={TextJustification.Center}>Name</text>)}
                        {boxChild(1, <text justify={TextJustification.Center}>Max</text>)}
                        {boxChild(2, <text justify={TextJustification.Center}>Type</text>)}
                        {boxChild(2, <text justify={TextJustification.Center}>Color</text>)}
                        {boxChild(2, <text justify={TextJustification.Center}>Empty</text>)}
                        {boxChild(2, <text justify={TextJustification.Center}>Empty Clr</text>)}
                        {boxChild(2, <text justify={TextJustification.Center}>Justify</text>)}
                        {boxChild(1, <text justify={TextJustification.Center}>Lrg?</text>)}
                        {boxChild(1, <text justify={TextJustification.Center}>Txt?</text>)}
                        {boxChild(1, <text justify={TextJustification.Center}></text>)}
                    </horizontalbox>,
                    ...(config.bars ?? []).map((bar, i) => {
                        const emptyModeRef = useRef<SelectionBox>();
                        const emptyColorRef = useRef<TextBox>();
                        const textCheckRef = useRef<CheckBox>();
                        const justifyRef = useRef<SelectionBox>();

                        return (
                            <horizontalbox gap={4}>
                                {boxChild(
                                    3,
                                    <input
                                        value={bar.name}
                                        onChange={(e, p, v) => {
                                            if (config.bars) {
                                                config.bars[i].name = v;
                                                repaint();
                                            }
                                        }}
                                    />
                                )}
                                {boxChild(
                                    1,
                                    <input
                                        value={`${bar.max}`}
                                        type={"positive-integer"}
                                        onCommit={(e, p, v) => {
                                            const n = Number(v);
                                            if (!isNaN(n)) {
                                                if (config.bars) {
                                                    config.bars[i].max = n;
                                                }
                                                store.bars[i] = Math.min(store.bars[i], n);
                                                repaint();
                                            }
                                        }}
                                    />
                                )}
                                {boxChild(
                                    2,
                                    <select
                                        value={config.bars?.[i].type}
                                        options={[...BAR_TYPES]}
                                        onChange={(el, p, v) => {
                                            if (config.bars?.[i]) {
                                                config.bars[i].type = BAR_TYPES[v];
                                                repaint();
                                            }
                                            if (BAR_TYPES[v] === "bar") {
                                                emptyModeRef.current?.setEnabled(false);
                                                emptyColorRef.current?.setEnabled(false);
                                                textCheckRef.current?.setEnabled(true);
                                                justifyRef.current?.setEnabled(false);
                                            } else {
                                                emptyModeRef.current?.setEnabled(true);
                                                emptyColorRef.current?.setEnabled(true);
                                                textCheckRef.current?.setEnabled(false);
                                                justifyRef.current?.setEnabled(true);
                                            }
                                        }}
                                    />
                                )}
                                {boxChild(
                                    2,
                                    <PatternInput
                                        pattern={COLOR_REGEX}
                                        value={config.bars?.[i].color}
                                        onValidCommit={(el, p, v) => {
                                            if (config.bars) {
                                                config.bars[i].color = v;
                                                repaint();
                                            }
                                        }}
                                    />
                                )}
                                {boxChild(
                                    2,
                                    <select
                                        value={config.bars?.[i].emptyMode ?? "hollow"}
                                        options={[...BAR_EMPTY_MODES]}
                                        disabled={(config.bars?.[i].type ?? "bar") === "bar"}
                                        ref={emptyModeRef}
                                        onChange={(el, p, v) => {
                                            if (config.bars) {
                                                config.bars[i].emptyMode = BAR_EMPTY_MODES[v];
                                                repaint();
                                            }
                                        }}
                                    />
                                )}
                                {boxChild(
                                    2,
                                    <PatternInput
                                        ref={emptyColorRef}
                                        pattern={COLOR_REGEX}
                                        value={config.bars?.[i].emptyColor}
                                        onValidCommit={(el, p, v) => {
                                            if (config.bars) {
                                                config.bars[i].emptyColor = v;
                                                repaint();
                                            }
                                        }}
                                        disabled={config.bars?.[i].type === "bar"}
                                    />
                                )}
                                {boxChild(
                                    2,
                                    <select
                                        value={config.bars?.[i].justify}
                                        options={[...POINTER_ALIGNMENTS]}
                                        disabled={config.bars?.[i].type === "bar"}
                                        ref={justifyRef}
                                        onChange={(el, p, v) => {
                                            if (config.bars) {
                                                config.bars[i].justify = POINTER_ALIGNMENTS[v];
                                                repaint();
                                            }
                                        }}
                                    />
                                )}
                                {boxChild(
                                    1,
                                    <layout halign={HorizontalAlignment.Center}>
                                        <checkbox
                                            size={12}
                                            checked={config.bars?.[i].large}
                                            onChange={(el, p, v) => {
                                                if (config.bars) {
                                                    config.bars[i].large = v;
                                                    repaint();
                                                }
                                            }}
                                        />
                                    </layout>
                                )}
                                {boxChild(
                                    1,
                                    <layout halign={HorizontalAlignment.Center}>
                                        <checkbox
                                            ref={textCheckRef}
                                            disabled={config.bars?.[i].type !== "bar"}
                                            size={12}
                                            checked={config.bars?.[i].text}
                                            onChange={(el, p, v) => {
                                                if (config.bars) {
                                                    config.bars[i].text = v;
                                                    repaint();
                                                }
                                            }}
                                        />
                                    </layout>
                                )}
                                {boxChild(
                                    1,
                                    <layout halign={HorizontalAlignment.Right}>
                                        <horizontalbox gap={4}>
                                            <imagebutton
                                                height={16}
                                                url={icons.actions.close}
                                                onClick={(el, p) => {
                                                    config.bars = (config.bars ?? []).filter((each, j) => i !== j);
                                                    store.bars = (store.bars ?? []).filter((each, j) => i !== j);
                                                    handle.current?.refresh();
                                                    repaint();
                                                }}
                                            />
                                        </horizontalbox>
                                    </layout>
                                )}
                            </horizontalbox>
                        );
                    }),
                ];
            }}
        />
    );
};
