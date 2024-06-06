import {Dimensions} from "./types";

export function createMatrix(rows: number, cols: number) {
    let matrix = []
    for (let i = 0; i < rows; ++i) {
        let row = []
        for (let j = 0; j < cols; ++j) {
            row.push(0.)
        }
        matrix.push(row)
    }

    return matrix
}

export function normalizeArray(arr: number[]) {
    let sum = 0
    for (let j = 0; j < arr.length; ++j) {
        sum += arr[j]
    }
    if (sum <= 0) {
        return
    }

    for (let j = 0; j < arr.length; ++j) {
        arr[j] /= sum
    }
}

export function maxNormalizeArray(arr: number[]) {
    let max = 0
    for (let j = 0; j < arr.length; ++j) {
        max = Math.max(max, arr[j])
    }
    if (max <= 0) {
        return
    }

    for (let j = 0; j < arr.length; ++j) {
        arr[j] /= max
    }
}

export function maxNormalizeMap(arr: { [name: string]: number }) {
    let max = 0
    for (let i in arr) {
        max = Math.max(max, arr[i])
    }
    if (max <= 0) {
        return
    }

    for (let i in arr) {
        arr[i] /= max
    }
}

export function maxNormalizeArrayMap(arr: { [name: string]: number }[]) {
    let max = 0
    for (let d of arr) {
        for (let i in d) {
            max = Math.max(max, d[i])
        }
    }
    if (max <= 0) {
        return
    }

    for (let d of arr) {
        for (let i in d) {
            d[i] /= max
        }
    }
}

export function getDimValues(dim: string, dimensions: Dimensions) {
    let d = dimensions[dim]

    if (d == null) {
        return ['null']
    } else {
        return d.values
    }
}

export function capitalizeFirstLetter(str: string) {
    return str.split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
}


export function setAlpha(d3Color: string, alpha: number): string {
    return d3Color.replace(')', `, ${alpha})`)
}