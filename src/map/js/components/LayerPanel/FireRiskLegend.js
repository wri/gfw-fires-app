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
        <div id='fireRiskLegendDataColors'>
          <div id='fireRiskLegendDataColorsBottom'>
          <div id='fireRiskLegendNoData'></div>
            <div id='fireRiskLegend'>
              <div className='fireRiskLegendRow'>
                <span className='fireRiskLegendData fireRiskLegendDataHighest'>Very High Risk</span>
              </div>
              <div className='fireRiskLegendRow'>
                <span className='fireRiskLegendData fireRiskLegendDataHigh'>High Risk</span>
              </div>
              <div className='fireRiskLegendRow'>
                <span className='fireRiskLegendData fireRiskLegendDataMedium'>Moderate Risk</span>
              </div>
              <div className='fireRiskLegendRow'>
                <span className='fireRiskLegendData fireRiskLegendDataLow'>Low Risk</span>
              </div>
              <div className='fireRiskLegendRow'>
                <span className='fireRiskLegendData fireRiskLegendDataLowest'>Very Low Risk</span>
              </div>
              <div className='fireRiskLegendRow'>
                <span className='fireRiskLegendData'>No Data</span>
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
