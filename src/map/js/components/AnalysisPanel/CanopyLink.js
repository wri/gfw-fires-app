import {modalActions} from 'actions/ModalActions';
import {layerPanelText} from 'js/config';
import React from 'react';

let CanopyLink = props => {
  return (
    <span className='canopy-link'>
      <span className='canopy-text'>with</span>
      <span className='canopy-density-label'>{props.canopyDensity}</span>
      <span className='gfw-link pointer' onClick={modalActions.showCanopyModal}>{layerPanelText.treeCover.densitySecond}</span>
    </span>
  );
};

export { CanopyLink as default };
