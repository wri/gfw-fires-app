/* @flow */
import AnalysisTools from 'components/AnalysisPanel/AnalysisTools';
import MobileUnderlay from 'components/Mobile/MobileUnderlay';
import MobileControls from 'components/Mobile/MobileControls';
import ControlPanel from 'components/MapControls/ControlPanel';
import LayerPanel from 'components/LayerPanel/LayerPanel';
import ImageryHoverModal from 'components/AnalysisPanel/ImageryHoverModal';
import Timeline from 'components/Timeline/Timeline';
import SentinalImagery from 'components/AnalysisPanel/SentinalImagery';
import {mapActions} from 'actions/MapActions';
import {mapStore} from 'stores/MapStore';
import {getUrlParams} from 'utils/params';
import KEYS from 'js/constants';
import {mapConfig} from 'js/config';
import ShareHelper from 'helpers/ShareHelper';
import { ViewFinderSvg } from 'utils/svgs';
import ScreenPoint from 'esri/geometry/ScreenPoint';
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

  getUpdatedSatelliteImagery = () => {
    const imageryLayer = app.map.getLayer(KEYS.RECENT_IMAGERY);

    // if (!imageryLayer || !imageryLayer.visible) { return; }
    if (imageryLayer) {
      imageryLayer.setUrl('');
    }
    mapActions.setSelectedImagery(null);

    const { imageryParams } = this.state;
    const params = imageryParams ? imageryParams : {};

    const xVal = window.innerWidth / 2;
    const yVal = window.innerHeight / 2;

    // Create new screen point at center;
    const screenPt = new ScreenPoint(xVal, yVal);

    // Convert screen point to map point and zoom to point;
    const mapPt = app.map.toMap(screenPt);

    // Note: Lat and lon are intentionally reversed until imagery api is fixed.
    // The imagery API only returns the correct image for that lat/lon if they are reversed.
    params.lon = mapPt.getLatitude();
    params.lat = mapPt.getLongitude();

    mapActions.getSatelliteImagery(params);
  }

  render () {
    const { imageryModalVisible, imageryError } = this.state;
    return (
      <div id={mapConfig.id} className={'map'}>
        <LayerPanel loaded={this.state.loaded} />
        <AnalysisTools imageryModalVisible={imageryModalVisible} />
        <ControlPanel map={this.state.map} />
        <Timeline />
        <MobileUnderlay />
        <MobileControls />
        <div className={`imagery-modal-container ${imageryModalVisible ? '' : 'collapse'}`}>
          <svg className='map__viewfinder'>
            <ViewFinderSvg />
          </svg>
          <SentinalImagery
            imageryData={this.state.imageryData}
            loadingImagery={this.state.loadingImagery}
            imageryModalVisible={imageryModalVisible}
            imageryError={imageryError}
            getNewSatelliteImages={this.getUpdatedSatelliteImagery}
            imageryHoverVisible={this.state.imageryHoverVisible}
            selectedImagery={this.state.selectedImagery}
          />
          { this.state.imageryHoverInfo && this.state.imageryHoverInfo.visible && this.state.selectedImagery &&
            <ImageryHoverModal
              selectedImagery={this.state.selectedImagery}
              top={this.state.imageryHoverInfo.top}
              left={this.state.imageryHoverInfo.left}
            />
          }
        </div>
      </div>
    );
  }

}
