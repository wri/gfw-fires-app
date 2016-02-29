import {analysisPanelText} from 'js/config';
import React from 'react';
// import {AlertsSvg, AnalysisSvg, ImagerySvg} from 'utils/svgs';

export default class SubscriptionTab extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {
    let className = 'text-center';
    if (this.props.activeTab !== analysisPanelText.subscriptionTabId) { className += ' hidden'; }

    return (
      <div className={className}>
        <div className='no-shrink analysis-footer text-center'>
          <p>{analysisPanelText.subscriptionInstructions}</p>
          <div>Image goes here</div>
          <button className='gfw-btn blue'>{analysisPanelText.subscriptionButtonLabel}</button>
          <p className='drop-shapefile'>{analysisPanelText.subscriptionShapefile}</p>
          <p>{analysisPanelText.subscriptionClick}</p>
        </div>
      </div>
    );
  }

}
