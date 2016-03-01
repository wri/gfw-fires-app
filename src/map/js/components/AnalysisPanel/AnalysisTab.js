import {analysisPanelText} from 'js/config';
import {analysisActions} from 'actions/AnalysisActions';
import AnalysisComponent from 'components/LayerPanel/AnalysisComponent';
import React from 'react';
import Chosen from 'chosen';

export default class AnalysisTab extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      activeIslands: [],
      activeProvinces: []
    };
  }

  componentDidMount () {
    let calendar = new window.Kalendae(this.refs.date, {
      mode: 'range'
    });
    calendar.subscribe('change', function (date) {
      console.debug(date);
    });

  }

  componentDidUpdate(prevProps, prevState) {

    if (prevProps.provinces.length === 0 && this.props.provinces.length > 0) {
      $('#provinces').chosen();
    } else if (prevProps.areaIslandsActive === true && this.props.areaIslandsActive === false) {
      $('#islands').chosen('destroy');
      $('#provinces').chosen();
    } else if (prevProps.areaIslandsActive === false && this.props.areaIslandsActive === true) {
      $('#provinces').chosen('destroy');
      $('#islands').chosen();
    }
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
        {this.props.islands.length > 0 ?
          <select multiple id='islands' className={`chosen-select-no-single fill__wide ${this.props.areaIslandsActive === true ? '' : 'hidden'}`} onChange={this.change} disabled={this.props.islands.length === 0}>
            {this.props.islands.map((i) => (
              <option value={i}>{i}</option>
            ))}
          </select>
          : null
        }
        {this.props.islands.length > 0 ?
          <select multiple id='provinces' className={`chosen-select-no-single fill__wide ${this.props.areaIslandsActive === false ? '' : 'hidden'}`} onChange={this.change}>
            {this.props.provinces.map((p) => (
              <option value={p}>{p}</option>
            ))}
          </select>
          : null
        }
        </div>
        <p>{analysisPanelText.analysisTimeframeHeader}</p>
        <AnalysisComponent {...this.state} options={analysisPanelText.analysisCalendar} />
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
