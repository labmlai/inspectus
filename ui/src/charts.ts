import {ChartType} from "./types"
import {ChartDataModel} from "./types"
import {ChartData} from "./data"
import {Controller} from "./controller";
import {PlotColors} from "./colors";
import { StringTokenLoss } from "./token_loss";

window["chartsEmbed"]=function(elemId: string, data: ChartDataModel, color: Record<ChartType, string>) {
    let chartData = new ChartData(data)

    PlotColors.shared.setColorScheme(color)

    let chart = new Controller(chartData.dimensions,
        chartData.attention,
        {tokens: chartData.src_tokens},
        {tokens: chartData.tgt_tokens}, data.chart_types)
    document.getElementById(elemId).appendChild(chart.render())
}

window["chartsEmbedTest"] = function() {
    let sample: any = {} // require('/assets/attention.json')
    let chartData = new ChartData(sample)
    let chart = new Controller(chartData.dimensions,
        chartData.attention,
        {tokens: chartData.src_tokens},
        {tokens: chartData.tgt_tokens},
        [ChartType.AttentionMatrix, ChartType.SrcTokenHeatmap, ChartType.TokenDimHeatmap, ChartType.DimensionHeatmap, ChartType.LineGrid])
    document.body.appendChild(chart.render())
}

window["tokenViz"] = function(elemId: string, tokens: string[], losses: number[]) {
    let lossView = new StringTokenLoss(tokens)
    let div = document.createElement('div');
    div.className = "attention-visualization"
    div.appendChild(lossView.render());
    lossView.setLosses(losses)

    document.getElementById(elemId).appendChild(div)
}

window["tokenVizTest"] = function() {
    let tokens = ["hello", "world", "this", "is", "a", "test"]
    let losses = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6]
    let lossView = new StringTokenLoss(tokens)
    let div = document.createElement('div');
    div.className = "attention-visualization"
    div.appendChild(lossView.render());
    lossView.setLosses(losses)

    document.body.appendChild(div);
}

