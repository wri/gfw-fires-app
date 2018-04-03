import React from 'react';

export default class PlanetImagery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: false,
            activeCategory: 'PLANET-MONTHLY'
        };
    }
    
    toggle() {
        this.setState({ checked: !this.state.checked });
    }

    setCategory(evt) {
        const id = evt.target.id;
        this.setState({ activeCategory: id });
    }

    render () {
        const { checked, activeCategory } = this.state;
        return (
            <div className={`layer-checkbox relative ${checked ? 'active' : ''}`}>
                <span className='toggle-switch pointer' onClick={this.toggle.bind(this)}>
                    <span/>
                </span>
                <span className='layer-checkbox-label pointer' onClick={this.toggle.bind(this)}>
                    Planet Basemaps
                </span>
                <div className={`layer-content-container flex justify-center ${checked ? '' : 'hidden'}`}>
                    <div className='flex'>
                        <div
                            id='PLANET-MONTHLY'
                            onClick={this.setCategory.bind(this)}
                            className={`planet-category ${activeCategory === 'PLANET-MONTHLY' ? 'active' : ''}`}
                        >
                            Monthly
                        </div>
                        <div
                            id='PLANET-QUARTERLY'
                            onClick={this.setCategory.bind(this)}
                            className={`planet-category ${activeCategory === 'PLANET-QUARTERLY' ? 'active' : '' }`}
                        >
                            Quarterly
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}