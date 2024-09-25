export type SelectCallback = (type: string, idx: DimValue, isMulti: boolean) => void

export interface DimensionModel {
    name: string
}

export interface Dimension {
    name: string
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
    chart_types: ChartType[],
    dimensions: DimensionModel[]
}

export enum ChartType {
    AttentionMatrix = 'attention_matrix',
    SrcTokenHeatmap = 'query_token_heatmap',
    DestTokenHeatmap = 'key_token_heatmap',
    DimensionHeatmap = 'dimension_heatmap',
    TokenDimHeatmap = 'token_dim_heatmap',
    LineGrid = 'line_grid',
    TokenLoss = 'token_loss'
}