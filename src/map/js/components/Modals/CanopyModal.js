/* @flow */
import ModalWrapper from 'components/Modals/ModalWrapper';
import {modalActions} from 'actions/ModalActions';
import LayersHelper from 'helpers/LayersHelper';
import {modalText, assetUrls} from 'js/config';
import {mapStore} from 'stores/MapStore';
import {loadJS} from 'utils/loaders';
import React, {
  Component
} from 'react';

type SliderPropType = {
  from_value: number
};

export default class CanopyModal extends Component {
  displayName: CanopyModal;

  constructor(props: any) {
    super(props);
  }

  componentDidMount() {

      loadJS(assetUrls.rangeSlider).then(() => {
        setTimeout(() => {
          $('#tree-cover-slider').ionRangeSlider({
            type: 'single',
            values: modalText.canopy.slider,
            hide_min_max: true,
            grid_snap: true,
            to_fixed: true,
            from_min: 1,
            from_max: 7,
            grid: true,
            from: 5,
            onFinish: this.sliderChanged,
            onUpdate: this.sliderUpdated,
            prettify: value => (value + '%')
          });
        }, 3000);
      }, console.error);
      // Update with the default values
      let defaults = mapStore.getState();
      LayersHelper.updateTreeCoverDefinitions(defaults.canopyDensity);


  }

  sliderChanged (data: SliderPropType) {
    modalActions.updateCanopyDensity(data.from_value);
    LayersHelper.updateTreeCoverDefinitions(data.from_value);
  }

  sliderUpdated (data: SliderPropType) {
    // Component was reset, reset the default definition as well
    LayersHelper.updateTreeCoverDefinitions(data.from_value);
  }

  render() {
    return (
      <ModalWrapper>
        <div id='canopy' className='canopy-modal-title'>{modalText.canopy.title}</div>
        <div className='trees'>
          <div className='tree-icon' />
          <div className='forest-icon' />
        </div>
        <div className='slider-container'>
          <div id='tree-cover-slider' />
        </div>
      </ModalWrapper>
    );
  }

}
