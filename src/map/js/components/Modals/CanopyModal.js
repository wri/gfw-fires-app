/* @flow */
import ModalWrapper from 'components/Modals/ModalWrapper';
import {modalActions} from 'actions/ModalActions';
import LayersHelper from 'helpers/LayersHelper';
import {modalText, assetUrls} from 'js/config';
// import {mapStore} from 'stores/MapStore';
// import {loadJS} from 'utils/loaders';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import React, {
  Component
} from 'react';

// type SliderPropType = {
//   from_value: number
// };

const marks = {
  0: {
    label: '0%',
    style: {
      fontSize: 8,
      top: 10
    }
  },
  10: {
    label: '10%',
    style: {
      fontSize: 8,
      top: 10
    }
  },
  15: {
    label: '15%',
    style: {
      fontSize: 8,
      top: 10
    }
  },
  20: {
    label: '20%',
    style: {
      fontSize: 8,
      top: 10
    }
  },
  25: {
    label: '25%',
    style: {
      fontSize: 8,
      top: 10
    }
  },
  30: {
    label: '30%',
    style: {
      fontSize: 8,
      top: 10
    }
  },
  50: {
    label: '50%',
    style: {
      fontSize: 8,
      top: 10
    }
  },
  75: {
    label: '75%',
    style: {
      fontSize: 8,
      top: 10
    }
  },
  100: {
    label: '100%',
    style: {
      fontSize: 8,
      top: 10
    }
  }
};

const SliderWithTooltip = createSliderWithTooltip(Slider);
function percentFormatter(v) {
  return `${v} %`;
}

export default class CanopyModal extends Component {
  displayName: CanopyModal;

  constructor(props: any) {
    super(props);
    this.state = {
      canopyValue: 30
    };
  }

  // componentDidMount() {
  //     loadJS(assetUrls.rangeSlider).then(() => {
  //       setTimeout(() => {
  //         $('#tree-cover-slider').ionRangeSlider({
  //           type: 'single',
  //           values: modalText.canopy.slider,
  //           hide_min_max: true,
  //           grid_snap: true,
  //           to_fixed: true,
  //           from_min: 1,
  //           from_max: 7,
  //           grid: true,
  //           from: 5,
  //           onFinish: this.sliderChanged,
  //           onUpdate: this.sliderUpdated,
  //           prettify: value => (value + '%')
  //         });
  //       }, 3000);
  //     }, console.error);
  //     // Update with the default values
  //     let defaults = mapStore.getState();
  //     LayersHelper.updateTreeCoverDefinitions(defaults.canopyDensity);
  //
  //
  // }

  // sliderChanged (data: SliderPropType) {
  //   console.log('SLIDER CHANGED', data);
  //   modalActions.updateCanopyDensity(data.from_value);
  //   LayersHelper.updateTreeCoverDefinitions(data.from_value);
  // }
  //
  // sliderUpdated (data: SliderPropType) {
  //   console.log('SLIDER UPDATED', data);
  //   // Component was reset, reset the default definition as well
  //   LayersHelper.updateTreeCoverDefinitions(data.from_value);
  // }

  handleChange (data) {
    if (data === 0) {
      this.setState({canopyValue: 10}, () => {
        modalActions.updateCanopyDensity(10);
        LayersHelper.updateTreeCoverDefinitions(10);
      });
    } else if (data === 100) {
      this.setState({canopyValue: 75}, () => {
        modalActions.updateCanopyDensity(75);
        LayersHelper.updateTreeCoverDefinitions(75);
      });
    } else {
      this.setState({canopyValue: data}, () => {
        modalActions.updateCanopyDensity(data);
        LayersHelper.updateTreeCoverDefinitions(data);
      });
    }
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
          {/* <div id='tree-cover-slider' /> */}
          <SliderWithTooltip
            defaultValue={30}
            value={this.state.canopyValue}
            min={0}
            max={100}
            marks={marks}
            step={null}
            onChange={this.handleChange.bind(this)}
            tipFormatter={percentFormatter}
            dotStyle={{
              bottom: -15,
              marginLeft: 0,
              width: 1,
              height: 5,
              borderRadius: 0,
              border: 'none',
              backgroundColor: 'grey'
            }}
            activeDotStyle={{
              marginTop: -3,
              border: 'none'
            }}
            trackStyle={{backgroundColor: 'white', height: 10}}
            railStyle={{backgroundColor: '#8cb436', height: 10}}/>
        </div>
      </ModalWrapper>
    );
  }

}
