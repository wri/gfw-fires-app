import AnalysisTools from 'components/AnalysisPanel/AnalysisTools';
import MobileUnderlay from 'components/Mobile/MobileUnderlay';
import MobileControls from 'components/Mobile/MobileControls';
import EsriSearch from 'components/AnalysisPanel/EsriSearch';
import ControlPanel from 'components/MapControls/ControlPanel';
import LayerPanel from 'components/LayerPanel/LayerPanel';
import Timeline from 'components/Timeline/Timeline';
// import {applyStateFromUrl} from 'helpers/ShareHelper';
import {mapActions} from 'actions/MapActions';
import {getUrlParams} from 'utils/params';
import {mapConfig} from 'js/config';
import ShareHelper from 'helpers/ShareHelper';
import React from 'react';

export default class Map extends React.Component {

  constructor (props) {
    super(props);
    this.state = { loaded: false };
  }

  componentDidMount() {
    let urlParams = getUrlParams(window.location.hash);
    //- Mixin the map config with the url params, make sure to create a new object and not
    //- overwrite the mapConfig, again so reset sets the state back to default and not shared,
    //- TODO: this may not be necessary, remove this if I dont neet to override params, currently I am setting them after load
    let newMapConfig = Object.assign({}, mapConfig);
    mapActions.createMap(newMapConfig).then(() => {
      this.setState({ loaded: true });
      mapActions.createLayers();
      mapActions.connectLayerEvents();
      //- Use the helper to take the params and use actions to apply shared state, don't set these params
      //- as default state, otherwise the reset button will reset to shared state and not default state
      if (urlParams.activeBasemap) {
        ShareHelper.applyStateFromUrl(urlParams);
      } else {
        ShareHelper.applyInitialState();
      }
    });
  }

  render () {

    //<EsriSearch loaded={this.state.loaded} />
    return (
      <div id={mapConfig.id} className={'map'}>
        <LayerPanel loaded={this.state.loaded} />

        <AnalysisTools />
        <ControlPanel />
        <Timeline />
        <MobileUnderlay />
        <MobileControls />
      </div>
    );
  }

}
