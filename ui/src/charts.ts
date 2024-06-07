import {ChartType} from "./types"
import {ChartDataModel} from "./types"
import {ChartData} from "./data"
import {Controller} from "./controller";
import {PlotColors} from "./colors";

window["chartsEmbed"]=function(elemId: string, data: ChartDataModel, color: Record<ChartType, string>) {
    let chartData = new ChartData(data)

    PlotColors.shared.setColorScheme(color)

    let chart = new Controller(chartData.dimensions,
        chartData.attention,
        {tokens: chartData.src_tokens},
        {tokens: chartData.tgt_tokens}, data.chart_types)
    document.getElementById(elemId).appendChild(chart.render())
}

window["test"] = function() {
    let sample: any = {} // require('/assets/attention.json')
    let chartData = new ChartData(sample)
    let chart = new Controller(chartData.dimensions,
        chartData.attention,
        {tokens: chartData.src_tokens},
        {tokens: chartData.tgt_tokens},
        [ChartType.AttentionMatrix, ChartType.SrcTokenHeatmap, ChartType.TokenDimHeatmap, ChartType.DimensionHeatmap, ChartType.LineGrid])
    document.body.appendChild(chart.render())
}
