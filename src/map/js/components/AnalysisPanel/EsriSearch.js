import {analysisActions} from 'actions/AnalysisActions';
import AnalysisHelper from 'helpers/AnalysisHelper';
import GraphicsHelper from 'helpers/GraphicsHelper';
import {analysisStore} from 'stores/AnalysisStore';
import {analysisPanelText} from 'js/config';
import Search from 'esri/dijit/Search';
import Symbols from 'helpers/Symbols';
import Request from 'utils/request';
import KEYS from 'js/constants';
import React from 'react';

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

  change(evt) {
    let value = evt.target.value,
        suggestResults = value.length === 0 ? [] : this.state.suggestResults;

    this.state.searchWidget.suggest(value);
    this.setState({ value: value, suggestResults: suggestResults });
  }

  enter(evt) {
    if (evt.key === 'Enter' && this.state.value.length > 0) {
      this.state.searchWidget.search(this.state.value);
    }
  }

  suggestionSearch(evt) {
    this.state.searchWidget.search(evt.target.textContent);
    this.setState({ suggestResults: [] });
    analysisActions.toggleEsriSearchVisibility();
  }

  render() {
    let className = 'search-tools map-component';
    if (this.state.esriSearchVisible === false) { className += ' hidden'; };

    return (
      <div className={className}>
        <div>
          <button className='search-tab' onClick={() => this.setState({ visibleTab: 0 })}>Address</button>
          <button className='search-tab' onClick={() => this.setState({ visibleTab: 1 })}>Coordinates</button>
          <button className='search-tab' onClick={() => this.setState({ visibleTab: 2 })}>Decimal degrees</button>
        </div>
        <div className={this.state.visibleTab === 0 ? '' : 'hidden'}>
          <input className='search-input' type='text' placeholder={analysisPanelText.searchPlaceholder}  value={this.state.value} onChange={this.change.bind(this)} onKeyDown={this.enter.bind(this)} autoFocus/>
          <div className='search-results'>
            {this.state.suggestResults.map((r, i) => (
              <div><button onClick={this.suggestionSearch.bind(this)}>{r}</button></div>
            ), this)}
          </div>
        </div>
        <div className={this.state.visibleTab === 1 ? '' : 'hidden'}>
          coordinates
        </div>
        <div className={this.state.visibleTab === 2 ? '' : 'hidden'}>
          decimal degrees
        </div>
        <div className='hidden'>
          <div id={analysisPanelText.searchWidgetId} />
        </div>
      </div>
    );
  }

}
