import {Weya as $} from '../lib/weya/weya'
import {Tokens} from "./controller";
import {TokenLabelView} from "./token_label_view";
import {Dimensions, DimValue} from "./types";
import * as d3 from "../lib/d3/d3";

class CellView {
    private elem: SVGRectElement;
    private selected: boolean;

    constructor() {
    }

    render(row: number, col: number, cellSize: number) {
        this.elem = $('rect', '.cell', {
            x: col * cellSize,
            y: row * cellSize,
            width: cellSize,
            height: cellSize
        })

        return this.elem
    }

    setAttn(value: number) {
        if (this.selected) {
            this.elem.style.setProperty('fill', d3.interpolateBlues(value * 0.8))
        } else {
            this.elem.style.setProperty('fill', d3.interpolateGreys(value * 0.8))
        }
    }

    setSelection(selected: boolean) {
        this.selected = selected

    }
}

export class TokenDimHeatmapView {
    private tokens: Tokens;
    private tokenElems: TokenLabelView[];
    handler: any;
    private cellSize: number;
    private leftLabelsMargin: number;
    private cells: CellView[][]
    private labelCellGap: number;
    private dimensions: Dimensions
    selectedDimension: string;
    private dimSelectElem: HTMLSelectElement;
    private chartElem: SVGSVGElement;
    private elem: HTMLDivElement;
    private tokenDim: { [p: DimValue]: number }[];
    private selected: { [p: DimValue]: boolean };

    constructor(tokens: Tokens, dimensions: Dimensions, handler: any) {
        this.tokens = tokens
        this.dimensions = dimensions
        this.handler = handler;

        this.tokenElems = []
        for (let i = 0; i < tokens.length; ++i) {
            let v = this.tokens.getTokenLabelView(i)
            v.addClickHandler('src', i, this.onItemSelect)
            this.tokenElems.push(v)
        }

        this.cells = []
        for (let i = 0; i < tokens.length; ++i) {
            this.cells.push([])
        }

        this.cellSize = 20
        this.leftLabelsMargin = 50
        this.labelCellGap = 5

        for (let d in dimensions) {
            this.selectedDimension = d
        }
    }

    onItemSelect = (type: string, idx: number, isMulti: boolean) => {
        this.handler(type, idx, isMulti)
    }


    render() {
        this.elem = $('div', '.token-dim-heatmap',
            $ => {
                $('div', '.select-container', $ => {
                    $('label', 'Dimension', {for: 'token-dim-heatmap-select'})
                    this.dimSelectElem = $('select', '#token-dim-heatmap-select', {on: {change: this.onDimSelect}}, $ => {
                        for (let d in this.dimensions) {
                            $('option', d, {value: d})
                        }
                    })
                })
            })

        this.dimSelectElem.value = this.selectedDimension
        this.renderChart()

        return this.elem
    }

    onDimSelect = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()

        this.selectedDimension = this.dimSelectElem.value

        this.renderChart()
        this.tokenDim = this.handler(this.selectedDimension)
        this.renderAttention()
    }

    renderChart() {
        if (this.chartElem != null) {
            this.chartElem.remove()
            this.chartElem = null
        }

        let grid: SVGGElement
        let dim = this.dimensions[this.selectedDimension]
        let svgAttrs = {
            width: this.cellSize * dim.values.length + this.leftLabelsMargin,
            height: this.cellSize * this.tokens.length,
            viewBox: `0 0 ${this.cellSize * dim.values.length + this.leftLabelsMargin} ${this.cellSize * this.tokens.length} `
        }
        this.chartElem = $('svg', '.matrix', svgAttrs, $ => {
            grid = $('g', '.grid',
                {transform: `translate(${this.leftLabelsMargin}, 0)`})

            let labels = []
            $('g', '.token_labels',
                {transform: `translate(${this.leftLabelsMargin - this.labelCellGap}, ${this.cellSize / 2})`},
                $ => {
                    for (let i = 0; i < this.tokens.length; ++i) {
                        labels.push($('g', '.label', {transform: `translate(0, ${this.cellSize * i})`}))
                    }
                })

            for (let i = 0; i < this.tokens.length; ++i) {
                labels[i].appendChild(this.tokenElems[i].render(this.cellSize, false))
            }
        })

        this.cells = []
        for (let i = 0; i < this.tokens.length; ++i) {
            this.cells.push([])
            for (let j = 0; j < dim.values.length; ++j) {
                this.cells[i].push(new CellView())
                grid.appendChild(this.cells[i][j].render(i, j, this.cellSize))
            }
        }

        this.elem.appendChild(this.chartElem)
    }

    setAttention(tokenDim: { [value: DimValue]: number }[]) {
        this.tokenDim = tokenDim
        this.renderAttention()
    }

    setSelection(tokenSelect: { [p: DimValue]: boolean }) {
        this.selected = tokenSelect
        for (let i = 0; i < this.tokens.length; ++i) {
            for (let j = 0; j < this.cells[i].length; ++j) {
                this.cells[i][j].setSelection(tokenSelect[i] === true)
            }
        }
    }

    private renderAttention() {
        if (this.tokenDim == null) {
            return
        }
        let dim = this.dimensions[this.selectedDimension]
        for (let i = 0; i < this.tokens.length; ++i) {
            for (let j = 0; j < dim.values.length; ++j) {
                this.cells[i][j].setAttn(this.tokenDim[i][dim.values[j]])
            }
        }
    }
}
