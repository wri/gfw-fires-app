import WaterStressLegend from 'components/LayerPanel/WaterStressLegend';
import LandCoverLegend from 'components/LayerPanel/LandCoverLegend';
import SedimentLegend from 'components/LayerPanel/SedimentLegend';
import DensityDisplay from 'components/LayerPanel/DensityDisplay';
import LayerCheckbox from 'components/LayerPanel/LayerCheckbox';
import FiresControls from 'components/LayerPanel/FiresControls';
import ForestControls from 'components/LayerPanel/ForestControls';
import PlantationControls from 'components/LayerPanel/PlantationControls';
import ViirsControls from 'components/LayerPanel/ViirsControls';
import ArchiveControls from 'components/LayerPanel/ArchiveControls';
import NoaaControls from 'components/LayerPanel/NoaaControls';
import RiskControls from 'components/LayerPanel/RiskControls';
import RainControls from 'components/LayerPanel/RainControls';
import AirControls from 'components/LayerPanel/AirControls';
import WindControls from 'components/LayerPanel/WindControls';
import LayerTransparency from 'components/LayerPanel/LayerTransparency';
// import RiskCalendar from 'components/LayerPanel/RiskCalendar';
import ImageryComponent from 'components/LayerPanel/ImageryComponent';
import LayerGroup from 'components/LayerPanel/LayerGroup';
import DamsLegend from 'components/LayerPanel/DamsLegend';
import {layersConfig, layerPanelText, controlPanelText} from 'js/config';
import {mapStore} from 'stores/MapStore';
import {mapActions} from 'actions/MapActions';
import KEYS from 'js/constants';
import React from 'react';

