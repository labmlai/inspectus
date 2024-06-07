import {StringTokenLabelView, TokenLabelView} from './token_label_view'
import {Weya as $} from "../lib/weya/weya";
import {AttentionMatrixView} from "./attention_matrix_view";
import {StringTokenHeatmap} from "./token_heatmap";
import {
    createMatrix,
    getDimValues,
    maxNormalizeArray,
    maxNormalizeArrayMap,
    maxNormalizeMap,
    normalizeArray
} from "./utils";
import {AttentionMatrix, ChartType, Dimension, Dimensions, DimValue, GridAttention} from "./types";
import {DimensionHeatmap} from "./dimensions";
import {TokenDimHeatmapView} from "./token_dim_heatmap";
import {LineGridView} from "./line_grid";


interface StringTokensModel {
    tokens: string[]
}


export abstract class Tokens {
    abstract getTokenLabelView(idx: number): TokenLabelView

    abstract get length()
}


export class StringTokens extends Tokens {
    tokens: string[]

    constructor(tokens: StringTokensModel) {
        super();

        this.tokens = tokens.tokens
    }

    getTokenLabelView(idx: number): TokenLabelView {
        return new StringTokenLabelView(this.tokens[idx])
    }

    get length() {
        return this.tokens.length
    }
}

export class Controller {
    private attentions: AttentionMatrix[];
    private srcTokens: StringTokens;
    private dstTokens: StringTokens;
    private dimensions: Dimension[];
    private dimensionsMap: Dimensions;
    private attentionMatrixView: AttentionMatrixView;
    private srcTokenHeatmap: StringTokenHeatmap;
    private dstTokenHeatmap: StringTokenHeatmap;
    private selected: { [name: string]: { [idx: DimValue]: boolean } };
    private dimensionHeatmaps: DimensionHeatmap[];
    private tokenDimHeatmap: TokenDimHeatmapView;
    private lineGridView: LineGridView;
    private readonly chartTypes: ChartType[]

    constructor(dimensions: Dimension[], attentions: AttentionMatrix[],
                srcTokens: StringTokensModel, dstTokens: StringTokensModel, chartTypes: ChartType[] = [ChartType.AttentionMatrix]) {
        this.attentions = attentions
        this.srcTokens = new StringTokens(srcTokens)
        this.dstTokens = new StringTokens(dstTokens)
        this.chartTypes = chartTypes
        this.dimensions = dimensions
        this.dimensionsMap = {}
        for (let d of this.dimensions) {
            this.dimensionsMap[d.name] = d
        }
        this.attentionMatrixView = new AttentionMatrixView(this.srcTokens, this.dstTokens)

        this.srcTokenHeatmap = new StringTokenHeatmap(this.srcTokens, "Query Tokens")
        this.dstTokenHeatmap = new StringTokenHeatmap(this.dstTokens, "Key Tokens")

        this.srcTokenHeatmap.addClickHandler('src', this.onSelected)
        this.dstTokenHeatmap.addClickHandler('dst', this.onSelected)

        this.selected = {}
        for (let dim of dimensions) {
            let dimValues = {}
            for (let attn of attentions) {
                if (dimValues[attn.info[dim.name]] !== true) {
                    dimValues[attn.info[dim.name]] = true
                }
            }

            this.selected[dim.name] = {}
            dim.values = []
            for (let dv in dimValues) {
                this.selected[dim.name][dv] = true
                dim.values.push(dv)
            }
        }

        this.selected['src'] = {}
        for (let i = 0; i < this.srcTokens.length; ++i) {
            this.selected['src'][i] = true
        }

        this.selected['dst'] = {}
        for (let i = 0; i < this.dstTokens.length; ++i) {
            this.selected['dst'][i] = true
        }

        this.dimensionHeatmaps = []
        for (let dim of dimensions) {
            let values = []
            for (let v in this.selected[dim.name]) {
                values.push(v)
            }
            let heatmap = new DimensionHeatmap(values, dim.name)

            heatmap.addClickHandler(dim.name, this.onSelected)
            this.dimensionHeatmaps.push(heatmap)
        }

        this.tokenDimHeatmap = new TokenDimHeatmapView(this.dstTokens, this.dimensionsMap,
            this.onTokenHeatmapDimChange)
        this.lineGridView = new LineGridView(this.srcTokens, this.dstTokens, this.dimensionsMap,
            this.onLineGridDimChange)

        this.lineGridView.addClickHandler(this.onSelected)
    }

