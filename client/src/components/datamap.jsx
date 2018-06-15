import PropTypes from 'prop-types';
import React from 'react';
import Datamaps from 'datamaps';
import axios from 'axios';

const MAP_CLEARING_PROPS = [
  'height', 'scope', 'setProjection', 'width'
];

const propChangeRequiresMapClear = (oldProps, newProps) => {
  return MAP_CLEARING_PROPS.some((key) =>
		oldProps[key] !== newProps[key]
  );
};

export default class Datamap extends React.Component {
	
  // Originally in here when copied over but pops a syntax error
  // static propTypes = {
  // 	return {arc: PropTypes.array,
  // 	arcOptions: PropTypes.object,
  // 	bubbleOptions: PropTypes.object,
  // 	bubbles: PropTypes.array,
  // 	data: PropTypes.object,
  // 	graticule: PropTypes.bool,
  // 	height: PropTypes.any,
  // 	labels: PropTypes.bool,
  // 	responsive: PropTypes.bool,
  // 	style: PropTypes.object,
  // 	updateChoroplethOptions: PropTypes.object,
  // 	width: PropTypes.any}
  // };

  constructor(props) {
		super(props);
		this.resizeMap = this.resizeMap.bind(this);
		this.state = {
			bubbles: [],
			isSwitching: false,
		}
  }

  componentDidMount() {
		if (this.props.responsive) {
			window.addEventListener('resize', this.resizeMap);
		}
		axios.get('/bubbles')
			.then((response) => {
				this.setState({
					bubbles: response.data
				});
				this.drawMap();
			}).catch((err) => {
				return console.error(err);
			});
			console.log(this.state.bubbles);
  }

  componentWillReceiveProps(newProps) {
		if (propChangeRequiresMapClear(this.props, newProps)) {
			this.clear();
			this.setState({
				isSwitching: true
			});
		}
  }

  componentDidUpdate() {
		if (this.state.isSwitching) {
			this.drawMap();
			this.setState({
				isSwitching: false
			})
		}
  }

  componentWillUnmount() {
		this.clear();
		if (this.props.responsive) {
			window.removeEventListener('resize', this.resizeMap);
		}
  }

  clear() {
		const { container } = this.refs;

		for (const child of Array.from(container.childNodes)) {
			container.removeChild(child);
		}

		delete this.map;
	}

  drawMap() {
		const {
			arc,
			arcOptions,
			bubbles,
			bubbleOptions,
			data,
			graticule,
			labels,
			updateChoroplethOptions,
				
			//Originally in here but spread operator is not working for us. Tried pulling props out manually, hopefully didn't miss anything
			// ...props
		} = this.props;

		let map = this.map;

		if (!map) {
			map = this.map = new Datamaps({
				//Originally in here but spread operator is not working for us. Tried pulling props out manually, hopefully didn't miss anything
				// ...props,
				scope: this.props.scope,
				labels: this.props.labels,
				//fills: this.props.fills,
				element: this.refs.container,
			 	geographyConfig: this.props.geographyConfig,
				bubblesConfig: {
					borderColor: '#000000',
					fillOpacity: 0.2,
					borderOpacity: 0.2,
				}
				// data,
			});
			map.options.fills = {defaultFill: '#000000'}
			map.bubbles(this.state.bubbles, {
				popupTemplate: function (geo, data) {
					return ['<div class="hoverinfo">' +  data.place,
						'<br/>' +  data.text + 
						'</div>'].join('');
				}
});
		} else {
				map.options.fills = this.props.fills;
        map.updateChoropleth(data, updateChoroplethOptions);
			}
      //map.legend();
			if (arc) {
				map.arc(arc, arcOptions);
			}

			if (bubbles) {
		  
			}

			if (graticule) {
			  map.graticule();
			}

			if (labels) {
			  map.labels();
			}
	}
	
	resizeMap() {
	  this.map.resize();
	}

	render() {
	  const style = {
			height: this.props.height,
			width: this.props.width,
			position: this.props.position,
	  };
	  return <div ref="container" style={style} />;
	}

}
