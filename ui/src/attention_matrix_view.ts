import {Weya as $} from '../lib/weya/weya'
import {Tokens} from "./controller";
import {TokenLabelView} from "./token_label_view";
import {createMatrix} from "./utils";
import {DimValue} from "./types";
import {PlotColors} from "./colors";
import {ChartType} from "./types";

class CellView {
    private elem: SVGRectElement;
    private selected: boolean;
    private titleElem: SVGTitleElement
    private plotColors: PlotColors

    constructor(plotColors: PlotColors) {
        this.plotColors = plotColors
    }

    render(row: number, col: number, cellSize: number) {
        this.elem = $('rect', '.cell', {
            x: col * cellSize,
            y: row * cellSize,
            width: cellSize,
            height: cellSize
        })
        this.titleElem = document.createElementNS("http://www.w3.org/2000/svg", "title")
        this.elem.appendChild(this.titleElem)

        return this.elem
    }

    setAttn(value: number) {
        if (this.selected) {
            this.elem.style.setProperty('fill', this.plotColors.getInterpolatedColor(value, ChartType.AttentionMatrix))
        } else {
            this.elem.style.setProperty('fill', this.plotColors.getInterpolatedSecondaryColor(value))
        }
        this.titleElem.textContent = value.toExponential()
    }

    setSelection(selected: boolean) {
        this.selected = selected;
    }
}

export class AttentionMatrixView {
    private attentions: number[][];
    private srcTokens: Tokens;
    private dstTokens: Tokens;
    private srcTokenElems: TokenLabelView[];
    private dstTokenElems: TokenLabelView[];
    handler: any;
    private cellSize: number;
    private topLabelsMargin: number;
    private leftLabelsMargin: number;
    private cells: CellView[][];
    private labelCellGap: number;
    private srcLabels: SVGElement[]
    private dstLabels: SVGElement[]

    constructor(srcTokens: Tokens, dstTokens: Tokens, plotColors: PlotColors) {
        this.srcTokens = srcTokens
        this.dstTokens = dstTokens

        this.attentions = createMatrix(srcTokens.length, dstTokens.length)

        this.srcTokenElems = []
        for (let i = 0; i < srcTokens.length; ++i) {
            let v = this.srcTokens.getTokenLabelView(i)
            v.addClickHandler('src', i, this.onItemSelect)
            this.srcTokenElems.push(v)
        }
        this.dstTokenElems = []
        for (let i = 0; i < dstTokens.length; ++i) {
            let v = this.dstTokens.getTokenLabelView(i)
            v.addClickHandler('dst', i, this.onItemSelect)
            this.dstTokenElems.push(v)
        }

        this.cells = []
        for (let i = 0; i < srcTokens.length; ++i) {
            this.cells.push([])
            for (let j = 0; j < dstTokens.length; ++j) {
                this.cells[i].push(new CellView(plotColors))
            }
        }

        this.cellSize = 20
        this.topLabelsMargin = 50
        this.leftLabelsMargin = 50
        this.labelCellGap = 5
    }

    onItemSelect = (type: string, idx: number, isMulti: boolean) => {
        this.handler(type, idx, isMulti)
    }


    render() {
        let grid: SVGGElement
        let svgAttrs = {
            width: this.cellSize * this.dstTokens.length + this.leftLabelsMargin,
            height: this.cellSize * this.srcTokens.length + this.leftLabelsMargin,
            viewBox: `0 0 ${this.cellSize * this.dstTokens.length + this.leftLabelsMargin} ${this.cellSize * this.srcTokens.length + this.leftLabelsMargin}`
        }
        let matrix = $('svg', '.matrix', svgAttrs, $ => {
            grid = $('g', '.grid',
                {transform: `translate(${this.leftLabelsMargin}, ${this.topLabelsMargin})`})

            this.srcLabels = []
            $('g', '.src_labels',
                {transform: `translate(${this.leftLabelsMargin - this.labelCellGap}, ${this.topLabelsMargin + this.cellSize / 2})`},
                $ => {
                    for (let i = 0; i < this.srcTokens.length; ++i) {
                        this.srcLabels.push($('g', '.label', {transform: `translate(0, ${this.cellSize * i})`}))
                    }
                })

            for (let i = 0; i < this.srcTokens.length; ++i) {
                this.srcLabels[i].appendChild(this.srcTokenElems[i].render(this.cellSize, false))
            }

            this.dstLabels = []
            $('g', '.dst_labels',
                {transform: `translate(${this.leftLabelsMargin + this.cellSize / 2}, ${this.topLabelsMargin - this.labelCellGap})`},
                $ => {
                    for (let i = 0; i < this.dstTokens.length; ++i) {
                        this.dstLabels.push($('g', '.label', {transform: `translate(${this.cellSize * i}, 0)`}))
                    }
                })

            for (let i = 0; i < this.dstTokens.length; ++i) {
                this.dstLabels[i].appendChild(this.dstTokenElems[i].render(this.cellSize, true))
            }
        })

        for (let i = 0; i < this.srcTokens.length; ++i) {
            for (let j = 0; j < this.dstTokens.length; ++j) {
                grid.appendChild(this.cells[i][j].render(i, j, this.cellSize))
            }
        }


        return matrix
    }

    setAttention(attn: number[][]) {
        for (let i = 0; i < this.srcTokens.length; ++i) {
            for (let j = 0; j < this.dstTokens.length; ++j) {
                this.cells[i][j].setAttn(attn[i][j])
            }
        }
    }

    setSelection(src: { [p: DimValue]: boolean },
                 dst: { [p: DimValue]: boolean }) {
        for (let i = 0; i < this.srcTokens.length; ++i) {
            for (let j = 0; j < this.dstTokens.length; ++j) {
                this.cells[i][j].setSelection(src[i] === true && dst[j] === true)
            }
        }

        for (let i = 0; i < this.srcTokens.length; i++) {
            this.srcLabels[i].style.setProperty('opacity', src[i] === true ? '1' : '0.6')
            this.srcLabels[i].style.setProperty('font-weight', src[i] === true ? 'bold' : 'normal')
        }

        for (let i = 0; i < this.dstTokens.length; i++) {
            this.dstLabels[i].style.setProperty('opacity', dst[i] === true ? '1' : '0.6')
            this.dstLabels[i].style.setProperty('font-weight', dst[i] === true ? 'bold' : 'normal')
        }
    }
}
