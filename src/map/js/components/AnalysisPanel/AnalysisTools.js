import TabControls from 'components/AnalysisPanel/TabControls';
import AnalysisTab from 'components/AnalysisPanel/AnalysisTab';
import SubscriptionTab from 'components/AnalysisPanel/SubscriptionTab';
import ImageryTab from 'components/AnalysisPanel/ImageryTab';
import BasemapTab from 'components/AnalysisPanel/BasemapTab';
import {analysisActions} from 'actions/AnalysisActions';
import {analysisPanelText as text} from 'js/config';
import {analysisStore} from 'stores/AnalysisStore';
import React from 'react';

export default class AnalysisTools extends React.Component {

  constructor (props) {
    super(props);
    analysisActions.initAreas();
    analysisStore.listen(this.storeUpdated.bind(this));
    let defaultState = analysisStore.getState();
    this.state = defaultState;
  }

  storeUpdated () {
    let newState = analysisStore.getState();
    this.setState(newState);
  }

  clearAnalysis () {
    if (this.state.activeTab === text.subscriptionTabId) {
      analysisActions.clearCustomArea();
    }
  }

  render () {
    let className = 'analysis-tools map-component shadow';
    if (this.state.analysisToolsVisible === false) { className += ' hidden'; }
    if (app.mobile() === true) { className += ' isMobileTools'; }

    return (
      <div className={className}>
        {app.mobile() === true ? undefined :
          <TabControls {...this.state} />
        }
        <div className={`tab-container custom-scroll ${app.mobile() === false && this.state.analysisToolsExpanded === false ? 'hidden' : '' }`}>
          <AnalysisTab {...this.state} />
          <SubscriptionTab {...this.state} />
          <ImageryTab {...this.state} />
          <BasemapTab {...this.state} />
        </div>
      </div>
    );
  }

}
