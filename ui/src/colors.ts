import * as d3 from "../lib/d3/d3"
import { ChartType } from "./types"

export class PlotColors {
    private colorSchemes: Record<ChartType, string[]>
    private theme: string

    constructor(theme: string) {
        this.colorSchemes = {
            [ChartType.AttentionMatrix]: ["blue"],
            [ChartType.SrcTokenHeatmap]: ["blue"],
            [ChartType.DestTokenHeatmap]: ["blue"],
            [ChartType.TokenDimHeatmap]: ["blue"],
            [ChartType.DimensionHeatmap]: ["blue"],
            [ChartType.LineGrid]: ["blue"],
            [ChartType.TokenLoss]: ["blue"],
        }
        if (theme === "auto") {
            this.theme = window.matchMedia("(prefers-color-scheme: light)")
                .matches
                ? "light"
                : "dark"
        } else {
            this.theme = theme
        }
    }

    public setColorScheme(scheme: Record<ChartType, string | string[]>) {
        for (let key in scheme) {
            let s = scheme[key]
            if (Array.isArray(s)) {
                this.colorSchemes[key] = s
            } else {
                this.colorSchemes[key] = [s]
            }
        }
    }

    public getBackgroundColor() {
        if (this.theme === "light") {
            return d3.interpolateGreys(0)
        } else {
            return d3.interpolateGreys(1)
        }
    }

    public getFilledTextColor() {
        if (this.theme === "light") {
            return d3.interpolateGreys(1)
        } else {
            return d3.interpolateGreys(0)
        }
    }

    public getInterpolatedSecondaryColor(value: number) {
        if (this.theme === "light") {
            value = 1 - value
        }

        return d3.interpolateGreys(value)
    }

    public getInterpolatedColor(
        value: number,
        chart: string,
        index: number = 0
    ) {
        let col1: string
        let col2: string
        if (this.theme === "dark") {
            col1 = "black"
        } else {
            col1 = "white"
        }
        col2 =
            this.colorSchemes[chart as ChartType][
                index % this.colorSchemes[chart as ChartType].length
            ].toLowerCase()
        value = value * 0.8

        return d3.interpolateRgb(col1, col2)(value)
    }
}
