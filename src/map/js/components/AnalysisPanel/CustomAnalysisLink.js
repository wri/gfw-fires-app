import {analysisActions} from 'actions/AnalysisActions';
import {analysisPanelText as text} from 'js/config';
import React from 'react';

let CustomAnalysisLink = () => {
  return (
    <div className='custom-analysis-link flex'>
      <span className='custom-analysis-link-label'>{text.customAnalysisText}</span>
      <span className='gfw-link pointer' onClick={analysisActions.setAnalysisType.bind(this, text.customTabId)}>{text.customAnalysisLink}</span>
    </div>
  );
};

export { CustomAnalysisLink as default };
