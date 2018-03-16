import LayersHelper from 'helpers/LayersHelper';
import React from 'react';

export default class LayerTransparency extends React.Component {

  constructor (props) {
    super(props);
    this.state = { opacity: props.initalOpacity || 1 };
  }

  render () {
    return (
      <div className='layer-transparency'>
        <div>Transparency</div>
        <input type='range' min='0' max='1' step='0.01'
          value={this.state.opacity}
          onChange={this.changeOpacity.bind(this)} />
      </div>
    );
  }

  changeOpacity (event) {
    event.target.value = +event.target.value;
    this.setState({ opacity: event.target.value });

    this.props.layers.forEach((layer) => {
      LayersHelper.changeOpacity({
        layerId: layer.key,
        value: event.target.value
      });
    });
  }
}
