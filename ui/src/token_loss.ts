import { Weya as $ } from "../lib/weya/weya"
import { ChartType, TokenData, TokenValue } from "./types"
import { PlotColors } from "./colors"

class TokenView {
    private elem: HTMLElement
    private token: string
    private values: TokenValue[]
    public isNewLine: boolean
    private colors: PlotColors
    private info: string
    private underLineElement: HTMLDivElement
    private selectCallback: (token: string, tokenData: TokenData) => void

    constructor(
        token: string,
        tokenData: TokenData,
        colors: PlotColors,
        selectCallback: (token: string, tokenData: TokenData) => void
    ) {
        this.isNewLine = /^[\n\r\v]+$/.test(token)
        this.token = token
        this.values = tokenData.values
        this.colors = colors
        this.info = tokenData.info
        this.selectCallback = selectCallback
    }

    render() {
        return $("div", ".hover-container", ($) => {
            this.elem = $(
                "pre",
                ".token" + (this.isNewLine ? ".new-line" : ""),
                this.token
                    .replace(/\n/g, "\\n")
                    .replace(/\r/g, "\\r")
                    .replace(/\v/g, "\\v")
            )
            this.elem.style.setProperty(
                "color",
                this.colors.getFilledTextColor()
            )
            this.elem.addEventListener("click", () => {
                this.selectCallback(this.token, {
                    values: this.values,
                    info: this.info,
                })
            })
            // this.menu = $("div", ".menu", ($) => {
            //     for (let i = 0; i < this.values.length; ++i) {
            //         $("div", ($) => {
            //             $(
            //                 "div",
            //                 `${this.values[i].name}: ${this.values[
            //                     i
            //                 ].value.toExponential()}`
            //             )
            //         })
            //     }
            //     $("hr")
            //     if (this.info != null) {
            //         $("pre", this.info)
            //     }
            // })
        })
    }

    setValue(name: string, selectedList: string[]) {
        if (this.underLineElement == null) {
            $(this.elem, ($) => {
                this.underLineElement = $("div", ".underline")
            })
        }

        this.elem.style.setProperty("background", "unset")
        this.underLineElement.innerHTML = ""

        for (let i = 0; i < this.values.length; ++i) {
            if (this.values[i].name === name) {
                this.elem.style.setProperty(
                    "background",
                    this.colors.getInterpolatedColor(
                        this.values[i].normalizedValue,
                        ChartType.TokenLoss,
                        i
                    )
                )
            }

            if (selectedList.includes(this.values[i].name)) {
                let lineElem = $("div", ".item", "")
                lineElem.style.setProperty(
                    "background",
                    this.colors.getInterpolatedColor(
                        this.values[i].normalizedValue,
                        ChartType.TokenLoss,
                        i
                    )
                )
                this.underLineElement.appendChild(lineElem)
            }
        }
    }
}

export class StringTokenLoss {
    private tokens: string[]
    private tokenViews: TokenView[]
    private selectElem: HTMLSelectElement
    private selectedMetric: string
    private secondarySelectedMetricList: string[]
    private tokenData: TokenData[]
    private paddingLess: boolean
    private colors: PlotColors

    private selectedToken: string
    private selectedTokenElem: HTMLSpanElement
    private selectedTokenData: TokenData
    private tokenInfoElem: HTMLPreElement
    private valueElements: Record<string, HTMLElement>
    private isScientific: boolean
    private scientificToggleElem: HTMLInputElement

    constructor(
        tokens: string[],
        tokenData: TokenData[],
        colors: PlotColors,
        paddingLess: boolean = true
    ) {
        this.tokens = tokens
        this.selectedMetric = tokenData[0].values[0].name
        this.tokenData = tokenData
        this.paddingLess = paddingLess
        this.colors = colors
        this.tokenViews = []
        this.secondarySelectedMetricList = []
        this.selectedToken = this.tokens[0]
        this.selectedTokenData = this.tokenData[0]
        this.isScientific = true
        this.valueElements = {}

        let secondaryLength = 0
        if (this.tokenData[0].values.length > 3) {
            secondaryLength = 2
        } else if (this.tokenData[0].values.length > 1) {
            secondaryLength = 1
        }

        for (let i = 0; i < secondaryLength; ++i) {
            this.secondarySelectedMetricList.push(
                this.tokenData[0].values[1 + i].name
            )
        }
        for (let i = 0; i < this.tokens.length; ++i) {
            let view = new TokenView(
                this.tokens[i],
                this.tokenData[i],
                colors,
                this.onTokenClick
            )
            this.tokenViews.push(view)
        }
    }

    onSelectChange = () => {
        this.selectedMetric = this.selectElem.value
        for (let i = 0; i < this.tokens.length; ++i) {
            this.tokenViews[i].setValue(
                this.selectedMetric,
                this.secondarySelectedMetricList
            )
        }
    }

