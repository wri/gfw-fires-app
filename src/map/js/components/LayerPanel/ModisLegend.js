import React from 'react';

export default class ModisLegend extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='legend-container'>
          <div className='modis-legend'>
            <div className='legend-rows activeFiresLegend'>
              <div className='activeFiresLegendItem' id='low-confidence'></div>
              <div className='legend-label'>Low Confidence</div>
            </div>
            <div className='legend-rows activeFiresLegend'>
              <div className='activeFiresLegendItem' id='high-confidence'></div>
              <div className='legend-label'>High Confidence</div>
            </div>
          </div>
      </div>
    );
  }
}
