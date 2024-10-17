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

    setSecondaryValue(name: string) {
        let value = this.values.find((v) => v.name === name)
        if (value == null) {
            this.elem.style.setProperty("border-bottom", "unset")
            this.elem.style.setProperty("border-bottom-width", "unset")
            this.elem.style.setProperty("border-bottom-style", "unset")
            return
        }
        let normalizedValue = value.normalizedValue

        this.elem.style.setProperty(
            "border-bottom",
            this.colors.getInterpolatedColor(
                normalizedValue,
                ChartType.TokenLoss,
                1
            )
        )
        this.elem.style.setProperty("border-bottom-width", "6px")
        this.elem.style.setProperty("border-bottom-style", "solid")
    }

    setValue(name: string) {
        let value = this.values.find((v) => v.name === name)
        if (value == null) {
            this.elem.style.setProperty("background", "unset")
            return
        }
        let normalizedValue = value.normalizedValue

        this.elem.style.setProperty(
            "background",
            this.colors.getInterpolatedColor(
                normalizedValue,
                ChartType.TokenLoss
            )
        )
    }
}

export class StringTokenLoss {
    private tokens: string[]
    private tokenViews: TokenView[]
    private selectElem: HTMLSelectElement
    private secondarySelectElem: HTMLSelectElement
    private selectedMetric: string
    private secondarySelectedMetric: string
    private tokenData: TokenData[]
    private paddingLess: boolean

    constructor(
        tokens: string[],
        tokenData: TokenData[],
        colors: PlotColors,
        paddingLess: boolean = true
    ) {
        this.tokens = tokens
        this.selectedMetric = tokenData[0].values[0].name
        this.secondarySelectedMetric = "None"
        this.tokenData = tokenData
        this.paddingLess = paddingLess

        this.tokenViews = []
        for (let i = 0; i < this.tokens.length; ++i) {
            let view = new TokenView(this.tokens[i], this.tokenData[i], colors)
            this.tokenViews.push(view)
        }
    }

    onSelectChange = () => {
        this.selectedMetric = this.selectElem.value
        this.secondarySelectedMetric = this.secondarySelectElem.value
        for (let i = 0; i < this.tokens.length; ++i) {
            this.tokenViews[i].setValue(this.selectedMetric)
            this.tokenViews[i].setSecondaryValue(this.secondarySelectedMetric)
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
                    this.secondarySelectElem = $("select", ($) => {})
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
        this.secondarySelectElem.appendChild($("option", "None"))
        for (let i = 0; i < this.tokenData[0].values.length; ++i) {
            this.selectElem.appendChild(
                $("option", this.tokenData[0].values[i].name)
            )
            this.secondarySelectElem.appendChild(
                $("option", this.tokenData[0].values[i].name)
            )
        }

        this.selectElem.value = this.selectedMetric
        this.secondarySelectElem.value = this.secondarySelectedMetric
        this.onSelectChange()

        this.selectElem.addEventListener("change", this.onSelectChange)
        this.secondarySelectElem.addEventListener("change", this.onSelectChange)

        return elem
    }
}
