import {analysisActions} from 'actions/AnalysisActions';
import {analysisPanelText as text} from 'js/config';
import React from 'react';

let analysisSvg = '<use xlink:href="#icon-analysis" />';
let alertsSvg = '<use xlink:href="#icon-alerts" />';

let TabControls = props => {
  let styles = { left: (props.activeTab === text.analysisTabId ? 0 : '50%') };
  return (
    <div className='no-shrink tabs'>
      <div className={`gfw-btn pointer inline-block ${props.activeTab === text.analysisTabId ? 'active' : ''}`}
        onClick={analysisActions.setAnalysisType.bind(this, text.analysisTabId)}>
        <svg dangerouslySetInnerHTML={{ __html: analysisSvg }}/>
        {text.analysisTabLabel}
      </div>
      <div className={`gfw-btn pointer inline-block ${props.activeTab === text.subscriptionTabId ? 'active' : ''}`}
        onClick={analysisActions.setAnalysisType.bind(this, text.subscriptionTabId)}>
        <svg dangerouslySetInnerHTML={{ __html: alertsSvg }}/>
        {text.subscriptionTabLabel}
      </div>
      <div className='tab-indicator relative' style={styles}></div>
    </div>
  );
};

export { TabControls as default };
