import {layerActions} from 'actions/LayerActions';
import LayersHelper from 'helpers/LayersHelper';
import {layerPanelText} from 'js/config';
import FireHistoryLegend from 'components/LayerPanel/FireHistoryLegend';
import React from 'react';

let fireHistoryOptions = layerPanelText.fireHistoryOptions;
let playing = false;

let win = {};
win.requestAnimationFrame = (function () {
	return win.requestAnimationFrame ||
		win.webkitRequestAnimationFrame ||
		win.mozRequestAnimationFrame ||
		win.oRequestAnimationFrame ||
		win.msRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1500);
		};
})();
let i = 0;

export default class FireHistoryTimeline extends React.Component {

	componentDidUpdate(prevProps) {
		if (prevProps.fireHistorySelectIndex !== this.props.fireHistorySelectIndex) {
			LayersHelper.updateFireHistoryDefinitions(this.props.fireHistorySelectIndex);
		}
	}

	increaseFireHistoryYear = (evt) => {
		if(this.props.fireHistorySelectIndex < 14) {
			layerActions.incrementFireHistoryYear();
		}
	}

	decreaseFireHistoryYear = (evt) => {
		if(this.props.fireHistorySelectIndex > 0) {
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
				<div className={`history-play backward ${this.props.fireHistorySelectIndex === 0 ? 'disable': ''}`} onClick={this.decreaseFireHistoryYear}></div>
        <div className='fires-history-cover-control gfw-btn sml white'>{activeItem.label}</div>
				<div className={`history-play ${this.props.fireHistorySelectIndex === 14 ? 'disable': ''}`} onClick={this.increaseFireHistoryYear}></div>
      </div>
    </div>;
	}

	optionsMap (item, index) {
		return <option key={index} value={index}>{item.label}</option>;
	}

	updateFireHistoryDefinitions (evt) {
		layerActions.changeFireHistoryTimeline(evt.target.selectedIndex);
	}

	toggleTimeline (evt) {

		if (evt.target.classList.contains('playing')) {
			evt.target.classList.remove('playing');
			playing = false;
			setTimeout(function () {
				i = 0; //timeout b/c the last requestAnimationFrame is still firing! If we can stop it, we can remove this setTimeout
			}, 1500); //todo: use interval and clearinterval

			return;
		} else {
			evt.target.classList.add('playing');
			playing = true;

			function fade() {
				if (i === fireHistoryOptions.length) {
					playing = false;
					document.getElementById('timelinePlayer').classList.remove('playing');
					i = 0;
					return;
				}

				layerActions.changeFireHistoryTimeline(i);

				if (playing === true) {
					win.requestAnimationFrame(fade);
				} else {
					document.getElementById('timelinePlayer').classList.remove('playing');
					i = 0;
					return;
				}
				i++;
			}

			win.requestAnimationFrame(fade);
		}

	}

}
