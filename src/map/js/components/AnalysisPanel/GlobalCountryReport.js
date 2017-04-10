import {analysisPanelText} from 'js/config';
import {analysisActions} from 'actions/AnalysisActions';
import {mapStore} from 'stores/MapStore';
import AnalysisComponent from 'components/LayerPanel/AnalysisComponent';
import React from 'react';
import chosen from 'chosen';


export default class GlobalCountryReport extends React.Component {
  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
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

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.countries.length === 0 && this.props.countries.length > 0) {
      $('#countries').chosen();
    } else if (this.props.customizeCountryOpen === true && prevProps.customizeCountryOpen === false) {
      $('#countries').chosen('destroy');
      $('#countries').chosen();
    }
  }

  render () {
    let className = 'text-center';

    let countriesList = null;
    if (this.props.countries.length > 0) {
      countriesList = this.props.countries.map((country) => { return (<option value={country}>{country}</option>); });
    }

    return (
      <div className={className}>
        <h4>{analysisPanelText.globalReportTitle}</h4>
        <p className='customize-report-label' onClick={this.toggleCustomize}>{analysisPanelText.analysisCustomize}
          <span className='analysis-toggle'>{this.props.customizeCountryOpen ? ' ▼' : ' ►'}</span>
        </p>
        <div className={`customize-options ${this.props.customizeCountryOpen === true ? '' : 'hidden'}`}>
          <p>{analysisPanelText.analysisCountryChooseData}</p>
          <div className={'padding'}>
            <select multiple id='countries' className={`chosen-select-no-single fill__wide`}>
              {countriesList}
            </select>
          </div>
          <button onClick={this.clearAll.bind(this)} className='gfw-btn blue'>{analysisPanelText.analysisButtonClear}</button>
          <p>{analysisPanelText.analysisTimeframeHeader}</p>
          <AnalysisComponent {...this.state} options={analysisPanelText.analysisCalendar} />
          <div className='no-shrink analysis-footer text-center'>
            <button onClick={this.countryAnalysis.bind(this)} className='gfw-btn blue'>{analysisPanelText.analysisButtonLabel}</button>
          </div>
        </div>
      </div>
    );
  }

  toggleCustomize () {
    analysisActions.toggleCountryCustomize();
  }

  clearAll () {
    $('#countries').val('').trigger('chosen:updated');
  }

  countryAnalysis () {
    app.debug('AnalysisTab >>> countryAnalysis');

    let reportType = 'globalcountries',
        countries = $('#countries').chosen().val(),
        reportdateFrom = this.state.analysisStartDate.split('/'),
        reportdateTo = this.state.analysisEndDate.split('/'),
        reportdates = {};

    reportdates.fYear = Number(reportdateFrom[2]);
    reportdates.fMonth = Number(reportdateFrom[0]);
    reportdates.fDay = Number(reportdateFrom[1]);
    reportdates.tYear = Number(reportdateTo[2]);
    reportdates.tMonth = Number(reportdateTo[0]);
    reportdates.tDay = Number(reportdateTo[1]);

    let hash = this.reportDataToHash(reportType, reportdates, countries);
    let win = window.open('../report/index.html' + hash, '_blank', '');

    win.report = true;
    win.reportOptions = {
      'dates': reportdates,
      'countries': countries,
      'reportType': reportType
    };
  }

  reportDataToHash (reportType, dates, countries) {
    let hash = '#';
    let dateArgs = [];
    let dateString = '';
    let countriesString = '';
    let reportTypeString = '';

    for (let val in dates) {
      if (dates.hasOwnProperty(val)) {
        dateArgs.push([val, dates[val]].join('-'));
      }
    }

    dateString = 'dates=' + dateArgs.join('!');
    countriesString = 'countries=' + countries.join('!');
    reportTypeString = 'reporttype=' + reportType;

    hash += [dateString, countriesString, reportTypeString].join('&');
    return hash;
  }
}

GlobalCountryReport.propTypes = {
  customizeCountryOpen: React.PropTypes.bool.isRequired,
  countries: React.PropTypes.array
};
