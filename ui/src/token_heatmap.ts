import {StringTokens} from "./controller";
import {Weya as $} from "../lib/weya/weya";
import {SelectCallback, DimValue} from "./types";
import * as d3 from "../lib/d3/d3";

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

    set background(color: string) {
        this.elem.style.background = color
    }

    private onClick = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        this.handler(this.type, this.idx, e.shiftKey)
    }

    setAttn(value: number) {
        if(this.selected) {
            this.elem.style.setProperty('background', d3.interpolateBlues(value * 0.8))
        } else {
            this.elem.style.setProperty('background', d3.interpolateGreys(value * 0.8))
        }

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
            $('span', this.title)
            $('br')
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