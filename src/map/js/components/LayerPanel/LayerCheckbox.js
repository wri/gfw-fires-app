import {layerActions} from 'actions/LayerActions';
import {modalActions} from 'actions/ModalActions';
import {mapStore} from 'stores/MapStore';
import LayersHelper from 'helpers/LayersHelper';
import KEYS from 'js/constants';
import React from 'react';

// Info Icon Markup for innerHTML
let useSvg = '<use xlink:href="#shape-info" />';

export default class LayerCheckbox extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = mapStore.getState();
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  componentDidUpdate(prevProps) {
    if (prevProps.checked !== this.props.checked) {
      if (this.props.layer.id === KEYS.windDirection) {
        LayersHelper.toggleWind(this.props.checked);
        return;
      }

      if (this.props.checked) {
        let layerObj = {};
        layerObj.layerId = this.props.layer.id;
        layerObj.footprints = this.state.footprints;
        LayersHelper.showLayer(layerObj);
      } else {
        LayersHelper.hideLayer(this.props.layer.id);
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.checked !== this.props.checked || this.props.children;
  }

  render() {
    let layer = this.props.layer;
    return (
      <div className={`layer-checkbox relative ${layer.className}${this.props.checked ? ' active' : ''}${layer.disabled ? ' disabled' : ''}`}>
        {!layer.disabled ? null : <span className='tooltipmap fire'>Coming Soon!</span>}
        <span onClick={this.toggleLayer.bind(this)} className='toggle-switch pointer'><span/></span>
        <span onClick={this.toggleLayer.bind(this)} className='layer-checkbox-label pointer'>{layer.label}</span>
        {!layer.sublabel ? null : <div className='layer-checkbox-sublabel'>{layer.sublabel}</div>}
        {!layer.metadataId ? null :
          <span className='info-icon pointer' onClick={this.showInfo.bind(this)}>
            <svg dangerouslySetInnerHTML={{ __html: useSvg }}/>
          </span>
        }
        {!this.props.children ? null :
          <div className={`layer-content-container ${this.props.checked || this.props.childrenVisible ? '' : 'hidden'}`}>
            {this.props.children}
          </div>
        }
      </div>
    );
  }

  showInfo () {
    let layer = this.props.layer;
    if (layer.disabled) { return; }
    modalActions.showLayerInfo(this.props.layer.id);
  }

  toggleLayer () {
    let layer = this.props.layer;
    if (layer.disabled) { return; }
    if (this.props.checked) {
      layerActions.removeActiveLayer(layer.id);
    } else {
      layerActions.addActiveLayer(layer.id);
    }
  }

}

LayerCheckbox.propTypes = {
  layer: React.PropTypes.object.isRequired,
  checked: React.PropTypes.bool.isRequired
};
