import Request from 'utils/request';
import React from 'react';

export default class AirQualityLegend extends React.Component {
  constructor (props) {
    super(props);
    this.state = { legendInfos: [] };
  }

  componentDidMount() {
    Request.getLegendInfos(this.props.url, this.props.layerIds).then(legendInfos => {
      this.setState({ legendInfos: legendInfos });
    });
  }

  itemMapper (item, index) {
    return <div className='legend-row' key={index}>
      <img title={item.label} src={`data:image/png;base64,${item.imageData}`} />
      <div className='legend-label'>{item.label}</div>
    </div>;
  }

  render () {
    return (
      <div className='legend-container'>
        {this.state.legendInfos.length === 0 ? <div className='legend-unavailable'>No Legend</div> :
          <div className='air-quality-legend'>
            {this.state.legendInfos.map(this.itemMapper, this)}
          </div>
        }
      </div>
    );
  }
}
