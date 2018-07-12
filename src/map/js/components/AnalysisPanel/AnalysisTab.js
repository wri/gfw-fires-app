import {analysisPanelText} from 'js/config';
import {mapStore} from 'stores/MapStore';
import React from 'react';
import chosen from 'chosen';

import IndonesiaSpecialtyReport from 'components/AnalysisPanel/IndonesiaSpecialtyReport';
import GlobalCountryReport from 'components/AnalysisPanel/GlobalCountryReport';

export default class AnalysisTab extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = { localErrors: false, ...mapStore.getState() };
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  sendAnalytics (eventType, action, label) { //todo: why is this request getting sent so many times?
    ga('A.send', 'event', eventType, action, label);
    ga('B.send', 'event', eventType, action, label);
    ga('C.send', 'event', eventType, action, label);
  }

  render () {
    let className = 'text-center';
    if (this.props.activeTab !== analysisPanelText.analysisTabId) { className += ' hidden'; }
    return (
      <div className={className} >
        <h4 className="analysis__title">{analysisPanelText.analysisAreaTitle}</h4>
        <div>{analysisPanelText.analysisAreaHeader}</div>
        <div className='reports-container'>
          <GlobalCountryReport {...this.props} />
          <IndonesiaSpecialtyReport {...this.props} />
        </div>
      </div>
    );
  }
}

