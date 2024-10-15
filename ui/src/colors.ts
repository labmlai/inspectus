import * as d3 from "../lib/d3/d3"
import {ChartType} from "./types"

export class PlotColors {
    private colorSchemes: Record<ChartType, string>
    private theme: string

    constructor(theme: string) {
        this.colorSchemes = {
            [ChartType.AttentionMatrix]: 'Blues',
            [ChartType.SrcTokenHeatmap]: 'Blues',
            [ChartType.DestTokenHeatmap]: 'Blues',
            [ChartType.TokenDimHeatmap]: 'Blues',
            [ChartType.DimensionHeatmap]: 'Blues',
            [ChartType.LineGrid]: 'Blues',
            [ChartType.TokenLoss]: 'Blues'
        }
        if (theme === 'auto') {
            this.theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
        } else {
            this.theme = theme
        }
    }

    public setColorScheme(scheme: Record<ChartType, string>) {
        for (let key in scheme) {
            let s = scheme[key]
            switch (s.toLowerCase()) {
                case 'blue':
                    s = 'blues'
                    break
                case 'green':
                    s = 'greens'
                    break
                case 'grey':
                    s = 'greys'
                    break
                case 'orange':
                    s = 'oranges'
                    break
                case 'purple':
                    s = 'purples'
                    break
                case 'red':
                    s = 'reds'
                    break
            }
            this.colorSchemes[key] = s
        }
    }

    public getBackgroundColor() {
        if (this.theme === 'light') {
            return d3.interpolateGreys(0)
        } else {
            return d3.interpolateGreys(1)
        }
    }

    public getFilledTextColor() {
        if (this.theme === 'light') {
            return d3.interpolateGreys(1)
        } else {
            return d3.interpolateGreys(0)
        }
    }

    public getInterpolatedSecondaryColor(value: number) {
        if (this.theme === 'light') {
            value = 1 - value
        }

        return d3.interpolateGreys(value)
    }

    public getInterpolatedColor(value: number, chart: string) {
        if (this.theme === 'dark') {
            value = 0.3 + (1 - value) * 0.7
        } else {
            value = value * 0.8
        }

        let color = this.colorSchemes[chart as ChartType]
        switch (color.toLowerCase()) {
            case 'blues':
                return d3.interpolateBlues(value)
            case 'greens':
                return d3.interpolateGreens(value)
            case 'greys':
                return d3.interpolateGreys(value)
            case 'oranges':
                return d3.interpolateOranges(value)
            case 'purples':
                return d3.interpolatePurples(value)
            case 'reds':
                return d3.interpolateReds(value)
            case 'bugn':
                return d3.interpolateBuGn(value)
            case 'bupu':
                return d3.interpolateBuPu(value)
            case 'gnbu':
                return d3.interpolateGnBu(value)
            case 'orrd':
                return d3.interpolateOrRd(value)
            case 'pubugn':
                return d3.interpolatePuBuGn(value)
            case 'pubu':
                return d3.interpolatePuBu(value)
            case 'purd':
                return d3.interpolatePuRd(value)
            case 'rdpu':
                return d3.interpolateRdPu(value)
            case 'ylgnbu':
                return d3.interpolateYlGnBu(value)
            case 'ylgn':
                return d3.interpolateYlGn(value)
            case 'ylorbr':
                return d3.interpolateYlOrBr(value)
            case 'ylorrd':
                return d3.interpolateYlOrRd(value)
            case 'cividis':
                return d3.interpolateCividis(value)
            case 'viridis':
                return d3.interpolateViridis(value)
            case 'inferno':
                return d3.interpolateInferno(value)
            case 'magma':
                return d3.interpolateMagma(value)
            case 'plasma':
                return d3.interpolatePlasma(value)
            case 'warm':
                return d3.interpolateWarm(value)
            case 'cool':
                return d3.interpolateCool(value)
            case 'cubehelixdefault':
                return d3.interpolateCubehelixDefault(value)
            case 'turbo':
                return d3.interpolateTurbo(value)
            case 'brbg':
                return d3.interpolateBrBG(value)
            case 'prgn':
                return d3.interpolatePRGn(value)
            case 'piyg':
                return d3.interpolatePiYG(value)
            case 'puor':
                return d3.interpolatePuOr(value)
            case 'rdbu':
                return d3.interpolateRdBu(value)
            case 'rdgy':
                return d3.interpolateRdGy(value)
            case 'rdylbu':
                return d3.interpolateRdYlBu(value)
            case 'rdylgn':
                return d3.interpolateRdYlGn(value)
            case 'spectral':
                return d3.interpolateSpectral(value)
            default:
                return d3.interpolateBlues(value)
        }
    }
}