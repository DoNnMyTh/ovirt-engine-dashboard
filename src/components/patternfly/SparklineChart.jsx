import React, { PropTypes } from 'react'
const { string, number, bool, object, shape, arrayOf, oneOf, instanceOf } = PropTypes
import c3 from 'c3'
import { storageUnitTable } from '../../constants'
import { msg } from '../../intl-messages'
import { getDefaultSparklineConfig } from '../../patternfly-defaults'
import { formatNumber1D, formatPercent1D, formatDateTime } from '../../utils/intl'
import { convertValue } from '../../utils/unit-conversion'

// PatternFly reference:
//  https://www.patternfly.org/patterns/sparkline/

// Angular reference:
//  https://github.com/patternfly/angular-patternfly/blob/master/src/charts/sparkline/sparkline-chart.directive.js
//  https://github.com/patternfly/angular-patternfly/blob/master/src/charts/sparkline/sparkline-chart.html

// TODO(vs) sync with latest Angular impl.

class SparklineChart extends React.Component {

  componentDidMount () {
    this._generateChart(this.props)
  }

  componentWillReceiveProps (newProps) {
    this._updateChart(newProps)
  }

  componentWillUnmount () {
    this._destroyChart()
  }

  render () {
    return (
      <div className='sparkline-chart' style={this.props.containerStyle} ref={(e) => { this._chartContainer = e }} />
    )
  }

  _generateChart ({ data, total, unit, showXAxis, showYAxis, tooltipType }) {
    const config = Object.assign({}, getDefaultSparklineConfig(), {
      bindto: this._chartContainer,
      data: {
        type: 'area',
        columns: [
          ['date'].concat(data.map((obj) => obj.date)),
          ['used'].concat(data.map((obj) => obj.value))
        ],
        names: {
          date: 'Date',
          used: msg.unitUsed({ unit })
        },
        x: 'date'
      },
      axis: {
        x: {
          show: showXAxis,
          type: 'timeseries',
          tick: {
            format () {
              return ''
            }
          }
        },
        y: {
          show: showYAxis,
          tick: {
            format () {
              return ''
            }
          }
        }
      },
      tooltip: {
        position: (d, width, height, element) => {
          try {
            const center = parseInt(element.getAttribute('x'))
            const top = parseInt(element.getAttribute('y'))
            const chartBox = this._chartContainer.getBoundingClientRect()
            const graphOffsetX = this._chartContainer.querySelector('g.c3-axis-y').getBoundingClientRect().right
            const x = Math.max(0, center + graphOffsetX - chartBox.left - Math.floor(width / 2))

            return {
              top: top - height,
              left: Math.min(x, chartBox.width - width)
            }
          } catch (e) {
            __DEV__ && console.warn('Error while computing tooltip position', e)
          }
        },
        contents: (d) => {
          return this._getSparklineChartTooltipHTML({ d, unit, total, tooltipType })
        }
      }
    })

    this._chart = c3.generate(config)
  }

  _updateChart (props) {
    this._destroyChart()
    this._generateChart(props)
  }

  _destroyChart () {
    this._chart.destroy()
  }

  _getSparklineChartTooltipHTML ({ d, unit, total, tooltipType }) {
    const percentUsed = total === 0 ? 0 : d[0].value / total

    function lowerBoundPercentUsed () {
      return (percentUsed === 0 || percentUsed >= 0.001) ? formatPercent1D(percentUsed) : `<${formatPercent1D(0.001)}`
    }

    function getTooltipTableHTML (tipRows) {
      return `<table class='c3-tooltip'><tbody>${tipRows}</tbody></table>`
    }

    switch (tooltipType) {
      case 'percent':
        return getTooltipTableHTML(
          `<tr><td class='name'>${lowerBoundPercentUsed()}</td></tr>`
        )
      // TODO(vs) this isn't supported in angular-patternfly, replace with custom tooltip function
      case 'percentPerDate':
        return getTooltipTableHTML(
          `<tr><td class='value text-nowrap'>${formatDateTime(d[0].x)}</td>
               <td class='value text-nowrap'>${lowerBoundPercentUsed()}</td></tr>`
        )
      case 'valuePerDate':
        // any TiB value <= 0.1 converted to GiB or MiB
        const { unit: newUnit, value: newUsed } = convertValue(storageUnitTable, unit, d[0].value, 0.1)
        return getTooltipTableHTML(
          `<tr><td class='value text-nowrap'>${formatDateTime(d[0].x)}</td><td class='value text-nowrap'>${formatNumber1D(newUsed)} ${newUnit}</td></tr>`
        )
      case 'usagePerDate':
        return getTooltipTableHTML(
          `<tr><th colspan='2'>${formatDateTime(d[0].x)}</th></tr>` +
          `<tr><td class='name'>${lowerBoundPercentUsed()}:</td><td class='value text-nowrap'>${formatNumber1D(d[0].value)} ${d[0].name}</td></tr>`
        )
      default:
        return `<span class='c3-tooltip-sparkline'>${formatNumber1D(d[0].value)} ${d[0].name}</span>`
    }
  }

}

SparklineChart.propTypes = {
  data: arrayOf(shape({
    value: number,
    date: instanceOf(Date)
  })).isRequired,
  total: number.isRequired,
  unit: string.isRequired,
  showXAxis: bool,
  showYAxis: bool,
  tooltipType: oneOf(['default', 'percent', 'percentPerDate', 'valuePerDate', 'usagePerDate']),
  containerStyle: object
}

SparklineChart.defaultProps = {
  showXAxis: false,
  showYAxis: false,
  tooltipType: 'default',
  containerStyle: {}
}

export default SparklineChart
