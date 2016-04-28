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


          </div>
        </div>
      </div>
    );
  }

}

LastRainLegend.propTypes = {
  url: React.PropTypes.string.isRequired,
  layerIds: React.PropTypes.array.isRequired
};
