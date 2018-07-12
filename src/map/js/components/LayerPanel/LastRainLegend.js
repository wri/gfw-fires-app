import React from 'react';

export default class LastRainLegend extends React.Component {

  constructor(props) {
    super(props);
    //- Set legend Info to an empty array until data is returned
    this.state = {
      legendInfos: []
    };
  }

  componentDidMount() {
    // Request.getLegendInfos(this.props.url, this.props.layerIds).then(legendInfos => {
    //   this.setState({ legendInfos: legendInfos });
    // });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.legendInfos.length !== this.state.legendInfos.length;
  }

  render() {
    return (
      <div className='last-rain-legend'>
        <div id='lastRainLegendDataColors'>
          <div id='lastRainLegendDataColorsBottom'>
            <div id='lastRainLegend'>
              <div className='lastRainLegendRow'>
                <span className='lastRainLegendData lastRainLegendDataHighest'>40 or more days</span>
              </div>
              <div className='lastRainLegendRow'>
                <span className='lastRainLegendData lastRainLegendDataMedium'>20 days</span>
              </div>
              <div className='lastRainLegendRow'>
                <span className='lastRainLegendData lastRainLegendDataLow'>0 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

