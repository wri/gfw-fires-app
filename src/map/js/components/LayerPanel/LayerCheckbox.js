import {layerActions} from 'actions/LayerActions';
import {modalActions} from 'actions/ModalActions';
import {mapStore} from 'stores/MapStore';
import LayersHelper from 'helpers/LayersHelper';
import KEYS from 'js/constants';
import React from 'react';
import { layerPanelText } from 'js/config';

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

        if (this.props.layer.id === 'activeFires' || this.props.layer.id === 'viirsFires') {
          this.props.activeLayers.forEach(activeLayer => {
            if (activeLayer.indexOf(this.props.layer.id) > -1) {
              layerObj.layerId = activeLayer;
              layerObj.footprints = this.state.footprints;
              layerObj.fireHistorySelectIndex = this.state.fireHistorySelectIndex;
            }
          });
        } else {
          layerObj.layerId = this.props.layer.id;
          layerObj.footprints = this.state.footprints;
          layerObj.fireHistorySelectIndex = this.state.fireHistorySelectIndex;
        }

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
        {!layer.middleLabel ? null : <div className='layer-checkbox-label'>{layer.middleLabel}</div>}
        {!layer.sublabel ? null : <div className='layer-checkbox-sublabel'>{layer.sublabel}</div>}
        {!layer.metadataId ? null :
          <span className={`info-icon pointer ${this.state.iconLoading === this.props.layer.id ? 'iconLoading' : ''}`} onClick={this.showInfo.bind(this)}>
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
    layerActions.showLoading(layer.id);
    modalActions.showLayerInfo(this.props.layer.id);
  }

  toggleLayer () {
    let { layer, activeLayers } = this.props;
    if (layer.disabled) { return; }

    if (this.props.checked) {
      if (layer.id === 'activeFires' || layer.id === 'viirsFires') {
        activeLayers.forEach(activeLayer => {
          if (activeLayer.indexOf(layer.id) > -1) {
            LayersHelper.hideLayer(activeLayer);
            layerActions.removeActiveLayer(activeLayer);
          }
        });
      } else {
        layerActions.removeActiveLayer(layer.id);
      }
    } else {
      if (layer.id === 'activeFires' || layer.id === 'viirsFires') {
        const layerIndex = layerPanelText.firesOptions[layer.id === 'activeFires' ? this.state.firesSelectIndex : this.state.viiirsSelectIndex].value;
        const addLayer = `${layer.id}${layerIndex === 1 ? '' : layerIndex}`;

        layerActions.addActiveLayer(addLayer);
        LayersHelper.showLayer(addLayer);
      } else {
        layerActions.addActiveLayer(layer.id);
      }
    }
  }

}

