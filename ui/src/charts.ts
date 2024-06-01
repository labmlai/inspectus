import {ChartType, Controller} from "./controller"
import {ChartDataModel} from "./types"
import {ChartData} from "./data"

window["chartsEmbed"]=function(elemId: string, data: ChartDataModel) {
    let chartData = new ChartData(data)

    let chart = new Controller([{name: 'layer', isMulti: true}, {name: 'head', isMulti: true}],
        chartData.attention,
        {tokens: chartData.src_tokens},
        {tokens: chartData.tgt_tokens}, data.chart_types)
    document.getElementById(elemId).appendChild(chart.render())
}

window["test"] = function() {
    let sample = require('../assets/attention.json')
    let chartData = new ChartData(sample)
    let chart = new Controller([{name: 'layer', isMulti: true}, {name: 'head', isMulti: true}],
        chartData.attention,
        {tokens: chartData.src_tokens},
        {tokens: chartData.tgt_tokens},
        [ChartType.AttentionMatrix, ChartType.TokenHeatmap, ChartType.TokenDimHeatmap, ChartType.DimensionHeatmap, ChartType.LineGrid])
    document.body.appendChild(chart.render())
}
