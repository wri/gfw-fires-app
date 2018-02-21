import {analysisPanelText} from 'js/config';
import {analysisActions} from 'actions/AnalysisActions';
import {mapStore} from 'stores/MapStore';
import AnalysisComponent from 'components/LayerPanel/AnalysisComponent';
import React from 'react';
import Select from 'react-select';

export default class IndonesiaSpecialtyReport extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = {
      localErrors: false,
      selectedIsland: '',
      ...mapStore.getState()
    };
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
    if (prevProps.provinces.length === 0 && this.props.provinces.length > 0) {
      this.selectAllProvinces();
    }
  }

  selectAllProvinces () {
    const provinces = this.props.provinces.map(province => {
      return {
        value: province,
        label: province
      };
    });

    this.setState({
      selectedIsland: provinces
    });
  }

  toggleCustomize () {
    analysisActions.toggleCustomize();
  }

  clearAll () {
    this.setState({ selectedIsland: '' });
  }

  sendAnalytics (eventType, action, label) { //todo: why is this request getting sent so many times?
    ga('A.send', 'event', eventType, action, label);
    ga('B.send', 'event', eventType, action, label);
    ga('C.send', 'event', eventType, action, label);
  }

  render () {
    let className = 'text-center report-width';
    if (this.props.activeTab !== analysisPanelText.analysisTabId) { className += ' hidden'; }

    const islands = this.props.provinces.map(province => {
      return {
        value: province,
        label: province
      };
    });
    return (
      <div className={className}>
        <h4 className="indonesia-report__title">{analysisPanelText.indonesiaReportTitle}</h4>
        <p className='customize-report-label' onClick={this.toggleCustomize}>{analysisPanelText.analysisCustomize}
          <span className='analysis-toggle'>{this.props.customizeOpen ? ' ▼' : ' ►'}</span>
        </p>
        <div className={`customize-options ${this.props.customizeOpen === true ? '' : 'hidden'}`}>
          <p>{analysisPanelText.analysisChooseData}</p>
          <div className='flex flex-justify-around'>
            <label>
              <input id='gfw' onChange={analysisActions.toggleAnalysisSource} checked={this.props.analysisSourceGFW} type='radio' />
              {' GFW'}
            </label>
            <label>
              <input id='greenpeace' onChange={analysisActions.toggleAnalysisSource} checked={!this.props.analysisSourceGFW} type='radio' />
              {' Greenpeace'}
            </label>
          </div>
          <p>{analysisPanelText.analysisIndonesiaChooseData}</p>
          <div className='flex flex-justify-around'>
            <p>By Province(s)</p>
          </div>
          <div className='padding'>
          <Select
            onChange={this.handleIslandChange.bind(this)}
            options={islands}
            multi={true}
            value={this.state.selectedIsland}
          />
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

  handleIslandChange(selected) {
    this.setState({ selectedIsland: selected });
  }

  beginAnalysis () {
    app.debug('AnalysisTab >>> beginAnalysis');

    const aoiType = this.props.areaIslandsActive ? 'ISLAND' : 'PROVINCE';
    const provinces = this.props.areaIslandsActive ? this.state.selectedIsland : this.state.selectedIsland;

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

    let reportdateFrom = this.state.analysisStartDate.split('/');
    let reportdateTo = this.state.analysisEndDate.split('/');

    let reportdates = {};

    reportdates.fYear = Number(reportdateFrom[2]);
    reportdates.fMonth = Number(reportdateFrom[0]);
    reportdates.fDay = Number(reportdateFrom[1]);
    reportdates.tYear = Number(reportdateTo[2]);
    reportdates.tMonth = Number(reportdateTo[0]);
    reportdates.tDay = Number(reportdateTo[1]);

    const dataSource = this.props.analysisSourceGFW ? 'gfw' : 'greenpeace';

    let hash = this.reportDataToHash(aoiType, reportdates, provinces, dataSource);
    let win = window.open('../report/index.html' + hash, '_blank', '');

    win.report = true;
    win.reportOptions = {
      'dates': reportdates,
      'aois': provinces,
      'aoitype': aoiType,
      'dataSource': dataSource
    };

    this.sendAnalytics('analysis', 'request', 'The user ran the Fires Analysis.');
  }

  reportDataToHash (aoitype, dates, aois, dataSource) {
    let hash = '#',
      dateargs = [],
      datestring,
      aoistring,
      dataSourceString,
      reportType = 'reporttype=indonesiaspecialtyreport';

    for (let val in dates) {
      if (dates.hasOwnProperty(val)) {
        dateargs.push([val, dates[val]].join('-'));
      }
    }

    datestring = 'dates=' + dateargs.join('!');
    aoistring = `aois=${aois.map(aoi => aoi.value).join('!')}`;

    dataSourceString = 'dataSource=' + dataSource;

    hash += ['aoitype=' + aoitype, datestring, aoistring, dataSourceString, reportType].join('&');

    return hash;
  }

}

IndonesiaSpecialtyReport.propTypes = {
  activeTab: React.PropTypes.string.isRequired,
  areaIslandsActive: React.PropTypes.bool.isRequired,
  analysisSourceGFW: React.PropTypes.bool.isRequired,
  customizeOpen: React.PropTypes.bool.isRequired,
  islands: React.PropTypes.array.isRequired,
  provinces: React.PropTypes.array.isRequired
};
