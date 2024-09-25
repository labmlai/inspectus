import {StringTokens} from "./controller";
import {Weya as $} from "../lib/weya/weya";
import {ChartType, DimValue, SelectCallback} from "./types";
import {PlotColors} from "./colors";
import {setAlpha} from "./utils";

class TokenView {
    private elem: HTMLDivElement;
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    render() {
        this.elem = $('div', '.token', this.token)

        return this.elem
    }

    setValue(value: number) {
      this.elem.style.setProperty('background',
        PlotColors.shared.getInterpolatedColor(value * 0.8, ChartType.TokenLoss))
      this.elem.style.setProperty('border-left',
          `3px solid ${
          setAlpha(PlotColors.shared.getInterpolatedColor(1 - value * 0.8, ChartType.TokenLoss), 0.5)}`)


      this.elem.style.setProperty('color', PlotColors.shared.getInterpolatedTextColor(value))

      this.elem.title = value.toExponential()
    }
}

export class StringTokenLoss {
    private tokens: string[];
    private tokenViews: TokenView[]

    constructor(tokens: string[]) {
        this.tokens = tokens;

        this.tokenViews = []
        for (let i = 0; i < this.tokens.length; ++i) {
            let view = new TokenView(this.tokens[i])
            this.tokenViews.push(view)
        }

    }

    render() {
        let elem = $('div', '.src-tokens.text-tokens', $ => {
            $('div.title', 'Token Loss')
        })
        for (let i = 0; i < this.tokens.length; ++i) {
            elem.appendChild(this.tokenViews[i].render())
        }

        return elem
    }

    setLosses(losses: number[]) {
        const minLoss = Math.min(...losses);
        const maxLoss = Math.max(...losses);
        const range = maxLoss - minLoss;

        for (let i = 0; i < losses.length; ++i) {
            losses[i] = (losses[i] - minLoss) / range;
        }
        
        for (let i = 0; i < this.tokens.length; ++i) {
            this.tokenViews[i].setValue(losses[i])
        }
    }
}