    private calcAttnMatrix(): number[][] {
        let matrix = createMatrix(this.srcTokens.length, this.dstTokens.length)

        for (let attn of this.attentions) {
            let isSelected = true
            for (let dim in attn.info) {
                if (this.selected[dim][attn.info[dim]] !== true) {
                    isSelected = false
                    break
                }
            }

            if (!isSelected) {
                continue
            }

            for (let i = 0; i < this.srcTokens.length; ++i) {
                for (let j = 0; j < this.dstTokens.length; ++j) {
                    matrix[i][j] += attn.values[i][j]
                }
            }
        }

        // // Filter tokens
        // for (let i = 0; i < this.srcTokens.length; ++i) {
        //     for (let j = 0; j < this.dstTokens.length; ++j) {
        //         if (!this.selected['src'][i] || !this.selected['dst'][j]) {
        //             matrix[i][j] = 0.
        //         }
        //     }
        // }


        // Normalize
        for (let i = 0; i < this.srcTokens.length; ++i) {
            normalizeArray(matrix[i])
        }

        return matrix
    }

    private calcDstAttn(matrix: number[][]): number[] {
        let dstAttn = []
        for (let j = 0; j < this.dstTokens.length; ++j) {
            let val = 0.
            for (let i = 0; i < this.srcTokens.length; ++i) {
                if (this.selected['src'][i] === true) {
                    val += matrix[i][j]
                }
            }
            dstAttn.push(val)
        }
        maxNormalizeArray(dstAttn)

        return dstAttn
    }

    private calcSrcAttn(matrix: number[][]): number[] {
        let srcAttn = []
        for (let i = 0; i < this.srcTokens.length; ++i) {
            let val = 0.
            for (let j = 0; j < this.dstTokens.length; ++j) {
                if (this.selected['dst'][j] === true) {
                    val += matrix[i][j]
                }
            }
            srcAttn.push(val)
        }
        maxNormalizeArray(srcAttn)

        return srcAttn
    }

    private calcDimsAttention(): { [type: string]: { [value: DimValue]: number } } {
        let dims = {}
        for (let dim of this.dimensions) {
            dims[dim.name] = {}
        }

        for (let attn of this.attentions) {
            let total = 0
            for (let i = 0; i < this.srcTokens.length; ++i) {
                for (let j = 0; j < this.dstTokens.length; ++j) {
                    if (this.selected['src'][i] === true && this.selected['dst'][j] === true) {
                        total += attn.values[i][j]
                    }
                }
            }

            let notSelected = 0
            for (let dim in attn.info) {
                if (this.selected[dim][attn.info[dim]] !== true) {
                    notSelected++
                }
            }

            for (let dim of this.dimensions) {
                if (dims[dim.name][attn.info[dim.name]] == null) {
                    dims[dim.name][attn.info[dim.name]] = 0
                }
                if (notSelected === 0) {
                    dims[dim.name][attn.info[dim.name]] += total
                } else if (notSelected === 1 && this.selected[dim.name][attn.info[dim.name]] !== true) {
                    dims[dim.name][attn.info[dim.name]] += total
                }
            }
        }

        for (let dim of this.dimensions) {
            maxNormalizeMap(dims[dim.name])
        }

        return dims
    }

    private calcTokenDimsAttention(selDim: string): { [value: DimValue]: number }[] {
        let res = []
        let dv = getDimValues(selDim, this.dimensionsMap)
        for (let j = 0; j < this.dstTokens.length; ++j) {
            res.push({})
            for (let d of dv) {
                res[j][d] = 0
            }
        }

        for (let attn of this.attentions) {
            let notSelected = 0
            for (let dim in attn.info) {
                if (this.selected[dim][attn.info[dim]] !== true) {
                    if (dim !== selDim) {
                        notSelected++
                    }
                }
            }

            if (notSelected !== 0) {
                continue
            }
            let dvSel = attn.info[selDim]
            if (dvSel == null) {
                dvSel = 'null'
            }


            for (let i = 0; i < this.srcTokens.length; ++i) {
                for (let j = 0; j < this.dstTokens.length; ++j) {
                    if (this.selected['src'][i] === true) {
                        res[j][dvSel] += attn.values[i][j]
                    }
                }
            }

        }

        maxNormalizeArrayMap(res)
        return res
    }

    private calcGridAttentionAttention(dim1: string, dim2: string): GridAttention {
        let res = {}
        for (let dv1 of getDimValues(dim1, this.dimensionsMap)) {
            res[dv1] = {}
            for (let dv2 of getDimValues(dim2, this.dimensionsMap)) {
                res[dv1][dv2] = createMatrix(this.srcTokens.length, this.dstTokens.length)
            }
        }


        for (let attn of this.attentions) {
            let notSelected = 0
            for (let dim in attn.info) {
                if (this.selected[dim][attn.info[dim]] !== true) {
                    if (dim !== dim1 && dim !== dim2) {
                        notSelected++
                    }
                }
            }

            if (notSelected !== 0) {
                continue
            }

            let dv1 = attn.info[dim1]
            let dv2 = attn.info[dim2]
            if (dv1 == null) {
                dv1 = 'null'
            }
            if (dv2 == null) {
                dv2 = 'null'
            }

            let arr = res[dv1][dv2]

            for (let i = 0; i < this.srcTokens.length; ++i) {
                for (let j = 0; j < this.dstTokens.length; ++j) {
                    arr[i][j] += attn.values[i][j]
                }
            }
        }

        for (let dv1 in res) {
            for (let dv2 in res[dv1]) {

                for (let i = 0; i < this.srcTokens.length; ++i) {
                    normalizeArray(res[dv1][dv2][i])
                }
            }
        }

        return res
    }

