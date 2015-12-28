import {layerActions} from 'actions/LayerActions'
import {analysisActions} from 'actions/AnalysisActions'
import {mapStore} from 'stores/MapStore';
import {analysisStore} from 'stores/AnalysisStore';
import {AlertsSvg, AnalysisSvg, BasemapSvg, CalendarSvg} from 'utils/svgs';
import React from 'react';

export default class Map extends React.Component {
  constructor (props) {
    super(props);
    this.state = {};
  }

  render () {
    return (
      <div id='mobile-controls' className='mobile-controls mobile-show'>
        <button onClick={layerActions.toggleLayerPanelVisibility}>
          <BasemapSvg />
          Layers
        </button>
        <button onClick={analysisActions.toggleAnalysisToolsVisiblity}>
          <AnalysisSvg />
          Analyze Fires
        </button>
        <button>
          <AlertsSvg />
          Subscribe
        </button>
        <button>
          <CalendarSvg />
          Timeline
        </button>
      </div>
    );
  }

}
