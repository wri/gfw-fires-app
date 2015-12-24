import {analysisPanelText} from 'js/config';
import React from 'react';

export default class AnalysisTimeframe extends React.Component {

  constructor (props) {
    super(props);
  }

  componentDidMount () {
    let calendar = new window.Kalendae(this.refs.date, {
      mode: 'range'
    })
    calendar.subscribe('change', function (date) {
      console.debug(date);
    });
  }

  render () {
    let className = 'text-center';
    if (this.props.activeTab === analysisPanelText.areaTabId) { className += ' hidden'; };

    return (
      <div className={className}>
        <p>Select timeframe of interest:</p>
        <div ref='date'></div>
      </div>
    );
  }

}
