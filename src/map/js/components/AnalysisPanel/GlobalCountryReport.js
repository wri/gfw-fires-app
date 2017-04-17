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
    this.state = {
      localErrors: false,
      currentCountry: '',
      ...mapStore.getState() };
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

    $('#countries').on('change', (evt) => {
      this.applyCountryFilter(evt);
    });
  }

  componentDidUpdate (prevProps, prevState) {
    $('#global-adm1').chosen('destroy');
    $('#global-adm1').chosen();
    if (prevProps.countries.length === 0 && this.props.countries.length > 0) {
      $('#countries').chosen();
    } else if (this.props.customizeCountryOpen === true && prevProps.customizeCountryOpen === false) {
      $('#countries').chosen('destroy');
      $('#countries').chosen();
    }
  }

  render () {
    let className = 'text-center';
    let adm1Units = null;
    let adm1Classes = 'hidden'

    let countriesList = null;
    if (this.props.countries.length > 0) {
      countriesList = this.props.countries.map((country) => {
        return (<option value={country}>{country}</option>);
      });
    }

    if (this.state.currentCountry) {
      adm1Classes = 'padding';
      let adm1Areas = this.props.adm1.filter((o) => { return o.NAME_0 === this.state.currentCountry; });
      adm1Areas.sort();
      adm1Units = adm1Areas.map((adm1) => {
        return (<option value={adm1.NAME_1}>{adm1.NAME_1}</option>);
      });
    }

    return (
      <div className={className}>
        <h4>{analysisPanelText.globalReportTitle}</h4>
        <p className='customize-report-label' onClick={this.toggleCustomize}>{analysisPanelText.analysisCustomize}
          <span className='analysis-toggle'>{this.props.customizeCountryOpen ? ' ▼' : ' ►'}</span>
        </p>
        <div className={`customize-options ${this.props.customizeCountryOpen === true ? '' : 'hidden'}`}>
          <div className={'padding'}>
            <p>Select a country: </p>
            <select id='countries' className={`chosen-select-no-single fill__wide`} >
              {countriesList}
            </select>
          </div>
          <div className={adm1Classes}>
            <p>Select {this.state.currentCountry}&#39;s subregions: </p>
            <select id='global-adm1' multiple className={`chosen-select-no-single fill__wide`}>
              {adm1Units}
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

  applyCountryFilter (evt) {
    let country = this.props.countries[evt.target.selectedIndex];
    this.setState({ currentCountry: country });
    $('#global-adm1').val('').trigger('chosen:updated');
  }

  toggleCustomize () {
    analysisActions.toggleCountryCustomize();
  }

  clearAll () {
    this.setState({ currentCountry: '' });
    $('#global-adm1').val('').trigger('chosen:updated');
    $('#countries').val('').trigger('chosen:updated');
  }

  countryAnalysis () {
    app.debug('AnalysisTab >>> countryAnalysis');

    let reportType = 'globalcountryreport',
        countries = $('#countries').chosen().val(),
        regions = $('#global-adm1').chosen().val(),
        reportdateFrom = this.state.analysisStartDate.split('/'),
        reportdateTo = this.state.analysisEndDate.split('/'),
        reportdates = {};

    reportdates.fYear = Number(reportdateFrom[2]);
    reportdates.fMonth = Number(reportdateFrom[0]);
    reportdates.fDay = Number(reportdateFrom[1]);
    reportdates.tYear = Number(reportdateTo[2]);
    reportdates.tMonth = Number(reportdateTo[0]);
    reportdates.tDay = Number(reportdateTo[1]);

    let hash = this.reportDataToHash(reportType, reportdates, countries, regions);
    let win = window.open('../report/index.html' + hash, '_blank', '');

    win.report = true;
    win.reportOptions = {
      'dates': reportdates,
      'countries': countries,
      'reportType': reportType
    };
  }

  reportDataToHash (reportType, dates, country, countryRegions) {
    let hash = '#';
    let reportTypeString = 'reporttype=' + reportType;
    let countryString = 'country=' + country;

    let countryRegionString = 'countryRegions=' + countryRegions.join('!');

    let dateArgs = [];
    let dateString = 'dates=';
    for (let val in dates) {
      if (dates.hasOwnProperty(val)) {
        dateArgs.push([val, dates[val]].join('-'));
      }
    }
    dateString += dateArgs.join('!');

    hash += [reportTypeString, countryString, countryRegionString, dateString].join('&');
    return hash;
  }
}

GlobalCountryReport.propTypes = {
  customizeCountryOpen: React.PropTypes.bool.isRequired,
  countries: React.PropTypes.array
};
