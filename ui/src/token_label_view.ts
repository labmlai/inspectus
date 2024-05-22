import {Weya as $} from '../lib/weya/weya'

export abstract class TokenLabelView {
    abstract addClickHandler(type: string, idx: number | string, handler)

    abstract render(cellSize: number, isVertical: boolean): SVGElement
}

export class StringTokenLabelView extends TokenLabelView {
    private token: string;
    private handler: CallableFunction;
    private type: string;
    private idx: number | string;

    constructor(token: string) {
        super()
        this.token = token
    }

    addClickHandler(type: string, idx: number | string, handler) {
        this.handler = handler
        this.type = type
        this.idx = idx
    }

    render(cellSize: number, isVertical: boolean): SVGElement {
        let style = {'font-size': `${cellSize / 2}px`}
        if (isVertical) {
            style['writing-mode'] = 'tb'
        }
        return $('text', this.token, {style: style})
    }
}