import {analysisPanelText} from 'js/config';
//import {analysisActions} from 'actions/AnalysisActions';
import {mapStore} from 'stores/MapStore';
import React from 'react';
import Chosen from 'chosen';

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
      <div className={className}>
        <h4>{analysisPanelText.analysisAreaTitle}</h4>
        <p>{analysisPanelText.analysisAreaHeader}</p>
        <GlobalCountryReport {...this.props} />
        <IndonesiaSpecialtyReport {...this.props} />
      </div>
    );
  }
}

AnalysisTab.propTypes = {
  activeTab: React.PropTypes.string.isRequired,
  areaIslandsActive: React.PropTypes.bool.isRequired,
  analysisSourceGFW: React.PropTypes.bool.isRequired,
  customizeOpen: React.PropTypes.bool.isRequired,
  islands: React.PropTypes.array.isRequired,
  provinces: React.PropTypes.array.isRequired
};
