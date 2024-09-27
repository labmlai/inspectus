import {Weya as $} from "../lib/weya/weya";
import {ChartType, TokenValue} from "./types";
import {PlotColors} from "./colors";
import {setAlpha} from "./utils";

class TokenView {
    private elem: HTMLDivElement;
    private menu: HTMLDivElement;
    private token: string;
    private values: TokenValue[];

    constructor(token: string, values: TokenValue[]) {
        this.token = token;
        this.values = values;
    }

    render() {
      return $('div', '.hover-container', $ => {
        this.elem = $('div', '.token', this.token)
        this.menu = $('div', '.menu', $ => {
          for (let i = 0; i < this.values.length; ++i) {
            $('div', $ => {
              $('div', `${this.values[i].name}: ${this.values[i].value.toExponential()}`)
            })
          }
        })
      })
    }

    setValue(name: string) {
      let value = this.values.find(v => v.name === name)
      if (value == null) {
        return
      }
      let normalizedValue = value.normalizedValue

      this.elem.style.setProperty('background',
        PlotColors.shared.getInterpolatedColor(normalizedValue * 0.8, ChartType.TokenLoss))
      this.elem.style.setProperty('border-left',
          `3px solid ${
          setAlpha(PlotColors.shared.getInterpolatedColor(1 - normalizedValue * 0.8, ChartType.TokenLoss), 0.5)}`)


      this.elem.style.setProperty('color', PlotColors.shared.getInterpolatedTextColor(normalizedValue))
    }
}

export class StringTokenLoss {
    private tokens: string[];
    private tokenViews: TokenView[]
    private selectElem: HTMLSelectElement
    private selectedMetric: string
    private tokenValues: TokenValue[][]
    private paddingLess: boolean

    constructor(tokens: string[], tokenValues: TokenValue[][], paddingLess: boolean = true) {
      this.tokens = tokens;
      this.selectedMetric = tokenValues[0][0].name
      this.tokenValues = tokenValues
      this.paddingLess = paddingLess

      this.tokenViews = []
      for (let i = 0; i < this.tokens.length; ++i) {
        let view = new TokenView(this.tokens[i], tokenValues[i])
        this.tokenViews.push(view)
      }
    }

    onSelectChange = () => {
      this.selectedMetric = this.selectElem.value
      for (let i = 0; i < this.tokens.length; ++i) {
        this.tokenViews[i].setValue(this.selectedMetric)
      }
    }

    render() {
      let elem = $('div', '.src-tokens.text-tokens.token-value-container' + (this.paddingLess ? '.padding-less' : ''), $ => {
          $('div.title', 'Token Visualization')
          $('div.title', $ => {
            this.selectElem = $('select', $ => {
            })
          })
      })
      for (let i = 0; i < this.tokens.length; ++i) {
          elem.appendChild(this.tokenViews[i].render())
      }
      for (let i = 0; i < this.tokenValues[0].length; ++i) {
        this.selectElem.appendChild($('option', this.tokenValues[0][i].name))
      }

      this.selectElem.value = this.selectedMetric
      this.onSelectChange()

      this.selectElem.addEventListener('change', this.onSelectChange)

      return elem
    }
}