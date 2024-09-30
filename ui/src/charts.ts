import {ChartType, TokenData, TokenValue} from "./types"
import {ChartDataModel} from "./types"
import {ChartData} from "./data"
import {Controller} from "./controller";
import {PlotColors} from "./colors";
import { StringTokenLoss } from "./token_loss";

window["chartsEmbed"]=function(elemId: string, data: ChartDataModel, color: Record<ChartType, string>) {
    let chartData = new ChartData(data)

    // Create a new PlotColors object
    let plotColors = new PlotColors()
    plotColors.setColorScheme(color)

    let chart = new Controller(chartData.dimensions,
        chartData.attention,
        {tokens: chartData.src_tokens},
        {tokens: chartData.tgt_tokens},
        data.chart_types,
        plotColors) // Pass plotColors to Controller
    document.getElementById(elemId).appendChild(chart.render())
}

window["chartsEmbedTest"] = function() {
    let sample: any = {} // require('/assets/attention.json')
    let chartData = new ChartData(sample)
    let plotColors = new PlotColors()
    let chart = new Controller(chartData.dimensions,
        chartData.attention,
        {tokens: chartData.src_tokens},
        {tokens: chartData.tgt_tokens},
        [ChartType.AttentionMatrix, ChartType.SrcTokenHeatmap, ChartType.TokenDimHeatmap, ChartType.DimensionHeatmap, ChartType.LineGrid],
        plotColors)
    document.body.appendChild(chart.render())
}

window["tokenViz"] = function(elemId: string, tokens: string[], 
    losses: number[][], normalizedLosses: number[][], valueNames: string[] | null, paddingLess: boolean, color: string, tokenInfo: string[]) {
    
    let colorScheme: any = {};
    colorScheme[ChartType.TokenLoss] = color;
    let colors = new PlotColors()
    colors.setColorScheme(colorScheme);
    
    let tokenData: TokenData[] = []
    for (let idx = 0; idx < losses[0].length; ++idx) {
        let tokenValues = losses.map((loss, i) => ({name: valueNames[i], value: loss[idx], 
            normalizedValue: normalizedLosses[i][idx], info: tokenInfo[idx]}))

        tokenData[idx] = {
            values: tokenValues,
            info: tokenInfo[idx]
        }
    }
    
    let lossView = new StringTokenLoss(tokens, tokenData, colors, paddingLess)
    let div = document.createElement('div');
    div.className = "attention-visualization"
    div.appendChild(lossView.render());


    document.getElementById(elemId).appendChild(div)
}
