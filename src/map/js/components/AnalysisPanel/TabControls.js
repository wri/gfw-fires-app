import {analysisActions} from 'actions/AnalysisActions';
import {analysisPanelText as text} from 'js/config';
import React from 'react';

let TabControls = props => {
  let styles = { left: (props.activeTab === text.areaTabId ? 0 : '50%') };
  return (
    <div className='no-shrink tabs'>
      <div className={`gfw-btn pointer inline-block ${props.activeTab === text.areaTabId ? 'active' : ''}`}
        onClick={analysisActions.setAnalysisType.bind(this, text.areaTabId)}>
        {text.areaTabLabel}
      </div>
      <div className={`gfw-btn pointer inline-block ${props.activeTab === text.timeframeTabId ? 'active' : ''}`}
        onClick={analysisActions.setAnalysisType.bind(this, text.timeframeTabId)}>
        {text.timeframeLabel}
      </div>
      <div className='tab-indicator relative' style={styles}></div>
    </div>
  );
};

export { TabControls as default };
