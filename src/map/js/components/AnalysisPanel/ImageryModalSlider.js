import React, { Component } from 'react';

//  import Slider from 'rc-slider';
import {mapActions} from 'actions/MapActions';
// const createSliderWithTooltip = Slider.createSliderWithTooltip;
// const Range = createSliderWithTooltip(Slider.Range);

 export default class AnalysisRangeSlider extends Component {
  // constructor(props) {
  //   super(props);

  //    const { initialStartValue, initialEndValue, bounds } = props;

  //    this.rangeArray = [...Array(bounds[1] + 1 - bounds[0]).keys()].map((i, idx) => idx + bounds[0]);
  //   const start = initialStartValue || bounds[0];
  //   const end = initialEndValue || bounds[1];

  //    this.state = {
  //     rangeSliderValue: [
  //       start,
  //       end,
  //     ],
  //     sliderMarks: {
  //       [start]: <small>{start}</small>,
  //       [end]: <small>{end}</small>,
  //     },
  //   };
  // }

  //  componentDidMount() {
  //   const {
  //     rangeSliderCallback,
  //     analysisId,
  //     startParamName,
  //     endParamName,
  //     valueType,
  //     combineParams,
  //     valueSeparator,
  //   } = this.props;
  //   const { rangeSliderValue } = this.state;

  //    // Set the default params to to pass in the request
  //   rangeSliderCallback(
  //     rangeSliderValue,
  //     analysisId,
  //     combineParams,
  //     startParamName,
  //     endParamName,
  //     valueSeparator,
  //     valueType,
  //   );

  //   mapActions.updateAnalysisSliderIndices({
  //     id: analysisId,
  //     indices: [this.rangeArray.indexOf(rangeSliderValue[0]), this.rangeArray.indexOf(rangeSliderValue[1])]
  //   });
  // }

  //  handleChange = rangeSliderValue => {
  //   const [ rangeSliderStart, rangeSliderEnd ] = rangeSliderValue;
  //   this.setState({
  //     rangeSliderValue,
  //     sliderMarks: {
  //       [rangeSliderStart]: <small>{rangeSliderStart}</small>,
  //       [rangeSliderEnd]: <small>{rangeSliderEnd}</small>,
  //     },
  //   });
  // }

   render() {
    // const { bounds, step, rangeSliderCallback } = this.props;
    // const { rangeSliderValue, sliderMarks } = this.state;
    return (
      <div className='analysis-results__select-form-item-container'>Slider
        {/* <Range
          className='select-form-item'
          min={bounds[0]}
          max={bounds[1]}
          value={rangeSliderValue}
          allowCross={false}
          onChange={this.handleChange}
          onAfterChange={rangeSliderCallback}
          step={step}
          marks={sliderMarks}
          dots={bounds[1] - bounds[0] <= 20}
          trackStyle={[{backgroundColor: '#f0ab00'}]}
          handleStyle={[{borderColor: '#f0ab00'}]}
          dotStyle={{border: '1px solid #e9e9e9'}}
          activeDotStyle={{border: '1px solid #f0ab00'}}
        /> */}
      </div>
    );
  }
}
