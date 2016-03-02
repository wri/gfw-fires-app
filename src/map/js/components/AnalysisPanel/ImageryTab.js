import ImageryComponent from 'components/LayerPanel/ImageryComponent';
import LayerCheckbox from 'components/LayerPanel/LayerCheckbox';
import {layersConfig, analysisPanelText} from 'js/config';
// import {AlertsSvg, AnalysisSvg, ImagerySvg} from 'utils/svgs';
import {mapStore} from 'stores/MapStore';
import KEYS from 'js/constants';
import React from 'react';

export default class ImageryTab extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = mapStore.getState();
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  render () {
    let className = 'imagery-tab';
    if (this.props.activeTab !== analysisPanelText.imageryTabId) { className += ' hidden'; }
    let activeLayers = this.state.activeLayers;
    let dgLayer = layersConfig.filter((l) => l.id === KEYS.digitalGlobe)[0];

    //todo: indent footprints subcehckbox
    return (
      <div className={className}>
        <h3>{analysisPanelText.imageryArea}</h3>
        <LayerCheckbox key={dgLayer.id} childrenVisible={true} layer={dgLayer} checked={activeLayers.indexOf(dgLayer.id) > -1}>
          <ImageryComponent {...this.state} options={dgLayer.calendar} />
        </LayerCheckbox>
      </div>
    );
  }

}
