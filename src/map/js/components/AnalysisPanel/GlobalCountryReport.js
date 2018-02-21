import {analysisPanelText} from 'js/config';
import {analysisActions} from 'actions/AnalysisActions';
import {mapStore} from 'stores/MapStore';
import AnalysisComponent from 'components/LayerPanel/AnalysisComponent';
import React from 'react';
import Select from 'react-select';


export default class GlobalCountryReport extends React.Component {
  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = {
      localErrors: false,
      currentCountry: null,
      selectedGlobalCoutry: '',
      selectedSubRegion: '',
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
  }

  render () {
    const countriesList = this.props.countries.map(country => {
      return {
        value: country,
        label: country
      };
    });
    // A default select option
    countriesList.unshift({
      value: '',
      label: 'Select a Country'
    });


    const countrySubRegions = this.props.adm1.filter(o => o.NAME_0 === this.state.selectedGlobalCoutry);
    countrySubRegions.sort((a, b) => {
      if (a.NAME_1 < b.NAME_1) {
        return -1;
      }
      if (a.NAME_1 > b.NAME_1) {
        return 1;
      }
      return 0;
    });

    const countrySubRegionsList = countrySubRegions.map(state => {
      return {
        value: state.NAME_1,
        label: state.NAME_1
      };
    });

    return (
      <div className='report-width'>
        <h4 className="country-report__title">{analysisPanelText.globalReportTitle}</h4>
        <div className={'padding'}>
          <Select
            value={this.state.selectedGlobalCoutry}
            onChange={this.handleGlobalCountryChange.bind(this)}
            multi={false}
            options={countriesList}
          />
        </div>
        <p className='customize-report-label' onClick={this.toggleCustomize}>{analysisPanelText.analysisCustomize}
          <span className='analysis-toggle'>{this.props.customizeCountryOpen ? ' ▼' : ' ►'}</span>
        </p>
        <div className={`customize-options ${this.props.customizeCountryOpen === true ? '' : 'hidden'}`}>
          <div className='padding'>
            <p>Select {this.state.currentCountry}&#39;s subregions: </p>
            <Select
              placeholder='Select a Country'
              onChange={this.handleSubRegionChange.bind(this)}
              options={countrySubRegionsList}
              multi={true}
              value={this.state.selectedSubRegion}
            />
          </div>
          <button onClick={this.clearSubregions.bind(this)} className='gfw-btn blue'>{analysisPanelText.analysisButtonClear}</button>
          <p>{analysisPanelText.analysisTimeframeHeader}</p>
          <AnalysisComponent {...this.state} options={analysisPanelText.analysisCalendar} />
        </div>
        <div className='no-shrink analysis-footer text-center'>
          <button onClick={this.countryAnalysis.bind(this)} className='gfw-btn blue'>{analysisPanelText.analysisButtonLabel}</button>
        </div>
      </div>
    );
  }

  handleSubRegionChange (selected) {
    this.setState({ selectedSubRegion: selected });
  }

  handleGlobalCountryChange (selected) {
    this.setState({selectedGlobalCoutry: selected.value}, () => {
      const countrySubRegions = this.props.adm1.filter(o => o.NAME_0 === selected.value);
      countrySubRegions.sort((a, b) => {
        if (a.NAME_1 < b.NAME_1) {
          return -1;
        }
        if (a.NAME_1 > b.NAME_1) {
          return 1;
        }
        return 0;
      });

      const countrySubRegionsList = countrySubRegions.map(state => {
        return {
          value: state.NAME_1,
          label: state.NAME_1
        };
      });

      this.setState({ selectedSubRegion: countrySubRegionsList});
    });
  }

  toggleCustomize () {
    analysisActions.toggleCountryCustomize();
  }

  clearSubregions () {
    this.setState({selectedSubRegion: ''});
  }

  countryAnalysis () {
    app.debug('AnalysisTab >>> countryAnalysis');

    let reportType = 'globalcountryreport',
      countries = this.state.selectedGlobalCoutry,
      regions = this.state.selectedSubRegion,
      reportdateFrom = this.state.analysisStartDate.split('/'),
      reportdateTo = this.state.analysisEndDate.split('/'),
      reportdates = {};

    if (!countries) {
      return;
    }

    reportdates.fYear = Number(reportdateFrom[2]);
    reportdates.fMonth = Number(reportdateFrom[0]);
    reportdates.fDay = Number(reportdateFrom[1]);
    reportdates.tYear = Number(reportdateTo[2]);
    reportdates.tMonth = Number(reportdateTo[0]);
    reportdates.tDay = Number(reportdateTo[1]);

    const hash = this.reportDataToHash(reportType, reportdates, countries, regions);
    window.open('../report/index.html' + hash, '_blank', '');
  }

  reportDataToHash (reportType, dates, country, countryRegions) {
    let hash = '#';
    let reportTypeString = 'reporttype=' + reportType;
    let countryString = 'country=' + country;

    const countryRegionString = `aois=${countryRegions.map(region => region.value).join('!')}`;

    let dateArgs = [];
    let dateString = 'dates=';
    for (let val in dates) {
      if (dates.hasOwnProperty(val)) {
        dateArgs.push([val, dates[val]].join('-'));
      }
    }
    dateString += dateArgs.join('!');

    hash += ['aoitype=GLOBAL', reportTypeString, countryString, countryRegionString, dateString].join('&');
    return hash;
  }
}

GlobalCountryReport.propTypes = {
  customizeCountryOpen: React.PropTypes.bool.isRequired,
  countries: React.PropTypes.array
};
