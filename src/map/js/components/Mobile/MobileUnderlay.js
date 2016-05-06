/* @flow */
import {mapStore} from 'stores/MapStore';
import {analysisStore} from 'stores/AnalysisStore';
import {layerActions} from 'actions/LayerActions';
import {analysisActions} from 'actions/AnalysisActions';
import React, {
  Component,
  PropTypes
} from 'react';

export default class MobileUnderlay extends Component {
  displayName: MobileUnderlay;
  state: any;

  static childContextTypes = {
    state: PropTypes.object
  };

  constructor (props: any) {
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
    if (mapStore.getState().layerPanelVisible === true) { layerActions.toggleLayerPanelVisibility(); }
    if (analysisStore.getState().esriSearchVisible === true) { analysisActions.toggleEsriSearchVisibility(); }
    if (analysisStore.getState().analysisToolsVisible === true) { analysisActions.toggleAnalysisToolsVisibility(); }
  }

  render () {
    let className = 'mobile-underlay mobile-show';
    if (app.mobile() === true) {
      if (this.state.mapStore.layerPanelVisible === false &&
          this.state.analysisStore.esriSearchVisible === false &&
          this.state.analysisStore.analysisToolsVisible === false &&
          this.state.analysisStore.timelineVisible === false) {
        className += ' hidden';
      }
    }

    return (
      <div id='mobile-underlay' className={className} onClick={this.closeMobileControls}></div>
    );
  }

}
