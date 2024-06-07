import {StringTokens} from "./controller";
import {Weya as $} from "../lib/weya/weya";
import {ChartType, DimValue, SelectCallback} from "./types";
import {PlotColors} from "./colors";
import {setAlpha} from "./utils";

class TokenView {
    private elem: HTMLDivElement;
    private token: string;
    private handler: SelectCallback
    private type: string;
    private idx: number | string;
    private selected: boolean;

    constructor(token: string) {
        this.token = token;
        this.selected = true
    }

    render() {
        this.elem = $('div', '.token', this.token)
        this.elem.addEventListener('click', this.onClick)

        return this.elem
    }

    addClickHandler(type: string, idx: number | string, handler: SelectCallback) {
        this.handler = handler
        this.type = type
        this.idx = idx
    }

    private onClick = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        this.handler(this.type, this.idx, e.shiftKey)
    }

    setAttn(value: number) {
        if(this.selected) {
            this.elem.style.setProperty('background',
                PlotColors.shared.getInterpolatedColor(value * 0.8,
                    this.type == 'src' ? ChartType.SrcTokenHeatmap : ChartType.DestTokenHeatmap))
            this.elem.style.setProperty('border-left',
                `3px solid ${
                setAlpha(PlotColors.shared.getInterpolatedColor(1 - value * 0.8, 
                    this.type == 'src' ? ChartType.SrcTokenHeatmap : ChartType.DestTokenHeatmap), 0.5)}`)
        } else {
            this.elem.style.setProperty('background',
                PlotColors.shared.getInterpolatedSecondaryColor(value * 0.8))
            this.elem.style.setProperty('border-left',
                `3px solid ${
                setAlpha(PlotColors.shared.getInterpolatedSecondaryColor( 1 - value * 0.8), 0.5)}`)
        }


        this.elem.style.setProperty('color', PlotColors.shared.getInterpolatedTextColor(value))

        this.elem.title = value.toExponential()
    }

    setSelection(selected: boolean) {
        this.selected = selected
    }
}

export class StringTokenHeatmap {
    private tokens: StringTokens;
    private tokenViews: TokenView[]
    private title: string

    constructor(tokens: StringTokens, title: string) {
        this.tokens = tokens;
        this.title = title

        this.tokenViews = []
        for (let i = 0; i < this.tokens.length; ++i) {
            let view = new TokenView(this.tokens.tokens[i])
            this.tokenViews.push(view)
        }

    }

    addClickHandler(type: string, handler: SelectCallback) {
        for (let i = 0; i < this.tokens.length; ++i) {
            this.tokenViews[i].addClickHandler(type, i, handler)
        }
    }

    render() {
        let elem = $('div', '.src-tokens.text-tokens', $ => {
            $('div.title', this.title)
        })
        for (let i = 0; i < this.tokens.length; ++i) {
            elem.appendChild(this.tokenViews[i].render())
        }

        return elem
    }

    setAttention(attn: number[]) {
        for (let i = 0; i < this.tokens.length; ++i) {
            this.tokenViews[i].setAttn(attn[i])
        }
    }

    setSelection(selected: { [p: DimValue]: boolean }) {
        for (let i = 0; i < this.tokens.length; ++i) {
            this.tokenViews[i].setSelection(selected[i] === true)
        }
    }
}