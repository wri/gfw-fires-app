import TabControls from 'components/AnalysisPanel/TabControls';
import AnalysisTab from 'components/AnalysisPanel/AnalysisTab';
import SubscriptionTab from 'components/AnalysisPanel/SubscriptionTab';
import {analysisActions} from 'actions/AnalysisActions';
import {analysisPanelText as text} from 'js/config';
import {analysisStore} from 'stores/AnalysisStore';
import {modalActions} from 'actions/ModalActions';
import React from 'react';

let removeSvg = '<use xlink:href="#icon-remove" />';

export default class AnalysisTools extends React.Component {

  constructor (props) {
    super(props);
    analysisActions.setAreas();
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
    } else {
      analysisActions.clearActiveWatershed();
    }
  }

  render () {
    let customTabActive = this.state.activeTab === text.subscriptionTabId;
    let watershedTabActive = this.state.activeTab === text.analysisTabId;
    let className = 'analysis-tools map-component shadow'
    if (app.mobile() === true && this.state.analysisToolsVisible === false) { className += ' hidden'; };

    return (
      <div className={className}>
        <TabControls activeTab={this.state.activeTab} />
        <div className='tab-container custom-scroll'>
          <AnalysisTab {...this.state} />
          <SubscriptionTab {...this.state} />
        </div>
      </div>
    );
  }

}
