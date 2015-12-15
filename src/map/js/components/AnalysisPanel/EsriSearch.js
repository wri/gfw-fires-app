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

let generateSearchWidget = () => {

  let searchWidget = new Search({
    map: app.map,
    autoNavigate: true,
    enableHighlight: false,
    showInfoWindowOnSelect: false,
    allPlaceholder: analysisPanelText.searchAllPlaceholder,
    enableSourcesMenu: false
  }, analysisPanelText.searchWidgetId);

  searchWidget.startup();

  searchWidget.on('select-result', evt => {
    console.debug(evt);
  });

  searchWidget.on('select-results', evt => {
    console.debug(evt);
  });

  searchWidget.on('suggest-results', evt => {
    console.debug(evt);
  });

};

export default class EsriSearch extends React.Component {

  componentWillReceiveProps(nextProps) {
    if (!this.props.loaded && nextProps.loaded) {
      generateSearchWidget();
    }
  }

  render() {
    return (
      <div className='search-tools map-component mobile-hide hidden'>
        <div className=''>
          <div id={analysisPanelText.searchWidgetId} />
        </div>
        <div style={{position:'absolute', bottom:'100%'}}>
          <span>Address</span>
          <span>Coordinates</span>
          <span>Decimal degrees</span>
        </div>
        <input className='search-input' type='text' placeholder='Search for a location' />
        <div>
          <div>Result one</div>
          <div>Result two</div>
          <div>Result three</div>
        </div>
      </div>
    );
  }

}
