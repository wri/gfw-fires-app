import {analysisActions} from 'actions/AnalysisActions';
import {analysisPanelText as text} from 'js/config';
import React from 'react';

let TabControls = props => {
  let styles = { left: (props.activeTab === text.watershedTabId ? 0 : '50%') };
  return (
    <div className='no-shrink tabs'>
      <div className={`gfw-btn pointer inline-block ${props.activeTab === text.watershedTabId ? 'active' : ''}`}
        onClick={analysisActions.setAnalysisType.bind(this, text.watershedTabId)}>
        {text.watershedTabLabel}
      </div>
      <div className={`gfw-btn pointer inline-block ${props.activeTab === text.customTabId ? 'active' : ''}`}
      onClick={analysisActions.setAnalysisType.bind(this, text.customTabId)}>
        {text.customTabLabel}
      </div>
      <div className='tab-indicator relative' style={styles}></div>
    </div>
  );
};

export { TabControls as default };
