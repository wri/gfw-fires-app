import {layerPanelText} from 'js/config';
import Request from 'utils/request';
import React from 'react';

export default class WaterStressLegend extends React.Component {

  constructor(props) {
    super(props);
    //- Set legend Info to an empty array until data is returned
    this.state = {
      legendInfoLevels: [],
      legendInfoNoData: []
    };
  }

  componentDidMount() {
    Request.getLegendInfos(this.props.url, this.props.layerIds).then(legendInfos => {
      this.setState({
        legendInfoLevels: legendInfos.slice(0, legendInfos.length - 2),
        legendInfoNoData: legendInfos.slice(legendInfos.length - 2)
      });
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.legendInfoLevels.length !== this.state.legendInfoLevels.length;
  }

  render() {
    return (
      <div className='legend-container'>
        {this.state.legendInfoLevels.length === 0 ? <div className='legend-unavailable'>No Legend</div> :
          <div className='water-stress-legend'>
            <div className='legend-row'>
              <div className='legend-label'>{layerPanelText.waterStressLegend.min}</div>
              {this.state.legendInfoLevels.map(this.imgMapper, this)}
              <div className='legend-label'>{layerPanelText.waterStressLegend.max}</div>
            </div>
            <div className='legend-row no-data-labels'>
              <div className='legend-label'>{layerPanelText.waterStressLegend.arid}</div>
              <div className='legend-label'>{layerPanelText.waterStressLegend.nodata}</div>
              {this.state.legendInfoNoData.map(this.imgMapper, this)}
            </div>
          </div>
        }
      </div>
    );
  }

  imgMapper (legendInfo, index) {
    return <img key={index} title={legendInfo.label} src={`data:image/png;base64,${legendInfo.imageData}`} />;
  }

}

WaterStressLegend.propTypes = {
  url: React.PropTypes.string.isRequired,
  layerIds: React.PropTypes.array.isRequired
};
