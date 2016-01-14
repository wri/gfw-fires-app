import {analysisActions} from 'actions/AnalysisActions';
import {analysisPanelText as text} from 'js/config';
import {AlertsSvg, AnalysisSvg} from 'utils/svgs';
import React from 'react';

export default class TabControls extends React.Component {

  click (tabId) {
   analysisActions.setAnalysisType(tabId);
    if (this.props.activeTab === tabId) { analysisActions.toggleAnalysisToolsExpanded(); }
    else if (this.props.analysisToolsExpanded === false) { analysisActions.toggleAnalysisToolsExpanded(); }
  }

  render () {
    let styles = {
      left: (this.props.activeTab === text.analysisTabId ? 0 : '50%'),
      opacity: (this.props.analysisToolsExpanded === false ? 0 : 1)
    };

    return (
      <div className='no-shrink tabs'>
        <div className={`gfw-btn pointer inline-block ${this.props.analysisToolsExpanded !== false && this.props.activeTab === text.analysisTabId ? 'active' : ''}`}
          onClick={this.click.bind(this, text.analysisTabId)}>
          <AnalysisSvg />
          {text.analysisTabLabel}
        </div>
        <div className={`gfw-btn pointer inline-block ${this.props.analysisToolsExpanded !== false && this.props.activeTab === text.subscriptionTabId ? 'active' : ''}`}
          onClick={this.click.bind(this, text.subscriptionTabId)}>
          <AlertsSvg />
          {text.subscriptionTabLabel}
        </div>
        <div className='tab-indicator relative' style={styles}></div>
      </div>
    );
  }

}
