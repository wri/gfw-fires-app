import {layerActions} from 'actions/LayerActions';
import LayersHelper from 'helpers/LayersHelper';
import {layerPanelText} from 'js/config';
import React from 'react';

let forestOptions = layerPanelText.forestOptions;

export default class ForestControls extends React.Component {

  componentDidUpdate(prevProps) {
    if (prevProps.forestSelectIndex !== this.props.forestSelectIndex) {
      LayersHelper.updateForestDefinitions(this.props.forestSelectIndex);
    }
  }

  componentWillReceiveProps(nextProps) {
    // Set the default layer definition when the map has been loaded
    if (!this.props.loaded && nextProps.loaded) {
      LayersHelper.updateForestDefinitions(nextProps.forestSelectIndex);
    }
  }

  render () {
    let activeItem = forestOptions[this.props.forestSelectIndex];
    return <div>
      <div className='timeline-container relative forest'>
        <select className='pointer' value={activeItem.value} onChange={this.changeForestTimeline}>
          {forestOptions.map(this.optionsMap, this)}
        </select>
        <div className='active-forest-control gfw-btn sml white'>{activeItem.label}</div>
      </div>
    </div>;
  }

  optionsMap (item, index) {
    return <option key={index} value={item.value}>{item.label}</option>;
  }

  changeForestTimeline (evt) {
    layerActions.changeForestTimeline(evt.target.selectedIndex);
  }

}
