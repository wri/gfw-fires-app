import React from 'react';

export default class FireHistoryLegend extends React.Component {

  render() {
    return (
      <div className='last-rain-legend'>
        <div id='fireHistoryLegendDataColors'>
          <div id='fireHistoryLegendDataColorsBottom'>
            <div id='lastRainLegend'>
              <div className='lastRainLegendRow'>
                <span className='fireHistoryLegendData fireHistoryLegendDataHighest'>High</span>
              </div>
              <div className='lastRainLegendRow'>
                <span className='fireHistoryLegendData fireHistoryLegendDataMedium'>Low</span>
              </div>
              <div className='lastRainLegendRow'>
                <span className='fireHistoryLegendData fireHistoryLegendDataLow'>None</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}
