import React, { PropTypes } from 'react'
const { string, number, bool, shape, oneOf, oneOfType, func } = PropTypes
import classNames from 'classnames'
import { msg } from '../../intl-messages'
import { formatNumber0D, formatNumber1D } from '../../utils/intl'
import { round } from '../../utils/round'
import Tooltip from '../bootstrap/Tooltip'

// PatternFly reference:
//  https://www.patternfly.org/patterns/utilization-bar-chart/

// Angular reference:
//  https://github.com/patternfly/angular-patternfly/blob/master/src/charts/utilization-bar/utilization-bar-chart.directive.js
//  https://github.com/patternfly/angular-patternfly/blob/master/src/charts/utilization-bar/utilization-bar-chart.html

// TODO(vs) sync with latest Angular impl.

/*
  TODO(vs) update markup to match the latest PatternFly reference:
  <div class="progress">
    <div class="progress-bar" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100" style="width: 25%;" data-toggle="tooltip" title="25% Used">
      <span class="sr-only">25% Used</span>
    </div>
    <div class="progress-bar progress-bar-remaining" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 75%;" data-toggle="tooltip" title="75% Available">
      <span class="sr-only">75% Available</span>
    </div>
  </div>
 */

function UtilizationBarChart ({
    used, total, unit, thresholds, layout, title, footerLabel,
    titleLabelWidth, footerLabelWidth
  }) {
  const percentUsed = used / total * 100
  const percentAvailable = 100 - percentUsed

  // percent used can be >100% but we render only up to 100% (anything longer will be clipped)
  const barUsedWidth = Math.min(100, percentUsed)
  const barAvailableWidth = 100 - barUsedWidth

  const progressThresholdClass = thresholds.enabled && classNames({
    'progress-bar-success': (percentUsed < thresholds.warning),
    'progress-bar-warning': (percentUsed >= thresholds.warning && percentUsed <= thresholds.error),
    'progress-bar-danger': (percentUsed > thresholds.error)
  }) || ''

  return (
    <div className='pf-utilization-bar-chart'>

      {layout === 'regular' &&
        <span>
          {title && <div className='progress-description'>{title}</div>}
          <div className='progress progress-label-top-right'>

            {/* used progress */}
            <Tooltip text={msg.percentUsed({ value: round(percentUsed) })}>
              <div className={`progress-bar ${progressThresholdClass}`} style={{ width: `${barUsedWidth}%` }} role='progressbar'>
                {footerLabel === 'actual' &&
                  <span>
                    <strong>{msg.usedOfTotal({ used: round(used, 1), total: round(total, 1) })} {unit}</strong> {msg.used()}
                  </span>
                }
                {footerLabel === 'percent' &&
                  <span>
                    <strong>{formatNumber0D(percentUsed)}%</strong> {msg.used()}
                  </span>
                }
                {typeof footerLabel === 'function' &&
                  <span>
                    {footerLabel(used, total, unit)}
                  </span>
                }
              </div>
            </Tooltip>

            {/* available progress */}
            <Tooltip text={msg.percentAvailable({ value: round(percentAvailable) })}>
              <div className='progress-bar progress-bar-remaining' style={{ width: `${barAvailableWidth}%` }} role='progressbar' />
            </Tooltip>

          </div>
        </span>
      }

      {layout === 'inline' &&
        <div className='progress-container progress-description-left progress-label-right'
          style={{ paddingLeft: titleLabelWidth, paddingRight: footerLabelWidth }}>
          {title && <div className='progress-description' style={{ maxWidth: titleLabelWidth }}>{title}</div>}
          <div className='progress'>

            {/* used progress */}
            <Tooltip text={msg.percentUsed({ value: round(percentUsed) })}>
              <div className={`progress-bar ${progressThresholdClass}`} style={{ width: `${barUsedWidth}%` }} role='progressbar'>
                {footerLabel === 'actual' &&
                  <span style={{ maxWidth: footerLabelWidth }}>
                    <strong>{formatNumber1D(used)} {unit}</strong> {msg.used()}
                  </span>
                }
                {footerLabel === 'percent' &&
                  <span style={{ maxWidth: footerLabelWidth }}>
                    <strong>{formatNumber0D(percentUsed)}%</strong> {msg.used()}
                  </span>
                }
                {typeof footerLabel === 'function' &&
                  <span style={{ maxWidth: footerLabelWidth }}>
                    {footerLabel(used, total, unit)}
                  </span>
                }
              </div>
            </Tooltip>

            {/* available progress */}
            <Tooltip text={msg.percentAvailable({ value: round(percentAvailable) })}>
              <div className='progress-bar progress-bar-remaining' style={{ width: `${barAvailableWidth}%` }} role='progressbar' />
            </Tooltip>

          </div>
        </div>
      }
    </div>
  )
}

UtilizationBarChart.propTypes = {
  used: number.isRequired,
  total: number.isRequired,
  unit: string.isRequired,
  thresholds: shape({
    enabled: bool,
    warning: number,
    error: number
  }),
  layout: oneOf(['regular', 'inline']),
  title: string,   // custom title
  footerLabel: oneOfType([
    oneOf(['actual', 'percent']),
    func // (used:number, total:number, unit:string) => void
  ]),
  titleLabelWidth: string, // used with 'inline' layout
  footerLabelWidth: string // used with 'inline' layout
}

UtilizationBarChart.defaultProps = {
  thresholds: {
    enabled: true,
    warning: 60,
    error: 90
  },
  layout: 'regular',
  footerLabel: 'actual'
}

export default UtilizationBarChart
