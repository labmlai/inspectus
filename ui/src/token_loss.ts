import {Weya as $} from "../lib/weya/weya";
import {ChartType, TokenData, TokenValue} from "./types";
import {PlotColors} from "./colors";
import {setAlpha} from "./utils";

class TokenView {
    private elem: HTMLElement;
    private menu: HTMLDivElement;
    private token: string;
    private values: TokenValue[];
    public isNewLine: boolean
    private colors: PlotColors
    private info: Object

    constructor(token: string, tokenData: TokenData, colors: PlotColors) {
      this.isNewLine = /^[\n\r\v]+$/.test(token);
      this.token = token;
      this.values = tokenData.values;
      this.colors = colors;
      this.info = tokenData.info
    }

    render() {
      return $('div', '.hover-container', $ => {
        this.elem = $('pre', '.token' + (this.isNewLine ? '.new-line' : ''),
           this.token.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\v/g, '\\v'))
        this.menu = $('div', '.menu', $ => {
          for (let i = 0; i < this.values.length; ++i) {
            $('div', $ => {
              $('div', `${this.values[i].name}: ${this.values[i].value.toExponential()}`)
            })
          }
          $('hr')
          for (let key in this.info) {
            if (this.info.hasOwnProperty(key)) {
              $('div', $ => {
                $('div', `${key}: ${this.info[key]}`)
              })
            }
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
      this.colors.getInterpolatedColor(normalizedValue * 0.6 + 0.4, ChartType.TokenLoss))
    }
}

export class StringTokenLoss {
    private tokens: string[];
    private tokenViews: TokenView[]
    private selectElem: HTMLSelectElement
    private selectedMetric: string
    private tokenData: TokenData[]
    private paddingLess: boolean

    constructor(tokens: string[], tokenData: TokenData[], colors: PlotColors, paddingLess: boolean = true) {
      this.tokens = tokens;
      this.selectedMetric = tokenData[0].values[0].name
      this.tokenData = tokenData
      this.paddingLess = paddingLess

      this.tokenViews = []
      for (let i = 0; i < this.tokens.length; ++i) {
        let view = new TokenView(this.tokens[i], this.tokenData[i], colors)
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
          if (this.tokenViews[i].isNewLine) {
            elem.appendChild($('br'))
          }
      }
      for (let i = 0; i < this.tokenData[0].values.length; ++i) {
        this.selectElem.appendChild($('option', this.tokenData[0].values[i].name))
      }

      this.selectElem.value = this.selectedMetric
      this.onSelectChange()

      this.selectElem.addEventListener('change', this.onSelectChange)

      return elem
    }
}