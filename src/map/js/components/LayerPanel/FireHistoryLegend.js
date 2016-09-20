import React from 'react';

export default class FireHistoryLegend extends React.Component {

  render() {
    return (
      <div className='last-rain-legend'>
        <div id='fireHistoryLegendDataColors'>
          <div id='lastRainLegendDataColorsBottom'>
            <div id='lastRainLegend'>
              <div className='lastRainLegendRow'>
                <span className='lastRainLegendData lastRainLegendDataHighest'>Very high density</span>
              </div>

              <div className='lastRainLegendRow'>
                <span className='lastRainLegendData lastRainLegendDataLow'>Low density</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}
