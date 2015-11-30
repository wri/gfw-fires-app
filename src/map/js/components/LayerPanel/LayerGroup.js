import React from 'react';

let closeSymbolCode = 9660,
    openSymbolCode = 9650;

/**
* Get count of active layers in this group
* @param {array} activeLayers - array of keys for the active layers
* @param {array} children - This groups child components, which are layer checkboxes or null
* @return {number} count
*/
let getCount = (activeLayers, children) => {
  let count = 0;
  children.forEach(layer => {
    if (layer && layer.key && activeLayers.indexOf(layer.key) > -1) {
      ++count;
    }
  });
  return count;
};

export default class LayerGroup extends React.Component {

  constructor (props) {
    super(props);
    this.state = { open: true };
  }

  render() {
    let styles = { display: this.state.open ? 'block' : 'none' };
    return (
      <div className='layer-category'>
        <div className='layer-category-label pointer' onClick={this.toggle.bind(this)}>
          {this.props.label}
          <span className='active-layer-count'>({getCount(this.props.activeLayers, this.props.children)})</span>
          <span className='layer-category-caret'>{String.fromCharCode(this.state.open ? closeSymbolCode : openSymbolCode)}</span>
        </div>
        <div className='layer-category-content' style={styles}>{this.props.children}</div>
      </div>
    );
  }

  toggle () {
    this.setState({ open: !this.state.open });
  }

}

LayerGroup.propTypes = {
  label: React.PropTypes.string.isRequired
};
