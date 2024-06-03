export type SelectCallback = (type: string, idx: DimValue, isMulti: boolean) => void

export interface ComputedAttention {
    matrix: number[][]
    src: number[]
    dst: number[]
    dims: { [type: string]: { [value: DimValue]: number } }
}

export interface Dimension {
    name: string
    isMulti: boolean
    values?: DimValue[]
}

export type Dimensions = { [name: string]: Dimension }

export interface  AttentionMatrixModel {
    values: string
    shape: number[]
    info: { [name: string]: DimValue }
}

export interface AttentionMatrix {
    values: number[][]
    info: { [name: string]: DimValue }
}

export type GridAttention = { [dim1: string]: { [dim2: string]: number[][] } }

export type DimValue = string | number

export interface ChartDataModel {
    attention: AttentionMatrixModel[],
    src_tokens: string[],
    tgt_tokens: string[],
    chart_types: ChartType[]
}

export enum ChartType {
    AttentionMatrix = 'attention_matrix',
    TokenHeatmap = 'token_heatmap',
    DimensionHeatmap = 'dimension_heatmap',
    TokenDimHeatmap = 'token_dim_heatmap',
    LineGrid = 'line_grid'
}