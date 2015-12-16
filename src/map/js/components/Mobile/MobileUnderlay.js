import React from 'react';
import {Motion, spring} from 'react-motion';
import {mapStore} from 'stores/MapStore';
import {analysisStore} from 'stores/AnalysisStore';

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

  render () {
    let className = 'mobile-underlay mobile-show';
    if (app.mobile === true) {
      if (this.state.mapStore.layerPanelVisible === false && this.state.analysisStore.analysisToolsVisible === false) {
        className += ' hidden';
      };
    };

    return (
      <div id='mobile-underlay' className={className}></div>
    );
  }

}
