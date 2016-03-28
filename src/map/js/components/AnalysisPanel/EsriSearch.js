import {analysisActions} from 'actions/AnalysisActions';
import {mapActions} from 'actions/MapActions';
import {analysisStore} from 'stores/AnalysisStore';
import {analysisConfig, analysisPanelText} from 'js/config';
import Search from 'esri/dijit/Search';
import React from 'react';

let magnifierSvg = '<use xlink:href="#icon-magnifier" />';
let locateSvg = '<use xlink:href="#icon-locate" />';
let generateSearchWidget = (component) => {

  let searchWidget = new Search({
    map: app.map,
    autoNavigate: true,
    enableHighlight: false,
    showInfoWindowOnSelect: false,
    enableSourcesMenu: false
  }, analysisPanelText.searchWidgetId);

  searchWidget.startup();

  searchWidget.on('suggest-results', () => {
    component.setState({ suggestResults: searchWidget.suggestResults === null ? [] : searchWidget.suggestResults[0].map((r) => r.text) });
  });

  return searchWidget;
};

const tabs = [
  'Address',
  'Coordinates',
  'Decimal Degrees'
];

// REFERENCE: http://stackoverflow.com/a/5971628
function dms2Deg(s) {
  // Determine if south latitude or west longitude
  var sw = /[sw]/i.test(s);

  // Determine sign based on sw (south or west is -ve)
  var f = sw ? -1 : 1;

  // Get into numeric parts
  var bits = s.match(/[\d.]+/g);

  var result = 0;

  // Convert to decimal degrees
  for (var i = 0, iLen = bits.length; i < iLen; i++) {

    // String conversion to number is done by division
    // To be explicit (not necessary), use
    //   result += Number(bits[i])/f
    result += bits[i] / f;

    // Divide degrees by +/- 1, min by +/- 60, sec by +/-3600
    f *= 60;
  }

  return result;
}

