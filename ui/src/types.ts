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

export interface AttentionMatrix {
    values: number[][]
    info: { [name: string]: DimValue }
}

export type GridAttention = { [dim1: string]: { [dim2: string]: number[][] } }

export type DimValue = string | number