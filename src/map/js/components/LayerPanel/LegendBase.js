//- NOT IN USE, NEED TO FIND A WAY TO PASS LAYER INFOS TO this.props.children
import Request from 'utils/request';
import React from 'react';

export default class LegendBase extends React.Component {
  constructor (props) {
    super(props);
    this.state = { layerInfos: [] };
  }

  componentDidMount() {
    Request.getLegendInfos(this.props.url, this.props.layerIds).then(legendInfos => {
      this.setState({ layerInfos: legendInfos });
    });
  }

  render () {
    let childrenWithProps = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        layerInfos: this.state.layerInfos,
        layerIds: this.props.layerIds,
        url: this.props.url
      });
    });

    return (
      <div className='legend-container'>
        {childrenWithProps}
      </div>
    );
  }
}
