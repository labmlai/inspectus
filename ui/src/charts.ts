import {ChartType, TokenValue} from "./types"
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

window["tokenViz"] = function(elemId: string, tokens: string[], 
    losses: number[][], normalizedLosses: number[][], valueNames: string[] | null, paddingLess: boolean = true) {

    let tokenValues: TokenValue[][] = []
    for (let idx = 0; idx < losses[0].length; ++idx) {
        tokenValues.push(losses.map((loss, i) => ({name: valueNames[i], value: loss[idx], normalizedValue: normalizedLosses[i][idx]})));
    }
    console.log(tokenValues)
    
    let lossView = new StringTokenLoss(tokens, tokenValues, paddingLess)
    let div = document.createElement('div');
    div.className = "attention-visualization"
    div.appendChild(lossView.render());

    document.getElementById(elemId).appendChild(div)
}

