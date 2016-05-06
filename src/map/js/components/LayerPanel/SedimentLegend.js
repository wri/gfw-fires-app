import {layerPanelText} from 'js/config';
import Request from 'utils/request';
import React from 'react';

export default class SedimentLegend extends React.Component {

  constructor(props) {
    super(props);
    //- Set legend Info to an empty array until data is returned
    this.state = {
      legendInfo: []
    };
  }

  componentDidMount() {
    Request.getLegendInfos(this.props.url, this.props.layerIds).then(legendInfos => {
      this.setState({ legendInfo: legendInfos });
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.legendInfo.length !== this.state.legendInfo.length;
  }

  render() {
    return (
      <div className='legend-container'>
        {this.state.legendInfo.length === 0 ? <div className='legend-unavailable'>No Legend</div> :
          <div className='sediment-legend'>
            <div className='legend-row'>
              <div className='legend-label'>{layerPanelText.sedimentLegend.min}</div>
              {this.state.legendInfo.map(this.imgMapper, this)}
              <div className='legend-label'>{layerPanelText.sedimentLegend.max}</div>
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

SedimentLegend.propTypes = {
  url: React.PropTypes.string.isRequired,
  layerIds: React.PropTypes.array.isRequired
};
