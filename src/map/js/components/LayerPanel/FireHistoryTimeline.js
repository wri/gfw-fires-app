// import {layerActions} from 'actions/LayerActions';
// import LayersHelper from 'helpers/LayersHelper';
// import {layerPanelText} from 'js/config';
import FireHistoryLegend from 'components/LayerPanel/FireHistoryLegend';
import React from 'react';

// let forestCoverOptions = layerPanelText.forestCoverOptions;
// let playing = false;

let win = {};
win.requestAnimationFrame = (function () {
	return win.requestAnimationFrame ||
		win.webkitRequestAnimationFrame ||
		win.mozRequestAnimationFrame ||
		win.oRequestAnimationFrame ||
		win.msRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000);
		};
})();
let i = 0;

export default class FireHistoryTimeline extends React.Component {

	// componentDidUpdate(prevProps) {
	// 	if (prevProps.forestCoverSelectIndex !== this.props.forestCoverSelectIndex) {
	// 		LayersHelper.updateForestCoverDefinitions(this.props);
	// 	}
	// }

	render () {
		// let activeItem = forestCoverOptions[this.props.forestCoverSelectIndex];
    return <div>Haayyyyy
      <FireHistoryLegend />
    </div>;
		// return <div className='timeline-container relative forest-cover'>
		// 	<select className='pointer' value={this.props.forestCoverSelectIndex} onChange={this.updateForestCoverDefinitions}>
		// 		{forestCoverOptions.map(this.optionsMap, this)}
		// 	</select>
		// 	<span className='timeline-player' id='timelinePlayer' onClick={this.toggleTimeline.bind(this)}></span>
		// 	<div className='active-forest-cover-control gfw-btn sml white'>{activeItem.label}</div>
		// </div>;
	}

	// optionsMap (item, index) {
	// 	return <option key={index} value={index}>{item.label}</option>;
	// }
  //
	// updateForestCoverDefinitions (evt) {
	// 	layerActions.updateForestCoverDefinitions(evt.target.selectedIndex);
	// }
  //
	// toggleTimeline (evt) {
  //
	// 	if (evt.target.classList.contains('playing')) {
	// 		evt.target.classList.remove('playing');
	// 		playing = false;
	// 		setTimeout(function () {
	// 			i = 0; //timeout b/c the last requestAnimationFrame is still firing! If we can stop it, we can remove this setTimeout
	// 		}, 1000); //todo: use interval and clearinterval
  //
	// 		return;
	// 	} else {
	// 		evt.target.classList.add('playing');
	// 		playing = true;
  //
	// 		function fade() {
	// 			if (i === forestCoverOptions.length) {
	// 				playing = false;
	// 				document.getElementById('timelinePlayer').classList.remove('playing');
	// 				i = 0;
	// 				return;
	// 			}
  //
	// 			layerActions.updateForestCoverDefinitions(i);
  //
	// 			if (playing === true) {
	// 				win.requestAnimationFrame(fade);
	// 			} else {
	// 				document.getElementById('timelinePlayer').classList.remove('playing');
	// 				i = 0;
	// 				return;
	// 			}
	// 			i++;
	// 		}
  //
	// 		win.requestAnimationFrame(fade);
	// 	}
  //
	// }

}
