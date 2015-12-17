import React from 'react';
import {mapStore} from 'stores/MapStore';
import {analysisStore} from 'stores/AnalysisStore';
import {layerActions} from 'actions/LayerActions';
import {analysisActions} from 'actions/AnalysisActions';

export default class Map extends React.Component {
  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    analysisStore.listen(this.storeUpdated.bind(this));
    this.state = {
      mapStore: mapStore.getState(),
      analysisStore: analysisStore.getState()
    };
  }

  storeUpdated () {
    this.setState({
      mapStore: mapStore.getState(),
      analysisStore: analysisStore.getState()
    });
  }

  closeMobileControls () {
    if (mapStore.getState().layerPanelVisible === true) { layerActions.toggleLayerPanelVisibility(); };
    if (analysisStore.getState().esriSearchVisible === true) { analysisActions.toggleEsriSearchVisibility(); };
    if (analysisStore.getState().analysisToolsVisible === true) { analysisActions.toggleAnalysisToolsVisiblity(); };
  }

  render () {
    let className = 'mobile-underlay mobile-show';
    if (app.mobile() === true) {
      if (this.state.mapStore.layerPanelVisible === false &&
          this.state.analysisStore.esriSearchVisible === false &&
          this.state.analysisStore.analysisToolsVisible === false) {
        className += ' hidden';
      };
    };

    return (
      <div id='mobile-underlay' className={className} onClick={this.closeMobileControls}></div>
    );
  }

}