    private onTokenClick = (token: string, tokenData: TokenData) => {
        this.selectedToken = token
        this.selectedTokenData = tokenData
        this.selectedTokenElem.textContent = this.selectedToken.replace(
            /\n/g,
            "\\n"
        )
        this.tokenInfoElem.textContent = tokenData.info

        let value_strings = []
        for (let i = 0; i < tokenData.values.length; ++i) {
            value_strings.push(
                this.isScientific
                    ? tokenData.values[i].value.toExponential(6)
                    : tokenData.values[i].value.toString()
            )
        }

        const maxLength = Math.max(
            ...value_strings.map((str) => str.split(".")[0].length)
        )
        const maxExponent = Math.max(
            ...value_strings.map((str) => str.split("e")[1]?.length - 1 ?? 0)
        )
        const maxDecimals = Math.min(
            Math.max(
                ...value_strings.map((str) => str.split(".")[1]?.length ?? 0)
            ),
            6
        )
        value_strings = value_strings.map((str) => {
            let [intPart, decPart] = str.split(".")

            let text =
                intPart.padStart(maxLength, " ") +
                (decPart ? "." + decPart : "")

            if (text.includes("e")) {
                const [base, exponent] = text.split("e")
                const sign = exponent[0]
                const expValue = exponent.slice(1).padStart(maxExponent, "0")
                text = `${base}e${sign}${expValue}`
            } else {
                if (decPart) {
                    decPart = decPart.substring(0, maxDecimals)
                    text = `${intPart}.${decPart.padEnd(maxDecimals, "0")}`
                }
            }

            return text
        })

        for (let i = 0; i < value_strings.length; ++i) {
            this.valueElements[tokenData.values[i].name].textContent =
                value_strings[i]
        }
    }

    render() {
        let elem = $(
            "div",
            ".src-tokens.text-tokens.token-value-container" +
                (this.paddingLess ? ".padding-less" : ""),
            ($) => {
                $("div", ".token-loss-header", ($) => {
                    $("div.spaced-row", ($) => {
                        $("span", ($) => {
                            $("span.caption", "Token Background: ")
                            this.selectElem = $("select", ($) => {})
                        })

                        $("label", ($) => {
                            this.scientificToggleElem = $("input")
                            this.scientificToggleElem.setAttribute(
                                "type",
                                "checkbox"
                            )
                            this.scientificToggleElem.setAttribute(
                                "checked",
                                this.isScientific.toString()
                            )
                            this.scientificToggleElem.addEventListener(
                                "change",
                                () => {
                                    this.isScientific =
                                        this.scientificToggleElem.checked
                                    this.onTokenClick(
                                        this.selectedToken,
                                        this.selectedTokenData
                                    )
                                }
                            )
                            $("span", "Use Scientific Notation")
                        })
                    })

                    $("div.spaced-row", ($) => {
                        $("span.legend-item", ($) => {
                            $("span.caption", "Token: ")
                            this.selectedTokenElem = $(
                                "span.selected-token",
                                this.selectedToken
                            ) as HTMLSpanElement
                        })

                        $("span.caption", "")
                    })

                    $("div.spaced-row", ($) => {
                        $("div.legend", ($) => {
                            for (
                                let i = 0;
                                i < this.tokenData[0].values.length;
                                ++i
                            ) {
                                let colorElem
                                let row = $("span.legend-item", ($) => {
                                    colorElem = $("div.color")
                                    $("span", this.tokenData[0].values[i].name)
                                })

                                if (
                                    this.secondarySelectedMetricList.includes(
                                        this.tokenData[0].values[i].name
                                    )
                                ) {
                                    colorElem.style.setProperty(
                                        "background",
                                        this.colors.getInterpolatedColor(
                                            1.0,
                                            ChartType.TokenLoss,
                                            i
                                        )
                                    )
                                }
                                colorElem.style.setProperty(
                                    "border",
                                    "2px solid " +
                                        this.colors.getInterpolatedColor(
                                            1.0,
                                            ChartType.TokenLoss,
                                            i
                                        )
                                )

                                let tokenValueElem = $("span.token-value", "")
                                this.valueElements[
                                    this.tokenData[0].values[i].name
                                ] = tokenValueElem as HTMLElement

                                row.addEventListener("click", () => {
                                    if (
                                        this.secondarySelectedMetricList.includes(
                                            this.tokenData[0].values[i].name
                                        )
                                    ) {
                                        this.secondarySelectedMetricList =
                                            this.secondarySelectedMetricList.filter(
                                                (metric) =>
                                                    metric !==
                                                    this.tokenData[0].values[i]
                                                        .name
                                            )
                                        colorElem.style.setProperty(
                                            "background",
                                            "unset"
                                        )
                                        row.style.setProperty("opacity", "0.5")
                                    } else {
                                        this.secondarySelectedMetricList.push(
                                            this.tokenData[0].values[i].name
                                        )
                                        colorElem.style.setProperty(
                                            "background",
                                            this.colors.getInterpolatedColor(
                                                1.0,
                                                ChartType.TokenLoss,
                                                i
                                            )
                                        )
                                        row.style.setProperty("opacity", "1.0")
                                    }

                                    this.onSelectChange()
                                })
                            }
                        })

                        this.tokenInfoElem = $(
                            "pre",
                            ".token-info",
                            this.selectedTokenData.info
                        )
                    })
                })
            }
        )
        for (let i = 0; i < this.tokens.length; ++i) {
            elem.appendChild(this.tokenViews[i].render())
            if (this.tokenViews[i].isNewLine) {
                elem.appendChild($("br"))
            }
        }

        this.selectElem.appendChild($("option", "None"))
        for (let i = 0; i < this.tokenData[0].values.length; ++i) {
            this.selectElem.appendChild(
                $("option", this.tokenData[0].values[i].name)
            )
        }

        this.selectElem.value = this.selectedMetric

        this.onSelectChange()
        this.onTokenClick(this.selectedToken, this.selectedTokenData)

        this.selectElem.addEventListener("change", this.onSelectChange)

        return elem
    }
}
