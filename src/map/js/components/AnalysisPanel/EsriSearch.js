import {analysisActions} from 'actions/AnalysisActions';
import {mapActions} from 'actions/MapActions';
import AnalysisHelper from 'helpers/AnalysisHelper';
import GraphicsHelper from 'helpers/GraphicsHelper';
import {analysisStore} from 'stores/AnalysisStore';
import {analysisConfig, analysisPanelText} from 'js/config';
import Search from 'esri/dijit/Search';
import Symbols from 'helpers/Symbols';
import Request from 'utils/request';
import KEYS from 'js/constants';
import React from 'react';

let magnifierSvg = '<use xlink:href="#icon-magnifier" />';
let generateSearchWidget = (component) => {

  let searchWidget = new Search({
    map: app.map,
    autoNavigate: true,
    enableHighlight: false,
    showInfoWindowOnSelect: false,
    enableSourcesMenu: false
  }, analysisPanelText.searchWidgetId);

  searchWidget.startup();

  searchWidget.on('suggest-results', evt => {
    component.setState({ suggestResults: searchWidget.suggestResults === null ? [] : searchWidget.suggestResults[0].map((r) => r.text) });
  });

  return searchWidget;
};

const tabs = [
  'Address',
  'Coordinates',
  'Decimal Degrees'
];

export default class EsriSearch extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: '',
      visibleTab: 0,
      searchWidget: null,
      suggestResults: [],
      esriSearchVisible: analysisStore.getState().esriSearchVisible
    }
    analysisStore.listen(this.storeUpdated.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.loaded && nextProps.loaded) {
      this.setState({ searchWidget: generateSearchWidget(this) });
    }
  }

  storeUpdated () {
    this.setState({ esriSearchVisible: analysisStore.getState().esriSearchVisible });
  }

  change (evt) {
    let value = evt.target.value,
        suggestResults = value.length === 0 ? [] : this.state.suggestResults;

    this.state.searchWidget.suggest(value);
    this.setState({ value: value, suggestResults: suggestResults });
  }

  enter (evt) {
    if (evt.key === 'Enter' && this.state.value.length > 0) {
      this.state.searchWidget.search(this.state.value);
      analysisActions.toggleEsriSearchVisibility();
    };
  }

  keyDown (evt) {
    if (evt.key === 'Enter' && this.state.value.length > 0) { this.enter(evt) };
  }

  suggestionSearch (evt) {
    let suggestionIndex = JSON.parse(evt.target.getAttribute('data-suggestion-index'));
    this.state.searchWidget.search(this.state.searchWidget.suggestResults[0][suggestionIndex]);
    this.state.searchWidget.clear();
    this.setState({ value: '', suggestResults: [] });
    analysisActions.toggleEsriSearchVisibility();
  }

  coordinateSearch () {
    console.debug('TODO: coordinateSearch');
  }

  decimalDegreeSearch () {
    let values = [this.refs.decimalDegreeLat.value, this.refs.decimalDegreeLng.value].map(parseFloat);
    let [lat, lng] = values;
    if (values.map(isNaN).indexOf(true) > -1) { throw Error('Invalid input(s)'); };
    mapActions.centerAndZoomLatLng(lat, lng, analysisConfig.searchZoomDefault);
    analysisActions.toggleEsriSearchVisibility();
  }

  render() {
    let className = 'search-tools map-component';
    // NOTE: main search input is mounted & unmounted as visible to take advantage of keyboard autoFocus
    let searchInput = this.state.esriSearchVisible === false ? undefined : (
      <input className='search-input fill__wide' type='text' placeholder={analysisPanelText.searchPlaceholder}  value={this.state.value} onChange={this.change.bind(this)} onKeyDown={this.keyDown.bind(this)} autoFocus/>
    );
    if (this.state.esriSearchVisible === false) { className += ' hidden'; };

    return (
      <div className={className}>
        <div>
          {tabs.map((t, i) => (
            <button className={`search-tab ${i === this.state.visibleTab ? 'active' : ''}`} onClick={() => this.setState({ visibleTab: i })}>{t}</button>
          ))}
        </div>
        <div className={this.state.visibleTab === 0 ? '' : 'hidden'}>
          <div className='search-input-container'>
            {searchInput}
            <button className='padding back-white'>
              <svg className='search-magnifier' dangerouslySetInnerHTML={{ __html: magnifierSvg }} />
            </button>
          </div>
          <div className='search-results custom-scroll'>
            {this.state.suggestResults.map((r, i) => (
              <div><button data-suggestion-index={i} onClick={this.suggestionSearch.bind(this)}>{r}</button></div>
            ), this)}
          </div>
        </div>
        <div className={this.state.visibleTab === 1 ? '' : 'hidden'}>
          <div ref='coordinatesA' className='search-coordinates back-white'>
            <div className='inline-block'><input className='search-input' type='number' placeholder='____'/>º</div>
            <div className='inline-block'><input className='search-input' type='number' placeholder='____'/>{"'"}</div>
            <div className='inline-block'><input className='search-input' type='number' placeholder='____'/>{'"'}</div>
            <select>
              <option>N</option>
              <option>S</option>
            </select>
          </div>
          <div ref='coordinatesB'className='search-coordinates back-white'>
            <div><input className='search-input' type='number' placeholder='____'/>º</div>
            <div><input className='search-input' type='number' placeholder='____'/>{"'"}</div>
            <div><input className='search-input' type='number' placeholder='____'/>{'"'}</div>
            <select>
              <option>W</option>
              <option>E</option>
            </select>
          </div>
          <div className='text-right'>
            <button className='search-submit-button gfw-btn blue' onClick={this.coordinateSearch.bind(this)}>Search</button>
          </div>
        </div>
        <div className={this.state.visibleTab === 2 ? '' : 'hidden'}>
          <input ref='decimalDegreeLat' className='search-input fill__wide' type='number' placeholder='Lat' />
          <input ref='decimalDegreeLng' className='search-input fill__wide' type='number' placeholder='Long' />
          <div className='text-right'>
            <button className='search-submit-button gfw-btn blue' onClick={this.decimalDegreeSearch.bind(this)}>Search</button>
          </div>
        </div>
        <div className='hidden'>
          <div id={analysisPanelText.searchWidgetId} />
        </div>
      </div>
    );
  }

}
