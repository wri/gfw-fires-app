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
    autoNavigate: false,
    enableHighlight: false,
    showInfoWindowOnSelect: false,
    allPlaceholder: analysisPanelText.searchAllPlaceholder
  }, analysisPanelText.searchWidgetId);

  let sources = searchWidget.get('sources');
  // Override the esri placeholder
  sources[0].placeholder = analysisPanelText.searchEsriPlaceholder;
  // Add some new sources so this widget can search across our feature layer
  sources.push({
    featureLayer: app.map.getLayer(KEYS.watershed),
    exactMatch: false,
    name: analysisPanelText.sourceName,
    enableSuggestions: true,
    minCharacters: 3,
    maxResults: 6,
    maxSuggestions: 6,
    suggestionTemplate: '${maj_name}',
    outFields: ['*'],
    searchFields: ['maj_name'],
    displayField: 'maj_name',
    highlightSymbol: Symbols.getWatershedHoverSymbol(),
    placeholder: analysisPanelText.searchWatershedPlaceholder
  });

  searchWidget.set('sources', sources);
  searchWidget.startup();

  searchWidget.on('select-result', evt => {
    if (evt.result) {
      let feature = evt.result.feature;
      let {activeWatershed} = analysisStore.getState();
      //- Clear out any previous analysis
      if (activeWatershed) { analysisActions.clearActiveWatershed(); }
      //- If the feature is a point, then they searched the world geocoder and we still need to find the watershed
      //- else, they searched the watersheds layer and we can start analysis right away
      if (feature.geometry.type === analysisPanelText.pointType) {
        AnalysisHelper.findWatershed(feature.geometry).then(watershed => {
          analysisActions.analyzeCurrentWatershed(watershed);
        });
      } else {
        Request.getWatershedById(feature.attributes.objectid).then((watershed) => {
          app.map.setExtent(evt.result.extent, true);
          analysisActions.analyzeCurrentWatershed(GraphicsHelper.makePolygon(watershed));
        });
      }
    }
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
      <div className='search-tools map-component side-shadow'>
        <div id={analysisPanelText.searchWidgetId} />
      </div>
    );
  }

}
