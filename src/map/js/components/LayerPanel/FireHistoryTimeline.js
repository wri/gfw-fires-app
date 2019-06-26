import {layerActions} from 'actions/LayerActions';
import LayersHelper from 'helpers/LayersHelper';
import {layerPanelText} from 'js/config';
import FireHistoryLegend from 'components/LayerPanel/FireHistoryLegend';
import React from 'react';

let fireHistoryOptions = layerPanelText.fireHistoryOptions;

export type FireHistoryProps = {
	fireHistorySelectIndex: number
};

export default class FireHistoryTimeline extends React.Component {

	props: FireHistoryProps;
	displayName: 'FireHistoryTimeline';

	componentDidUpdate(prevProps) {
		if (prevProps.fireHistorySelectIndex !== this.props.fireHistorySelectIndex) {
			LayersHelper.updateFireHistoryDefinitions(this.props.fireHistorySelectIndex);
		}
	}

	increaseFireHistoryYear = () => {
		if (this.props.fireHistorySelectIndex < 14) {
			layerActions.incrementFireHistoryYear();
		}
	}

	decreaseFireHistoryYear = () => {
		if (this.props.fireHistorySelectIndex > 0) {
			layerActions.decrementFireHistoryYear();
		}
	}

	render () {
		let activeItem = fireHistoryOptions[this.props.fireHistorySelectIndex];
    return <div>
      <FireHistoryLegend />
      <div className='timeline-container relative fires-history'>
        <select className='pointer' value={this.props.fireHistorySelectIndex} onChange={this.updateFireHistoryDefinitions}>
          {fireHistoryOptions.map(this.optionsMap, this)}
          </select>
        <div className='fires-history-cover-control gfw-btn sml white'>{activeItem.label}</div>
      </div>
    </div>;
	}

	optionsMap (item, index) {
		return <option key={index} value={index}>{item.label}</option>;
	}

	updateFireHistoryDefinitions (evt) {
		layerActions.changeFireHistoryTimeline(evt.target.selectedIndex);
	}

}
