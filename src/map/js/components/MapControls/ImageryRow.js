import {layerActions} from 'actions/LayerActions';
import React from 'react';

export default class ImageryRow extends React.Component {

  // componentDidUpdate(prevProps) {
  //   if (prevProps.checked !== this.props.checked) {
  //     if (this.props.layer.id === KEYS.windDirection) {
  //       LayersHelper.toggleWind(this.props.checked);
  //       return;
  //     }
  //     if (this.props.checked) {
  //       LayersHelper.showLayer(this.props.layer.id);
  //     } else {
  //       LayersHelper.hideLayer(this.props.layer.id);
  //     }
  //   }
  // }

  shouldComponentUpdate(nextProps) {
    return nextProps.checked !== this.props.checked || this.props.children;
  }

  render() {
    let layer = this.props.layer;

    return (
      <tr className={`imagery-row ${this.props.clicked ? ' active' : ''}`} >
        <td onClick={this.toggleFeature.bind(this)} className='toggle-switch pointer'>{this.props.dateData}</td>
        <td onClick={this.toggleFeature.bind(this)} className='toggle-switch pointer'>{this.props.satelliteData}</td>
      </tr>
    );
  }

  toggleFeature () {
    debugger
    // let layer = this.props.layer;
    // if (layer.disabled) { return; }
    // if (this.props.checked) {
    //   layerActions.removeActiveLayer(layer.id);
    // } else {
    //   layerActions.addActiveLayer(layer.id);
    // }
  }

}

ImageryRow.propTypes = {
  dateData: React.PropTypes.string.isRequired,
  satelliteData: React.PropTypes.string.isRequired
};