    private getSelectedCount(type: string) {
        let count = 0
        for (let i in this.selected[type]) {
            if (this.selected[type][i] === true) {
                count++
            }
        }

        return count
    }

    private onSelected = (type: string, idx: DimValue, isMulti: boolean) => {
        if (isMulti) {
            this.selected[type][idx] = this.selected[type][idx] !== true
        } else {
            if (this.selected[type][idx] === true) {
                if (this.getSelectedCount(type) > 1) {
                    for (let i in this.selected[type]) {
                        this.selected[type][i] = false
                    }
                    this.selected[type][idx] = true
                } else {
                    for (let i in this.selected[type]) {
                        this.selected[type][i] = true
                    }
                }
            } else {
                for (let i in this.selected[type]) {
                    this.selected[type][i] = false
                }
                this.selected[type][idx] = true
            }
        }

        this.renderAttention()
    }

    private onLineGridDimChange = (dim1: string, dim2: string): GridAttention => {
        return this.calcGridAttentionAttention(dim1, dim2)
    }

    private onTokenHeatmapDimChange = (selDim: string): { [value: DimValue]: number }[] => {
        return this.calcTokenDimsAttention(selDim)
    }

    renderAttention() {
        let matrix = this.calcAttnMatrix()

        if (this.chartTypes.includes(ChartType.AttentionMatrix)) {
            this.attentionMatrixView.setSelection(this.selected['src'], this.selected['dst'])
            this.attentionMatrixView.setAttention(matrix)
        }

        if (this.chartTypes.includes(ChartType.SrcTokenHeatmap)) {
            this.srcTokenHeatmap.setSelection(this.selected['src'])
            this.srcTokenHeatmap.setAttention(this.calcSrcAttn(matrix))
        }

        if (this.chartTypes.includes(ChartType.DestTokenHeatmap)) {
            this.dstTokenHeatmap.setSelection(this.selected['dst'])
            this.dstTokenHeatmap.setAttention(this.calcDstAttn(matrix))
        }

        if (this.chartTypes.includes(ChartType.DimensionHeatmap) && this.dimensions.length != 0) {
            let dimsAttn = this.calcDimsAttention()
            for (let i = 0; i < this.dimensions.length; ++i) {
                let name = this.dimensions[i].name
                this.dimensionHeatmaps[i].setSelection(this.selected[name])
                this.dimensionHeatmaps[i].setAttention(dimsAttn[name])
            }
        }

        if (this.chartTypes.includes(ChartType.TokenDimHeatmap) && this.dimensions.length != 0) {
            this.tokenDimHeatmap.setSelection(this.selected['dst'])
            this.tokenDimHeatmap.setAttention(this.calcTokenDimsAttention(
                this.tokenDimHeatmap.selectedDimension))
        }

        if (this.chartTypes.includes(ChartType.LineGrid)) {
            this.lineGridView.setSelection(this.selected)
            this.lineGridView.setAttention(this.calcGridAttentionAttention(this.lineGridView.dim1, this.lineGridView.dim2))
        }
    }

    render() {
        let elem = $('div', '.attention-visualization')

        if (this.chartTypes.includes(ChartType.AttentionMatrix)) {
            elem.appendChild(this.attentionMatrixView.render())
        }

        if (this.chartTypes.includes(ChartType.SrcTokenHeatmap)) {
            elem.appendChild(this.srcTokenHeatmap.render())
        }

        if (this.chartTypes.includes(ChartType.DestTokenHeatmap)) {
            elem.appendChild(this.dstTokenHeatmap.render())
        }

        if (this.chartTypes.includes(ChartType.DimensionHeatmap) && this.dimensions.length != 0) {
            for (let i = 0; i < this.dimensions.length; ++i) {
                elem.appendChild(this.dimensionHeatmaps[i].render())
            }
        }

        if (this.chartTypes.includes(ChartType.TokenDimHeatmap) && this.dimensions.length != 0) {
            elem.appendChild(this.tokenDimHeatmap.render())
        }

        if (this.chartTypes.includes(ChartType.LineGrid)) {
            elem.appendChild(this.lineGridView.render())
        }

        this.renderAttention()

        return elem
    }
}