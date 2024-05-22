import {Weya as $} from '../lib/weya/weya'
import {Tokens} from "./controller";
import {Dimension, Dimensions, DimValue, GridAttention, SelectCallback} from "./types";
import {getDimValues} from "./utils";

class LineView {
    elem: SVGLineElement;
    private selectedCell: boolean;
    selected: boolean;

    constructor() {
        this.selected = true
        this.selectedCell = true
    }

    render(r1: number, r2: number, width: number) {
        this.elem = $('line', '.line', {
            x1: 0,
            y1: r1,
            x2: width,
            y2: r2
        })

        return this.elem
    }

    setAttn(value: number) {
        if (this.selected && this.selectedCell) {
            this.elem.style.setProperty('stroke', `rgba(8, 50, 128, ${value})`)
        } else {
            this.elem.style.setProperty('stroke', `rgba(128, 128, 128, ${value})`)
        }
    }

    setSelectedCell(selected: boolean) {
        this.selectedCell = selected
    }

    setSelected(selected: boolean) {
        this.selected = selected;
    }
}

class LineCellView {
    private elem: SVGGElement;
    private height: number;
    private width: number;
    private nSrc: number;
    private nDst: number;
    private lines: LineView[][];
    private bgLines: SVGGElement;
    private fgLines: SVGGElement;
    private handler: SelectCallback;
    private dims: any[];

    constructor(nSrc: number, nDst: number, height: number, width: number) {
        this.height = height;
        this.width = width;
        this.nSrc = nSrc
        this.nDst = nDst
    }

    render() {
        this.elem = $('g', '.lines', {on: {'click': this.onClick}}, $ => {
            this.bgLines = $('g')
            this.fgLines = $('g')
        })

        this.lines = []
        for (let i = 0; i < this.nSrc; ++i) {
            this.lines.push([])
            for (let j = 0; j < this.nDst; ++j) {
                this.lines[i].push(new LineView())
                this.fgLines.appendChild(this.lines[i][j].render(
                    i / this.nSrc * this.height,
                    j / this.nDst * this.height,
                    this.width))
            }
        }
        return this.elem
    }

    addClickHandler(dim1: string, dv1: DimValue, dim2: string, dv2: DimValue, handler: SelectCallback) {
        this.handler = handler
        this.dims = []
        if (dim1 !== 'null') {
            this.dims.push({d: dim1, v: dv1})
        }
        if (dim2 !== 'null') {
            this.dims.push({d: dim2, v: dv2})
        }
    }

    onClick = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        console.log('click', this.dims)
        for (let d of this.dims) {
            this.handler(d.d, d.v, false)
        }
    }

    setAttn(attn: number[][]) {
        for (let i = 0; i < this.nSrc; ++i) {
            for (let j = 0; j < this.nDst; ++j) {
                this.lines[i][j].setAttn(attn[i][j])
            }
        }
    }

    setSelection(selected: boolean) {
        for (let i = 0; i < this.nSrc; ++i) {
            for (let j = 0; j < this.nDst; ++j) {
                this.lines[i][j].setSelectedCell(selected)
            }
        }
    }

    setSrcDstSelections(src: { [p: DimValue]: boolean }, dst: { [p: DimValue]: boolean }) {
        for (let i = 0; i < this.nSrc; ++i) {
            for (let j = 0; j < this.nDst; ++j) {
                let selected = src[i] === true && dst[j] === true
                if (this.lines[i][j].selected === selected) {
                    continue
                }
                this.lines[i][j].elem.remove()
                if (selected) {
                    this.fgLines.appendChild(this.lines[i][j].elem)
                } else {
                    this.bgLines.appendChild(this.lines[i][j].elem)
                }

                this.lines[i][j].setSelected(selected)
            }
        }
    }
}

export class LineGridView {
    private attentions: GridAttention;
    private srcTokens: Tokens;
    private dstTokens: Tokens;
    private dimensions: { [name: string]: Dimension }
    private elem: HTMLDivElement;
    private dimSelectElem1: HTMLSelectElement;
    private dimSelectElem2: HTMLSelectElement;
    dim1: string;
    dim2: string;
    private chartElem: SVGSVGElement;
    private dimChangeHandler: any;
    private selectHanlder: SelectCallback
    private selected: { [p: string]: { [p: DimValue]: boolean } };
    private cells: LineCellView[][]
    private cellWidth: number;
    private cellMargin: number;
    private cellLayers: SVGGElement[][];
    private cellHeight: number;

    constructor(srcTokens: Tokens, dstTokens: Tokens, dimensions: Dimensions, handler: any) {
        this.srcTokens = srcTokens
        this.dstTokens = dstTokens
        this.dimChangeHandler = handler;

        this.dimensions = dimensions

        this.dim1 = 'null'
        this.dim2 = 'null'

        this.cellWidth = 80
        this.cellHeight = 100
        this.cellMargin = 10
    }

