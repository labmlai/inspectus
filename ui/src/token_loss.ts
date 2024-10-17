import { Weya as $ } from "../lib/weya/weya"
import { ChartType, TokenData, TokenValue } from "./types"
import { PlotColors } from "./colors"

class TokenView {
    private elem: HTMLElement
    private menu: HTMLDivElement
    private token: string
    private values: TokenValue[]
    public isNewLine: boolean
    private colors: PlotColors
    private info: string
    private underLineElement: HTMLDivElement

    constructor(token: string, tokenData: TokenData, colors: PlotColors) {
        this.isNewLine = /^[\n\r\v]+$/.test(token)
        this.token = token
        this.values = tokenData.values
        this.colors = colors
        this.info = tokenData.info
    }

    updateMenuPosition() {
        const rect = this.elem.getBoundingClientRect()
        const midPoint = window.innerWidth / 2
        if (rect.left > midPoint) {
            this.menu.classList.add("right-align")
        }
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
            this.menu = $("div", ".menu", ($) => {
                for (let i = 0; i < this.values.length; ++i) {
                    $("div", ($) => {
                        $(
                            "div",
                            `${this.values[i].name}: ${this.values[
                                i
                            ].value.toExponential()}`
                        )
                    })
                }
                $("hr")
                if (this.info != null) {
                    $("pre", this.info)
                }
            })
        })
    }

    setValue(name: string) {
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
            } else {
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
    private tokenData: TokenData[]
    private paddingLess: boolean
    private colors: PlotColors

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
        for (let i = 0; i < this.tokens.length; ++i) {
            let view = new TokenView(this.tokens[i], this.tokenData[i], colors)
            this.tokenViews.push(view)
        }
    }

    onSelectChange = () => {
        this.selectedMetric = this.selectElem.value
        for (let i = 0; i < this.tokens.length; ++i) {
            this.tokenViews[i].setValue(this.selectedMetric)
        }
    }

    updateMenuPosition() {
        for (let i = 0; i < this.tokens.length; ++i) {
            this.tokenViews[i].updateMenuPosition()
        }
    }

    render() {
        let elem = $(
            "div",
            ".src-tokens.text-tokens.token-value-container" +
                (this.paddingLess ? ".padding-less" : ""),
            ($) => {
                $("div.title", "Token Visualization")
                $("div.title", ($) => {
                    this.selectElem = $("select", ($) => {})
                })

                $("div.legend", ($) => {
                    for (let i = 0; i < this.tokenData[0].values.length; ++i) {
                        $("div.row", ($) => {
                            let colorElem = $("div.color")
                            colorElem.style.setProperty(
                                "background",
                                this.colors.getInterpolatedColor(
                                    1.0,
                                    ChartType.TokenLoss,
                                    i
                                )
                            )
                            $("span", this.tokenData[0].values[i].name)
                        })
                    }
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

        this.selectElem.addEventListener("change", this.onSelectChange)

        return elem
    }
}
