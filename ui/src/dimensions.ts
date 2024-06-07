import {Weya as $} from "../lib/weya/weya";
import {SelectCallback, DimValue} from "./types";
import {capitalizeFirstLetter} from "./utils";
import {PlotColors} from "./colors";
import {ChartType} from "./types";

class ValueView {
    private elem: HTMLDivElement;
    private value: string;
    private handler: SelectCallback
    private type: string;
    private idx: number | string;
    private selected: boolean;

    constructor(value: string) {
        this.value = value;
        this.selected = true
    }

    render() {
        this.elem = $('div', '.value', this.value)
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
            this.elem.style.setProperty('background', PlotColors.shared.getInterpolatedColor(value * 0.8, ChartType.DimensionHeatmap))
        } else {
            this.elem.style.setProperty('background', PlotColors.shared.getInterpolatedSecondaryColor(value * 0.8))
        }
        this.elem.style.setProperty('color', PlotColors.shared.getInterpolatedTextColor(value))

        this.elem.title = value.toExponential()
    }

    setSelection(selected: boolean) {
        this.selected = selected
    }
}

export class DimensionHeatmap {
    private values: string[];
    private valueViews: {[value: DimValue]: ValueView}
    private name: string;

    constructor(values: string[], name: string) {
        this.values = values;
        this.name = name;

        this.valueViews = {}
        for (let v of this.values) {
            let view = new ValueView(v)
            this.valueViews[v] = view
        }

    }

    addClickHandler(type: string, handler: SelectCallback) {
        for (let i = 0; i < this.values.length; ++i) {
            this.valueViews[this.values[i]].addClickHandler(type, i, handler)
        }
    }

    render() {
        let elem = $('div', '.dimension-values', $ => {
          $('div', '.dimension-name.title', `${capitalizeFirstLetter(this.name)}`)
        })
        for (let i = 0; i < this.values.length; ++i) {
            elem.appendChild(this.valueViews[this.values[i]].render())
        }

        return elem
    }

    setAttention(attn: { [value: DimValue]: number }) {
        for (let i = 0; i < this.values.length; ++i) {
            this.valueViews[this.values[i]].setAttn(attn[this.values[i]])
        }
    }

    setSelection( selected: { [p: DimValue]: boolean }) {
        for (let i = 0; i < this.values.length; ++i) {
            this.valueViews[this.values[i]].setSelection(selected[this.values[i]])
        }
    }
}