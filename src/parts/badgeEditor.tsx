import { Accordian, PatternInput } from "ttpg-trh-ui";
import { BLANK_IMG, COLOR_REGEX, Config, Store } from "../types";
import { boxChild, jsxInTTPG, parseColor, useRef } from "jsx-in-ttpg";
import { Color, HorizontalAlignment, ImageWidget, VerticalAlignment } from "@tabletop-playground/api";

export const BadgeEditor = ({ config, which }: { config: Config; which: "Left" | "Right" }) => {
    const badgePreviewRef = useRef<ImageWidget>();

    const key = which.toLowerCase() as "left" | "right";

    return (
        <Accordian
            title={`${which} Badge`}
            isOpen={config[`${key}BadgeEnabled`]}
            onToggle={(v) => {
                config[`${key}BadgeEnabled`] = v;
            }}
        >
            <horizontalbox gap={4} valign={VerticalAlignment.Center}>
                <layout height={64} halign={HorizontalAlignment.Center}>
                    <image ref={badgePreviewRef} color={config[`${key}Badge`].color} url={config[`${key}Badge`].url === "" ? BLANK_IMG : config[`${key}Badge`].url} />
                </layout>
                {boxChild(
                    1,
                    <verticalbox gap={8}>
                        <horizontalbox gap={4}>
                            <layout width={96} halign={HorizontalAlignment.Right}>
                                URL:
                            </layout>
                            {boxChild(
                                1,
                                <input
                                    value={config[`${key}Badge`].url}
                                    onCommit={(el, p, v) => {
                                        config[`${key}Badge`].url = v;
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
                                    value={config[`${key}Badge`].color}
                                    onValidCommit={(el, p, v) => {
                                        config[`${key}Badge`].color = v;
                                        badgePreviewRef.current?.setTintColor(parseColor(v) ?? new Color(1, 1, 1, 1));
                                    }}
                                    pattern={COLOR_REGEX}
                                />
                            )}
                        </horizontalbox>
                    </verticalbox>
                )}
            </horizontalbox>
        </Accordian>
    );
};
