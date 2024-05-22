import {Controller} from "./controller";
import {sampleAttentions, sampleTokens} from "./sample_data";

// document
//     .addEventListener('DOMContentLoaded', () => {
//         // test()
//         test_server()
//     })

// @ts-ignore
window.chartsEmbed=function(elemId: string){
    let chart = new Controller([{name: 'layer', isMulti: true}, {name: 'head', isMulti: true}],
        sampleAttentions,
        {tokens: sampleTokens},
        {tokens: sampleTokens})
    document.getElementById(elemId).appendChild(chart.render())
}

function test() {
    let src = ['I', ' ', 'went', ' ', 'home']
    let attention = [
        [0, 0, .7, 0, .3],
        [0, 0, 0, 1, 0],
        [.5, 0, 0, 0, .5],
        [0, 1, 0, 0, 0],
        [.2, 0, .8, 0, 0],
    ]
    // let chart = new Controller([{name: 'layer', isMulti: true}],
    //     [{values: attention, info: {'layer': '0'}}],
    //     {tokens: src},
    //     {tokens: src})

    let chart = new Controller([{name: 'layer', isMulti: true}, {name: 'head', isMulti: true}],
        sampleAttentions,
        {tokens: sampleTokens},
        {tokens: sampleTokens})
    document.body.appendChild(chart.render())
}


function onData(e: ProgressEvent) {
    let req = <XMLHttpRequest>e.target
    let data = JSON.parse(req.responseText)

    let chart = new Controller([{name: 'layer', isMulti: true}, {name: 'head', isMulti: true}],
        data.attention,
        {tokens: data.src_tokens},
        {tokens: data.tgt_tokens})
    document.body.appendChild(chart.render())

}

function test_server() {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", onData);
    oReq.open("GET", "data");
    oReq.send();
}
