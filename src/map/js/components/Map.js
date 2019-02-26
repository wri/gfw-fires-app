/* @flow */
import AnalysisTools from 'components/AnalysisPanel/AnalysisTools';
import MobileUnderlay from 'components/Mobile/MobileUnderlay';
import MobileControls from 'components/Mobile/MobileControls';
import ControlPanel from 'components/MapControls/ControlPanel';
import LayerPanel from 'components/LayerPanel/LayerPanel';
import Timeline from 'components/Timeline/Timeline';
import SentinalImagery from 'components/AnalysisPanel/SentinalImagery';
import {mapActions} from 'actions/MapActions';
import {mapStore} from 'stores/MapStore';
import {getUrlParams} from 'utils/params';
import {mapConfig} from 'js/config';
import ShareHelper from 'helpers/ShareHelper';
import React, {
  Component
} from 'react';

export default class Map extends Component {
  displayName: Map;
  state: any;

  constructor (props: any) {
    super(props);
    this.state = {
      loaded: false,
      map: {},
      ...mapStore.getState()
     };
  }

  componentDidMount() {
    mapStore.listen(this.storeDidUpdate);
    let urlParams = getUrlParams(window.location.hash);
    //- Mixin the map config with the url params, make sure to create a new object and not
    //- overwrite the mapConfig, again so reset sets the state back to default and not shared,
    //- TODO: this may not be necessary, remove this if I dont neet to override params, currently I am setting them after load
    let newMapConfig = Object.assign({}, mapConfig);
    mapActions.createMap(newMapConfig).then(() => {
      this.setState({
        loaded: true,
        map: app.map
      });
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
  storeDidUpdate = () => {
    this.setState(mapStore.getState());
  };

  render () {
    const { imageryModalVisible } = this.state;
    return (
      <div id={mapConfig.id} className={'map'}>
        <LayerPanel loaded={this.state.loaded} />

        <AnalysisTools imageryModalVisible={imageryModalVisible} />
        <ControlPanel map={this.state.map} />
        <Timeline />
        <MobileUnderlay />
        <MobileControls />
        <div className={`imagery-modal-container ${imageryModalVisible ? '' : 'collapse'}`}>
          <SentinalImagery
            imageryData={this.state.imageryData}
            loadingImagery={this.state.loadingImagery}
            imageryModalVisible={imageryModalVisible}
            // imageryError={imageryError}
            imageryHoverVisible={this.state.imageryHoverVisible}
          />
        </div>
      </div>
    );
  }

}
