/* @flow */
import ModalWrapper from 'components/Modals/ModalWrapper';
import {fireModalConfig} from 'js/config';
import React, {
  Component
} from 'react';

export default class FiresModal extends Component {
	displayName: FiresModal;

	render () {
		return (
				<ModalWrapper>
					<div>{fireModalConfig.info}</div>
				</ModalWrapper>
		);
	}

}
