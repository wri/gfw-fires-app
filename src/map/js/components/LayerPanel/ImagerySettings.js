import LayersHelper from 'helpers/LayersHelper';
import {mapStore} from 'stores/MapStore';
import {layerActions} from 'actions/LayerActions';
import KEYS from 'js/constants';
import React from 'react';


export default class ImagerySettings extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = mapStore.getState();
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.footprintsVisible !== this.state.footprintsVisible) {
      if (this.state.footprintsVisible) {
        console.log('showing');

        let layerObj = {};
        layerObj.layerId = KEYS.boundingBoxes;
        layerObj.footprints = this.state.footprints;
        LayersHelper.showLayer(layerObj);
        // LayersHelper.showLayer(KEYS.boundingBoxes);
      } else {
        console.log('hidingg');
        LayersHelper.hideLayer(KEYS.boundingBoxes);
      }
    }
  }

  render () {
    return <div className={`layer-checkbox relative ${this.state.footprintsVisible ? ' active' : ''}`} >
      <span onClick={this.toggleFootprints.bind(this)} className='toggle-switch pointer'><span/></span>
      <span onClick={this.toggleFootprints.bind(this)} className='layer-checkbox-label pointer'>Display Footprints</span>
    </div>;
  }

  toggleFootprints() {
    // this.setState({
    //   checked: evt.target.checked
    // });
    layerActions.toggleFootprintsVisibility();
  }

}
