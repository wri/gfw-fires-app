import {analysisPanelText} from 'js/config';
import {analysisActions} from 'actions/AnalysisActions';
import {mapStore} from 'stores/MapStore';
import AnalysisComponent from 'components/LayerPanel/AnalysisComponent';
import React from 'react';
import Chosen from 'chosen';

export default class AnalysisTab extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    // this.state = mapStore.getState();
    this.state = { localErrors: false, ...mapStore.getState() };
  }

  storeUpdated () {
    this.setState(mapStore.getState());
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
    if (prevProps.islands.length === 0 && this.props.islands.length > 0) {
      $('#islands').chosen();
    } else if (prevProps.areaIslandsActive === false && this.props.areaIslandsActive === true) {
      $('#provinces').chosen('destroy');
      $('#islands').chosen();
    } else if (prevProps.areaIslandsActive === true && this.props.areaIslandsActive === false) {
      $('#islands').chosen('destroy');
      $('#provinces').chosen();
    } else if (this.props.customizeOpen === true && prevProps.customizeOpen === false && this.props.areaIslandsActive === true) {
      $('#islands').chosen('destroy');
      $('#islands').chosen();
    } else if (this.props.customizeOpen === true && prevProps.customizeOpen === false && this.props.areaIslandsActive === false) {
      $('#provinces').chosen('destroy');
      $('#provinces').chosen();
    }
  }

  toggleCustomize () {
    analysisActions.toggleCustomize();
  }

  clearAll () {
    if (this.props.areaIslandsActive === true) {
      $('#islands').val('').trigger('chosen:updated');
    } else {
      $('#provinces').val('').trigger('chosen:updated');
    }
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
        <p className='customize-report-label' onClick={this.toggleCustomize}>{analysisPanelText.analysisCustomize}
          <span className='analysis-toggle'>{this.props.customizeOpen ? ' ▼' : ' ►'}</span>
        </p>
        <div className={`customize-options ${this.props.customizeOpen === true ? '' : 'hidden'}`}>
          <p>{analysisPanelText.analysisChoose}</p>
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
                <option selected='true' value={i}>{i}</option>
              ))}
            </select>
            : null
          }
          {this.props.islands.length > 0 ?
            <select multiple id='provinces' className={`chosen-select-no-single fill__wide ${this.props.areaIslandsActive === false ? '' : 'hidden'}`} onChange={this.change}>
              {this.props.provinces.map((p) => (
                <option selected='true' value={p}>{p}</option>
              ))}
            </select>
            : null
          }
          </div>
          <button onClick={this.clearAll.bind(this)} className='gfw-btn blue'>{analysisPanelText.analysisButtonClear}</button>
          <p>{analysisPanelText.analysisTimeframeHeader}</p>
          <AnalysisComponent {...this.state} options={analysisPanelText.analysisCalendar} />
          <div id='analysisWarning' className={`analysis-warning ${this.state.localErrors === false ? 'hidden' : ''}`}>Please select an island or province</div>
        </div>
        <div className='no-shrink analysis-footer text-center'>
          <button onClick={this.beginAnalysis.bind(this)} className='gfw-btn blue'>{analysisPanelText.analysisButtonLabel}</button>
        </div>
      </div>
    );
  }

  beginAnalysis () {
    app.debug('AnalysisTab >>> beginAnalysis');
    let provinces;
    let aoiType;

    if (this.props.areaIslandsActive) {
      provinces = $('#islands').chosen().val();
      aoiType = 'ISLAND';
    } else {
      provinces = $('#provinces').chosen().val();
      aoiType = 'PROVINCE';
    }

    if (!provinces) {
      this.setState({
        localErrors: true
      });
      return;
    } else {
      this.setState({
        localErrors: false
      });
    }

    this.sendAnalytics('analysis', 'request', 'The user ran the Fires Analysis.');

    let reportdateFrom = this.state.analysisStartDate.split('/');
    let reportdateTo = this.state.analysisEndDate.split('/');

    let reportdates = {};

    reportdates.fYear = Number(reportdateFrom[2]);
    reportdates.fMonth = Number(reportdateFrom[0]);
    reportdates.fDay = Number(reportdateFrom[1]);
    reportdates.tYear = Number(reportdateTo[2]);
    reportdates.tMonth = Number(reportdateTo[0]);
    reportdates.tDay = Number(reportdateTo[1]);

    let hash = this.reportDataToHash(aoiType, reportdates, provinces);
    let win = window.open('../report/index.html' + hash, '_blank', '');

    win.report = true;
    win.reportOptions = {
      'dates': reportdates,
      'aois': provinces,
      'aoitype': aoiType
    };
  }

  reportDataToHash (aoitype, dates, aois) {
    let hash = '#',
      dateargs = [],
      datestring,
      aoistring;


    for (let val in dates) {
      if (dates.hasOwnProperty(val)) {
        dateargs.push([val, dates[val]].join('-'));
      }
    }

    datestring = 'dates=' + dateargs.join('!');

    aoistring = 'aois=' + aois.join('!');

    hash += ['aoitype=' + aoitype, datestring, aoistring].join('&');

    return hash;
  }

}

AnalysisTab.propTypes = {
  activeTab: React.PropTypes.string.isRequired,
  areaIslandsActive: React.PropTypes.bool.isRequired,
  customizeOpen: React.PropTypes.bool.isRequired,
  islands: React.PropTypes.array.isRequired,
  provinces: React.PropTypes.array.isRequired
};
