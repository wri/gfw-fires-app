import {layerActions} from 'actions/LayerActions'
import {analysisActions} from 'actions/AnalysisActions'
import {mapStore} from 'stores/MapStore';
import {analysisStore} from 'stores/AnalysisStore';
import React from 'react';

export default class Map extends React.Component {
  constructor (props) {
    super(props);
    this.state = {};
  }

  render () {
    return (
      <div id='mobile-controls' className='mobile-controls mobile-show'>
        <button onClick={layerActions.toggleLayerPanelVisibility}> Layers </button>
        <button onClick={analysisActions.toggleAnalysisToolsVisiblity}> Analyze Fires </button>
      </div>
    );
  }

}
