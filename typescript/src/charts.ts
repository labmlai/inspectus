import {Controller} from "./controller"
// import {sampleAttentions, sampleTokens} from "./sample_data"

window["chartsEmbed"]=function(elemId: string, data: any) {
    let chart = new Controller([{name: 'layer', isMulti: true}, {name: 'head', isMulti: true}],
        data.attention,
        {tokens: data.src_tokens},
        {tokens: data.tgt_tokens})
    document.getElementById(elemId).appendChild(chart.render())
}

// function test() {
//     let chart = new Controller([{name: 'layer', isMulti: true}, {name: 'head', isMulti: true}],
//         sampleAttentions,
//         {tokens: sampleTokens},
//         {tokens: sampleTokens})
//     document.body.appendChild(chart.render())
// }
