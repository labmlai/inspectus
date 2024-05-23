import {ChartType, Controller} from "./controller"
import {AttentionMatrix} from "./types"

interface ChartData {
    attention: AttentionMatrix[],
    src_tokens: string[],
    tgt_tokens: string[],
    chart_types: ChartType[]
}

window["chartsEmbed"]=function(elemId: string, data: ChartData) {
    let chart = new Controller([{name: 'layer', isMulti: true}, {name: 'head', isMulti: true}],
        data.attention,
        {tokens: data.src_tokens},
        {tokens: data.tgt_tokens}, data.chart_types)
    document.getElementById(elemId).appendChild(chart.render())
}

// function test() {
//     let chart = new Controller([{name: 'layer', isMulti: true}, {name: 'head', isMulti: true}],
//         sampleAttentions,
//         {tokens: sampleTokens},
//         {tokens: sampleTokens})
//     document.body.appendChild(chart.render())
// }
