import Request from 'utils/request';
import React from 'react';

export default class DamsLegend extends React.Component {

  constructor(props) {
    super(props);
    //- Set legend Info to an empty array until data is returned
    this.state = {
      legendInfos: []
    };
  }

  componentDidMount() {
    Request.getLegendInfos(this.props.url, this.props.layerIds).then(legendInfos => {
      this.setState({ legendInfos: legendInfos });
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.legendInfos.length !== this.state.legendInfos.length;
  }

  render() {
    return (
      <div className='legend-container'>
        {this.state.legendInfos.length === 0 ? <div className='legend-unavailable'>No Legend</div> :
          <div className='major-dams-legend'>
            {this.state.legendInfos.map(this.itemMapper, this)}
          </div>
        }
      </div>
    );
  }

  itemMapper (item, index) {
    return <div className='legend-row' key={index}>
      <img title={item.label} src={`data:image/png;base64,${item.imageData}`} />
      <div className='legend-label'>{item.label}</div>
    </div>;
  }

}
