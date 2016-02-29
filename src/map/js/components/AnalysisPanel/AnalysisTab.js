import {analysisPanelText} from 'js/config';
import {analysisActions} from 'actions/AnalysisActions';
import AnalysisComponent from 'components/LayerPanel/AnalysisComponent';
import React from 'react';

export default class AnalysisTab extends React.Component {

  constructor (props) {
    super(props);
  }

  componentDidMount () {
    let calendar = new window.Kalendae(this.refs.date, {
      mode: 'range'
    });
    calendar.subscribe('change', function (date) {
      console.debug(date);
    });
  }

  render () {
    let className = 'text-center';
    if (this.props.activeTab !== analysisPanelText.analysisTabId) { className += ' hidden'; }
    return (
      <div className={className}>
        <p>{analysisPanelText.analysisAreaHeader}</p>
        <div className='flex flex-justify-around'>
          <label>
            <input onChange={analysisActions.toggleAreaIslandsActive} checked={this.props.areaIslandsActive} type='radio' />
            {' By Island(s)'}
          </label>
          <label>
            <input onChange={analysisActions.toggleAreaIslandsActive} checked={!this.props.areaIslandsActive} type='radio' />
            {' By Province(s)'}
          </label>
        </div>
        <div className='padding'>
          <select className={`fill__wide ${this.props.areaIslandsActive === true ? '' : 'hidden'}`} multiple onChange={this.change} disabled={this.props.islands.length === 0}>
            {this.props.islands.map((i) => (
              <option value={i}>{i}</option>
            ))}
          </select>
          <select className={`fill__wide ${this.props.areaIslandsActive === false ? '' : 'hidden'}`} multiple onChange={this.change} disabled={this.props.provinces.length === 0}>
            {this.props.provinces.map((p) => (
              <option value={p}>{p}</option>
            ))}
          </select>
        </div>
        <p>{analysisPanelText.analysisTimeframeHeader}</p>
        <AnalysisComponent {...this.state} domId={analysisPanelText.analysisCalendar.domId} startDate={analysisPanelText.analysisCalendar.startDate} currentDate={analysisPanelText.analysisCalendar.currentDate} domClass={analysisPanelText.analysisCalendar.domClass} />
        <div className='no-shrink analysis-footer text-center'>
          <button onClick={this.beginAnalysis.bind(this)} className='gfw-btn blue'>{analysisPanelText.analysisButtonLabel}</button>
        </div>
      </div>
    );
  }

  beginAnalysis (props) {
    app.debug('AnalysisTab >>> beginAnalysis');
    console.log(this.state);
  }

}