export default class EsriSearch extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: '',
      visibleTab: 0,
      searchWidget: null,
      suggestResults: [],
      esriSearchVisible: analysisStore.getState().esriSearchVisible
    };
    analysisStore.listen(this.onUpdate.bind(this));
    this.keyDown = this.keyDown.bind(this);
    this.suggestionSearch = this.suggestionSearch.bind(this);
    this.suggestionKeyDown = this.suggestionKeyDown.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.loaded && nextProps.loaded) {
      this.setState({ searchWidget: generateSearchWidget(this) });
    }
  }

  onUpdate () {
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
    }
  }

  keyDown (evt) {
    if (evt.key === 'Enter' && this.state.value.length > 0) { this.enter(evt); }
    if (evt.key === 'ArrowDown' && this.state.suggestResults.length > 0) {
      this.refs.searchResults.childNodes[0].querySelector('button').focus();
    }
  }

  suggestionKeyDown (evt) {
    if (['ArrowUp', 'ArrowDown'].indexOf(evt.key) > -1 && this.state.value.length > 0) {
      let arrowUp = evt.key === 'ArrowUp';
      let suggestionIndex = JSON.parse(evt.target.getAttribute('data-suggestion-index'));
      let nextSibling = this.refs.searchResults.childNodes[ suggestionIndex + ( arrowUp === true ? -1 : 1 ) ];
      if (suggestionIndex === 0 && arrowUp === true) { this.refs.searchInput.focus(); return; }
      if (nextSibling !== undefined) { nextSibling.querySelector('button').focus(); }
    }
  }

  suggestionSearch (evt) {
    let suggestionIndex = JSON.parse(evt.target.getAttribute('data-suggestion-index'));
    this.state.searchWidget.search(this.state.searchWidget.suggestResults[0][suggestionIndex]);
    this.state.searchWidget.clear();
    this.setState({ value: '', suggestResults: [] });
    analysisActions.toggleEsriSearchVisibility();
  }

  coordinateSearch () {
    let dmsA = Array.apply({}, this.refs.coordinatesA.querySelectorAll('input')).map((i) => i.value).map((v) => parseInt(v)).map(Math.abs);
    let directionA = this.refs.directionA.value;
    let dmsB = Array.apply({}, this.refs.coordinatesB.querySelectorAll('input')).map((i) => i.value).map((v) => parseInt(v)).map(Math.abs);
    let directionB = this.refs.directionB.value;
    let lat = dms2Deg(`${directionA} ${dmsA[0]} ${dmsA[1]}' ${dmsA[2]}"`);
    let lng = dms2Deg(`${directionB} ${dmsB[0]} ${dmsB[1]}' ${dmsB[2]}"`);
    mapActions.centerAndZoomLatLng(lat, lng, analysisConfig.searchZoomDefault);
  }

  decimalDegreeSearch () {
    let values = [this.refs.decimalDegreeLat.value, this.refs.decimalDegreeLng.value].map(parseFloat);
    let [lat, lng] = values;
    if (values.map(isNaN).indexOf(true) > -1) { throw Error('Invalid input(s)'); }
    mapActions.centerAndZoomLatLng(lat, lng, analysisConfig.searchZoomDefault);
    analysisActions.toggleEsriSearchVisibility();
  }

  locateMe () {
    mapActions.zoomToUserLocation();
  }

  render() {
    let className = 'search-tools map-component';
    // NOTE: searchInput is mounted & unmounted visible to take advantage of keyboard autoFocus
    let searchInput = this.state.esriSearchVisible === false ? undefined : (
      <input ref='searchInput' className='search-input fill__wide' type='text' placeholder={analysisPanelText.searchPlaceholder} value={this.state.value} onChange={this.change.bind(this)} onKeyDown={this.keyDown} autoFocus/>
    );
    if (this.state.esriSearchVisible === false) { className += ' hidden'; }


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
            <button className='border-right padding back-white'>
              <svg className='search-magnifier vertical-middle' dangerouslySetInnerHTML={{ __html: magnifierSvg }} />
            </button>
            <div className='locate-me pointer' title='Locate Me' onClick={this.locateMe}>
              <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: locateSvg }}/>
            </div>
          </div>
          <div ref='searchResults' className='search-results custom-scroll'>
            {this.state.suggestResults.map((r, i) => (
              <div><button data-suggestion-index={i} onClick={this.suggestionSearch} onKeyDown={this.suggestionKeyDown}>{r}</button></div>
            ), this)}
          </div>
        </div>
        <div className={this.state.visibleTab === 1 ? '' : 'hidden'}>
          <div ref='coordinatesA' className='search-coordinates back-white'>
            <div><input className='search-input' type='number' min='0' step='1' placeholder='00' />º</div>
            <div><input className='search-input' type='number' min='0' step='1' placeholder='00' />{"'"}</div>
            <div><input className='search-input' type='number' min='0' step='1' placeholder='00' />{'"'}</div>
            <select ref='directionA'>
              <option>N</option>
              <option>S</option>
            </select>
          </div>
          <div ref='coordinatesB' className='search-coordinates back-white'>
            <div><input className='search-input' type='number' min='0' step='1' placeholder='00' />º</div>
            <div><input className='search-input' type='number' min='0' step='1' placeholder='00' />{"'"}</div>
            <div><input className='search-input' type='number' min='0' step='1' placeholder='00' />{'"'}</div>
            <select ref='directionB'>
              <option>W</option>
              <option>E</option>
            </select>
          </div>
          <div id='coordinateSearch'>
            <button className='search-submit-button gfw-btn green' onClick={this.coordinateSearch.bind(this)}>Search</button>
          </div>
        </div>
        <div className={`search-box degrees ${this.state.visibleTab === 2 ? '' : 'hidden'}`}>
          <div className='deg-box'>
            <span>Lat:</span><input ref='decimalDegreeLat' type='number' className='deg-input' id='deg-lat' name='deg-lat' />
          </div>
          <div className='deg-box'>
            <span>Long:</span><input ref='decimalDegreeLng' type='number' className='deg-input' id='deg-lng' name='deg-lng' />
          </div>
          <button className='search-submit-button gfw-btn green' onClick={this.decimalDegreeSearch.bind(this)}>Search</button>

        </div>
        <div className='hidden'>
          <div id={analysisPanelText.searchWidgetId} />
        </div>
      </div>
    );
  }

}