    addClickHandler(handler: SelectCallback) {
        this.selectHanlder = handler
    }

    render() {
        this.elem = $('div', '.line-grid',
            $ => {
                $('div', '.select-container', $ => {
                    $('label', 'Y Dimension', {for: 'line-grid-dim2-select'},)
                    this.dimSelectElem1 = $('select', '#line-grid-dim2-select', {on: {change: this.onDim1Select}}, $ => {
                        for (let d in this.dimensions) {
                            $('option', d, {value: d})
                        }
                        $('option', 'None', {value: 'null'})
                    })
                })
                $('div', '.select-container', $ => {
                    $('label', 'X Dimension', {for: 'line-grid-dim1-select'})
                    this.dimSelectElem2 = $('select', '#line-grid-dim1-select', {on: {change: this.onDim2Select}}, $ => {
                        for (let d in this.dimensions) {
                            $('option', d, {value: d})
                        }
                        $('option', 'None', {value: 'null'})
                    })
                })
            })

        this.dimSelectElem1.value = this.dim1
        this.dimSelectElem2.value = this.dim2

        this.renderChart()

        return this.elem
    }

    onDim1Select = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()

        this.dim1 = this.dimSelectElem1.value

        this.renderChart()
        this.attentions = this.dimChangeHandler(this.dim1, this.dim2)
        this.renderSelection()
        this.renderAttention()
    }


    onDim2Select = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()

        this.dim2 = this.dimSelectElem2.value

        this.renderChart()
        this.attentions = this.dimChangeHandler(this.dim1, this.dim2)
        this.renderSelection()
        this.renderAttention()
    }

    renderChart() {
        if (this.chartElem != null) {
            this.chartElem.remove()
            this.chartElem = null
        }

        let dv1 = getDimValues(this.dim1, this.dimensions)
        let dv2 = getDimValues(this.dim2, this.dimensions)

        let svgAttrs = {
            width: this.cellWidth * dv2.length + this.cellMargin * (dv2.length - 1),
            height: this.cellHeight * dv1.length + this.cellMargin * (dv1.length - 1),
        }

        this.cellLayers = []

        this.chartElem = $('svg', '.matrix', svgAttrs, $ => {
            for (let i = 0; i < dv1.length; ++i) {
                this.cellLayers.push([])
                $('g', {transform: `translate(0, ${i * (this.cellHeight + this.cellMargin)})`}, $ => {
                    for (let j = 0; j < dv2.length; ++j) {
                        this.cellLayers[i].push($('g', {transform: `translate(${j * (this.cellWidth + this.cellMargin)}, 0)`}))
                    }
                })
            }
        })

        this.elem.appendChild(this.chartElem)

        this.cells = []
        for (let i = 0; i < dv1.length; ++i) {
            this.cells.push([])
            for (let j = 0; j < dv2.length; ++j) {
                this.cells[i].push(new LineCellView(
                    this.srcTokens.length,
                    this.dstTokens.length,
                    this.cellHeight, this.cellWidth))
                this.cellLayers[i][j].appendChild(this.cells[i][j].render())
                this.cells[i][j].addClickHandler(this.dim1, dv1[i], this.dim2, dv2[j], this.selectHanlder)
            }
        }

    }

    renderAttention() {
        let dv1 = getDimValues(this.dim1, this.dimensions)
        let dv2 = getDimValues(this.dim2, this.dimensions)
        for (let i = 0; i < dv1.length; ++i) {
            for (let j = 0; j < dv2.length; ++j) {
                this.cells[i][j].setAttn(this.attentions[dv1[i]][dv2[j]])
            }
        }
    }

    setAttention(attn: GridAttention) {
        this.attentions = attn

        this.renderAttention()
    }

    setSelection(selected: { [name: string]: { [idx: DimValue]: boolean } }) {
        this.selected = selected

        this.renderSelection()
    }

    private renderSelection() {
        let selected = this.selected
        let dv1 = getDimValues(this.dim1, this.dimensions)
        let dv2 = getDimValues(this.dim2, this.dimensions)
        for (let i = 0; i < dv1.length; ++i) {
            for (let j = 0; j < dv2.length; ++j) {
                let s = true
                if (selected[this.dim1] != null) {
                    if (selected[this.dim1][dv1[i]] !== true) {
                        s = false
                    }
                }
                if (selected[this.dim2] != null) {
                    if (selected[this.dim2][dv2[j]] !== true) {
                        s = false
                    }
                }
                this.cells[i][j].setSelection(s)
                this.cells[i][j].setSrcDstSelections(selected['src'], selected['dst'])
            }
        }

    }
}
