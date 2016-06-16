import {layerActions} from 'actions/LayerActions';
import LayersHelper from 'helpers/LayersHelper';
import {layerPanelText} from 'js/config';
import React from 'react';

let plantationOptions = layerPanelText.plantationOptions;

export default class PlantationControls extends React.Component {

  componentDidUpdate(prevProps) {
    if (prevProps.plantationSelectIndex !== this.props.plantationSelectIndex) {
      LayersHelper.updatePlantationLayerDefinitions(this.props.plantationSelectIndex);
    }
  }

  componentWillReceiveProps(nextProps) {
    // Set the default layer definition when the map has been loaded
    if (!this.props.loaded && nextProps.loaded) {
      LayersHelper.updatePlantationLayerDefinitions(nextProps.plantationSelectIndex);
    }
  }

  render () {
    let activeItem = plantationOptions[this.props.plantationSelectIndex];
    return <div>
      <div className='timeline-container relative plantations'>
        <select className='pointer' value={activeItem.value} onChange={this.changePlantations}>
          {plantationOptions.map(this.optionsMap, this)}
        </select>
        <div className='active-plantations-control gfw-btn sml white'>{activeItem.label}</div>
      </div>
    </div>;
  }

  optionsMap (item, index) {
    return <option key={index} value={item.value}>{item.label}</option>;
  }

  changePlantations (evt) {
    layerActions.changePlantations(evt.target.selectedIndex);
  }

}
