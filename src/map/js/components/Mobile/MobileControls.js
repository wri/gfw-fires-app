import {layerActions} from 'actions/LayerActions'
import {analysisActions} from 'actions/AnalysisActions'
import {mapStore} from 'stores/MapStore';
import {analysisStore} from 'stores/AnalysisStore';
import {analysisPanelText} from 'js/config';
import {AlertsSvg, AnalysisSvg, BasemapSvg, CalendarSvg} from 'utils/svgs';
import React from 'react';

export default class Map extends React.Component {
  constructor (props) {
    super(props);
    this.state = {};
  }

  toggleAnalysis () {
    // set analysis active
    // if hidden show
    analysisActions.setAnalysisType.bind(this, text.subscriptionTabId)
    // analysisActions.toggleAnalysisToolsVisibility();
  }

  toggleSubscription () {
    // set subscription active
    analysisActions.setAnalysisType.bind(this, text.subscriptionTabId)
    // if hidden show
    // analysisActions.toggleAnalysisToolsVisibility();
  }


  render () {
    return (
      <div id='mobile-controls' className='mobile-controls mobile-show'>
        <button onClick={layerActions.toggleLayerPanelVisibility}>
          <BasemapSvg />
          Layers
        </button>
        <button onClick={analysisActions.toggleAnalysisToolsVisibility}>
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
