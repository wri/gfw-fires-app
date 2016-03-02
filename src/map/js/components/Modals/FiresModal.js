import ModalWrapper from 'components/Modals/ModalWrapper';
import {fireModalConfig} from 'js/config';
// import {mapActions} from 'actions/MapActions';
// import {modalActions} from 'actions/ModalActions';
import React from 'react';

export default class FiresModal extends React.Component {

	// constructor (props) {
	// 	super(props);
	// 	mapStore.listen(this.storeUpdated.bind(this));
	// 	this.state = mapStore.getState();
	// }

	// storeUpdated () {
	// 	this.setState(mapStore.getState());
	// }


	render () {
		return (
				<ModalWrapper>
					<div>{fireModalConfig.info}</div>
				</ModalWrapper>
		);
	}

}
