import {analysisPanelText} from 'js/config';
import React from 'react';

export default class SubscriptionTab extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {
    let className = 'text-center';
    if (this.props.activeTab !== analysisPanelText.subscriptionTabId) { className += ' hidden'; };

    return (
      <div className={className}>
        TODO: subscription ui
        <div className='no-shrink analysis-footer text-center'>
          <button className='gfw-btn blue'>{analysisPanelText.subscriptionButtonLabel}</button>
        </div>
      </div>
    );
  }

}
