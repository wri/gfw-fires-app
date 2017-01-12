import React from 'react';

export default class FireRiskLegend extends React.Component {

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
      <div className='fire-risk-legend'>
        <div id='fireWeatherLegendDataColors'>
          <div id='fireWeatherLegendDataColorsBottom'>
          <div id='fireWeatherLegendNoData'></div>
            <div id='fireWeatherLegend'>
              <div className='fireWeatherLegendRow'>
                <span className='fireWeatherLegendData fireWeatherLegendDataHighest'>Very High Risk</span>
              </div>
              <div className='fireWeatherLegendRow'>
                <span className='fireWeatherLegendData fireWeatherLegendDataHigh'>High Risk</span>
              </div>
              <div className='fireWeatherLegendRow'>
                <span className='fireWeatherLegendData fireWeatherLegendDataMedium'>Moderate Risk</span>
              </div>
              <div className='fireWeatherLegendRow'>
                <span className='fireWeatherLegendData fireWeatherLegendDataLow'>Low Risk</span>
              </div>
              <div className='fireWeatherLegendRow'>
                <span className='fireWeatherLegendData fireWeatherLegendDataLowest'>Very Low Risk</span>
              </div>
              <div className='fireWeatherLegendRow'>
                <span className='fireWeatherLegendData'>No Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

FireRiskLegend.propTypes = {
  url: React.PropTypes.string.isRequired,
  layerIds: React.PropTypes.array.isRequired
};