export default class LayerPanel extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = mapStore.getState();
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  clickedBasemap (id) {
    mapActions.setBasemap(id);
  }

  checkboxMap (group) {
    return layer => {
      let activeLayers = this.state.activeLayers;
      // Exclude Layers not part of this group
      if (layer.group !== group) { return null; }
      // TODO: Remove once current layer panel design is approved
      // If it is just a label, render the grop label
      // if (layer.isGroupLabel) { return <div key={layer.id} className='layer-group-label'>{layer.label}</div>; }

      // Some layers have legends or tools and they should be rendered inside the layer checkbox
      let childComponent;

      switch (layer.id) {
        case KEYS.waterStress:
          childComponent = <WaterStressLegend url={layer.url} layerIds={layer.layerIds} />;
          break;
        case KEYS.sediment:
          childComponent = <SedimentLegend url={layer.url} layerIds={layer.layerIds} />;
          break;
        case KEYS.majorDams:
          childComponent = <DamsLegend url={layer.url} layerIds={layer.layerIds} />;
          break;
        case KEYS.activeFires:
          childComponent = <FiresControls loaded={this.props.loaded} {...this.state} />;
          break;
        case KEYS.viirsFires:
          childComponent = <ViirsControls loaded={this.props.loaded} {...this.state} />;
          break;
        case KEYS.archiveFires:
          childComponent = <ArchiveControls options={layer.calendar} loaded={this.props.loaded} />;
          break;
        case KEYS.noaa18Fires:
          childComponent = <NoaaControls options={layer.calendar} loaded={this.props.loaded} />;
          break;
        case KEYS.treeCoverDensity:
          childComponent = <DensityDisplay {...this.state} />;
          break;
        case KEYS.primaryForests:
          childComponent = <ForestControls loaded={this.props.loaded} {...this.state} />;
          break;
        case KEYS.peatlands:
          childComponent = <LandCoverLegend url={layer.url} layerIds={layer.layerIds} />;
          break;
        case KEYS.fireRisk:
          childComponent = <RiskControls options={layer.calendar} loaded={this.props.loaded} />;
          break;
        case KEYS.lastRainfall:
          childComponent = <RainControls options={layer.calendar} loaded={this.props.loaded} />;
          break;
        case KEYS.airQuality:
          childComponent = <AirControls options={layer.calendar} loaded={this.props.loaded} />;
          break;
        case KEYS.windDirection:
          childComponent = <WindControls options={layer.calendar} loaded={this.props.loaded} />;
          break;
        case KEYS.digitalGlobe:
          childComponent = <ImageryComponent {...this.state} domId={layer.calendar.domId} domClass={layer.calendar.domClass} childDomClass={layer.calendar.childDomClass} startDate={layer.calendar.startDate} currentDate={layer.calendar.currentDate} />;
          break;
        case KEYS.plantationTypes:
          childComponent = <PlantationControls loaded={this.props.loaded} {...this.state} />;
          break;
        default:
          childComponent = null;
      }

      return (
        <LayerCheckbox disabled={layer.disabled} key={layer.id} layer={layer} checked={activeLayers.indexOf(layer.id) > -1}>
          {childComponent}
        </LayerCheckbox>
      );
    };
  }

  render() {
    let className = 'layer-panel map-component custom-scroll shadow';
    let landUseLayers = layersConfig.filter((l) => l.group === 'forestUse').map(this.checkboxMap('forestUse'), this);
    let conservationLayers = layersConfig.filter((l) => l.group === 'conservation').map(this.checkboxMap('conservation'), this);
    let landCoverLayers = layersConfig.filter((l) => l.group === 'landCover').map(this.checkboxMap('landCover'), this);
    if (app.mobile() === true && this.state.layerPanelVisible === false) { className += ' hidden'; }
    if (this.state.panelsHidden === true && className.indexOf('hidden') === -1) { className += ' hidden'; }

    //{layersConfig.map(this.checkboxMap('landCover'), this)}
    return (
      <div className={className}>
        <LayerGroup activeLayers={this.state.activeLayers} label='Fires'>
          {layersConfig.map(this.checkboxMap('fires'), this)}
        </LayerGroup>
        <LayerGroup activeLayers={this.state.activeLayers} label='Land use'>
          <LayerTransparency layers={landUseLayers}></LayerTransparency>
          {landUseLayers[0]}
          {layerPanelText.concessions}
          {landUseLayers[1]}
          {landUseLayers[2]}
          {landUseLayers[3]}
          {landUseLayers[4]}
        </LayerGroup>
        <LayerGroup activeLayers={this.state.activeLayers} label='Conservation'>
          <LayerTransparency layers={conservationLayers}></LayerTransparency>
          {conservationLayers[0]}
        </LayerGroup>
        <LayerGroup activeLayers={this.state.activeLayers} label='Land Cover'>
          <LayerTransparency layers={landCoverLayers}></LayerTransparency>
          {landCoverLayers[0]}
          {landCoverLayers[1]}
          {landCoverLayers[2]}
          {landCoverLayers[3]}
        </LayerGroup>
        <LayerGroup activeLayers={this.state.activeLayers} label='Air Quality'>
          {layersConfig.map(this.checkboxMap('airQuality'), this)}
        </LayerGroup>

        <LayerGroup activeLayers={this.state.activeLayers} label='Stories'>
          {layersConfig.map(this.checkboxMap('stories'), this)}
        </LayerGroup>

        <div className='mobile-show'>
          <div className='layer-category'>
            <div className='layer-category-label pointer'>
              Basemaps
            </div>
            <div>
              <div className='flex flex-wrap flex-justify-between padding'>
                <div className='basemap-item narrow pointer' onClick={this.clickedBasemap.bind(this, KEYS.darkGrayBasemap)}>
                  <div className={`basemap-thumbnail dark-gray-basemap ${this.state.activeBasemap === KEYS.darkGrayBasemap ? 'active' : ''}`} />
                  <div className='basemap-label narrow'>{controlPanelText.darkGrayBasemap}</div>
                </div>
                <div className='basemap-item narrow pointer' onClick={this.clickedBasemap.bind(this, KEYS.topoBasemap)}>
                  <div className={`basemap-thumbnail topo-basemap ${this.state.activeBasemap === KEYS.topoBasemap ? 'active' : ''}`} />
                  <div className='basemap-label narrow'>{controlPanelText.topoBasemap}</div>
                </div>
                <div className='basemap-item narrow pointer' onClick={this.clickedBasemap.bind(this, KEYS.wriBasemap)}>
                  <div className={`basemap-thumbnail wri-basemap ${this.state.activeBasemap === KEYS.wriBasemap ? 'active' : ''}`} />
                  <div className='basemap-label narrow'>{controlPanelText.wriBasemap}</div>
                </div>
                <div className='basemap-item narrow pointer' onClick={this.clickedBasemap.bind(this, KEYS.imageryBasemap)}>
                  <div className={`basemap-thumbnail imagery-basemap ${this.state.activeBasemap === KEYS.imageryBasemap ? 'active' : ''}`} />
                  <div className='basemap-label narrow'>{controlPanelText.imageryBasemap}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

}
