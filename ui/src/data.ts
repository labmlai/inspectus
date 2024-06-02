import {AttentionMatrix, ChartDataModel} from "./types"
import {ChartType} from "./controller"

export class ChartData {
    attention: AttentionMatrix[]
    src_tokens: string[]
    tgt_tokens: string[]
    chart_types: ChartType[]

    constructor(data: ChartDataModel) {
        this.chart_types = data.chart_types
        this.src_tokens = data.src_tokens
        this.tgt_tokens = data.tgt_tokens

        this.attention = []
        for (let index in data.attention) {
            let values = decodeB64(data.attention[index].values, data.attention[index].shape)
            this.attention.push({values: values, info: data.attention[index].info})
        }
    }
}


function getListFromBinary(binaryString: string): Float32Array {
    let b64 = atob(binaryString)
    const uint8Array = new Uint8Array(b64.length);
    for (let i = 0; i < b64.length; i++) {
      uint8Array[i] = b64.charCodeAt(i);
    }
    try {
        let dataView = new DataView(uint8Array.buffer)
        let floatArray = new Float32Array(dataView.byteLength / 4)
        for (let i = 0; i < floatArray.length; i++) {
            floatArray[i] = dataView.getFloat32(i * 4, true)
        }
        return floatArray
    } catch (e) {
        console.error("Error parsing binary data", e)
        return  new Float32Array(0);
    }
}

function reshapeArray(data: any[], shape: number[]): number[][] {
    if (shape.length === 1) {
        return data
    }
    let result = [];
    let size = shape[0];
    shape = shape.slice(1);
    let length = data.length / size;
    for (let i = 0; i < size; i++) {
        result.push(reshapeArray(data.splice(0, length), shape));
    }
    return result;
}

function decodeB64(input: string, shape: number[]): number[][] {
    let array = getListFromBinary(input)
    return reshapeArray(Array.from(array), shape)
}