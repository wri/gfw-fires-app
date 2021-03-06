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
      selectedGlobalCountry: '',
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
    // Add Global Report option to top
    countriesList.unshift({
      value: 'ALL',
      label: 'Global Report'
    });


    const countrySubRegions = this.props.adm1.filter(o => o.NAME_0 === this.state.selectedGlobalCountry);
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

    countrySubRegionsList.unshift({
      value: 'ALL',
      label: 'All Subregions'
    });

    return (
      <div className='report-width'>
        <div className={'padding'}>
          <Select
            placeholder='Select a country'
            value={this.state.selectedGlobalCountry}
            onChange={this.handleGlobalCountryChange.bind(this)}
            multi={false}
            options={countriesList}
          />
        </div>
        { (this.state.selectedGlobalCountry && this.state.selectedGlobalCountry !== 'ALL') &&
          <div>
            <div className='padding'>
                <Select
                  placeholder='Select a subregion'
                  onChange={this.handleSubRegionChange.bind(this)}
                  options={countrySubRegionsList}
                  multi={false}
                  value={this.state.selectedSubRegion}
                />
            </div>
          </div>
        }
        <AnalysisComponent {...this.state} options={analysisPanelText.analysisCalendar} />
        <div className='no-shrink analysis-footer text-center'>
          <button onClick={this.countryAnalysis.bind(this)} className='gfw-btn blue' disabled={!this.state.selectedGlobalCountry || new Date(this.state.analysisEndDate) < new Date(this.state.analysisStartDate)}>{analysisPanelText.analysisButtonLabel}</button>
        </div>
      </div>
    );
  }

  handleSubRegionChange (selected) {
    if (selected === null) {
      this.setState({ selectedSubRegion: { value: 'ALL', label: 'All Subregions' } });
    } else {
      this.setState({ selectedSubRegion: selected });
    }
  }

  handleGlobalCountryChange (selected) {
    if (selected) {
      this.setState({ selectedGlobalCountry: selected.value, selectedSubRegion: { value: 'ALL', label: 'All Subregions' } });
    } else {
      this.setState({ selectedGlobalCountry: '' });
    }
  }

  toggleCustomize () {
    analysisActions.toggleCountryCustomize();
  }

  countryAnalysis () {
    app.debug('AnalysisTab >>> countryAnalysis');

    let reportType = 'globalcountryreport',
    countries = this.state.selectedGlobalCountry,
    region = this.state.selectedSubRegion,
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

    const hash = this.reportDataToHash(reportType, reportdates, countries, region);
    window.open('../report/index.html' + hash, '_blank', '');
  }

  reportDataToHash (reportType, dates, country, countryRegion) {
    let hash = '#';
    let reportTypeString = 'reporttype=' + reportType;
    let countryString = 'country=' + country;

    const countryRegionString = countryRegion.value === 'ALL' ? '' : `aois=${countryRegion.value}`;
    let dateArgs = [];
    let dateString = 'dates=';
    for (let val in dates) {
      if (dates.hasOwnProperty(val)) {
        dateArgs.push([val, dates[val]].join('-'));
      }
    }
    dateString += dateArgs.join('!');

    // global country report
    if (country && country === 'ALL') {
      hash += ['aoitype=ALL', reportTypeString, dateString].join('&');
    } else {
      if (countryRegionString) {
        hash += ['aoitype=GLOBAL', reportTypeString, countryString, countryRegionString, dateString].join('&');
      } else {
        hash += ['aoitype=GLOBAL', reportTypeString, countryString, dateString].join('&');
      }
    }
    return hash;
  }
}
