import { Accordian, PatternInput } from "ttpg-trh-ui";
import { COLOR_REGEX, Config, POINTER_ALIGNMENTS, POINTER_TYPES } from "../types";
import { boxChild, jsxInTTPG } from "jsx-in-ttpg";
import { HorizontalAlignment } from "@tabletop-playground/api";

export const PointerEditor = ({ config }: { config: Config }) => {
    return (
        <Accordian
            title={"Pointer"}
            isOpen={config.pointerEnabled}
            onToggle={(v) => {
                config.pointerEnabled = v;
            }}
        >
            <verticalbox gap={8}>
                <horizontalbox gap={4}>
                    <layout width={96} halign={HorizontalAlignment.Right}>
                        Type:
                    </layout>
                    {boxChild(
                        1,
                        <select
                            value={config.pointer.type}
                            options={[...POINTER_TYPES]}
                            onChange={(el, p, v) => {
                                config.pointer.type = POINTER_TYPES[v];
                            }}
                        />
                    )}
                </horizontalbox>
                <horizontalbox gap={4}>
                    <layout width={96} halign={HorizontalAlignment.Right}>
                        Align:
                    </layout>
                    {boxChild(
                        1,
                        <select
                            value={config.pointer.alignment}
                            options={[...POINTER_ALIGNMENTS]}
                            onChange={(el, p, v) => {
                                config.pointer.alignment = POINTER_ALIGNMENTS[v];
                            }}
                        />
                    )}
                </horizontalbox>
                <horizontalbox gap={4}>
                    <layout width={96} halign={HorizontalAlignment.Right}>
                        Color:
                    </layout>
                    {boxChild(
                        1,
                        <PatternInput
                            value={config.pointer.color}
                            onValidCommit={(el, p, v) => {
                                config.pointer.color = v;
                            }}
                            pattern={COLOR_REGEX}
                        />
                    )}
                </horizontalbox>
            </verticalbox>
        </Accordian>
    );
};
