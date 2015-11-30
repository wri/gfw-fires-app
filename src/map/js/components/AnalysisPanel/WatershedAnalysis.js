import CustomAnalysisLink from 'components/AnalysisPanel/CustomAnalysisLink';
import WatershedSummary from 'components/AnalysisPanel/WatershedSummary';
import WatershedChart from 'components/AnalysisPanel/WatershedChart';
import LossFootnote from 'components/AnalysisPanel/LossFootnote';
import {analysisPanelText as text} from 'js/config';
import React from 'react';

// Temporary for the Prototype
let runReport = () => {
  window.open('http://data.wri.org/gfw-water/sample-report.pdf');
};

let WatershedAnalysis = props => {
  return (
    <div className={`watershed-analysis ${props.active ? '' : 'hidden'}`}>
      {!props.activeWatershed ? <p className='analysis-placeholder'>{text.watershedTabPlaceholder}</p> :
        <div>
          <div className='feature-title'>{text.getWatershedTitle(props.activeWatershed)}</div>
          <WatershedSummary />
          <WatershedChart id='currentWatershedChart' feature={props.activeWatershed} />
          <LossFootnote />
          <CustomAnalysisLink />
          <div className='full-report-button gfw-btn blue pointer' onClick={runReport}>{text.fullReportButton}</div>
        </div>
      }
    </div>
  );
};

export { WatershedAnalysis as default };
