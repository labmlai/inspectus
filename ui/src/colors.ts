import * as d3 from "../lib/d3/d3"

export class PlotColors {
    public static shared = new PlotColors()
    private colorScheme: string

    private constructor() {
        this.colorScheme = 'Blues'
    }

    public setColorScheme(scheme: string) {
        switch (scheme.toLowerCase()) {
            case 'blue':
                scheme = 'blues'
                break
            case 'green':
                scheme = 'greens'
                break
            case 'grey':
                scheme = 'greys'
                break
            case 'orange':
                scheme = 'oranges'
                break
            case 'purple':
                scheme = 'purples'
                break
            case 'red':
                scheme = 'reds'
                break
        }

        this.colorScheme = scheme
    }

    public getInterpolatedSecondaryColor(value: number) {
        return d3.interpolateGreys(value)
    }

    public getInterpolatedColor(value: number) {
        switch (this.colorScheme.toLowerCase()) {
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