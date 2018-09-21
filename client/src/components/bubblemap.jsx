import PropTypes from 'prop-types';
import React from 'react';
import Datamaps from 'datamaps';
import axios from 'axios';

const MAP_CLEARING_PROPS = [
  'height', 'scope', 'setProjection', 'width', 'searched'
];

const propChangeRequiresMapClear = (oldProps, newProps) => {
  return MAP_CLEARING_PROPS.some((key) =>
		oldProps[key] !== newProps[key]
  );
};

export default class Bubblemap extends React.Component {
	
  constructor(props) {
		super(props);
        this.resizeMap = this.resizeMap.bind(this);
        this.state = {
            bubbles: [],
            prevSearch: '',
            finishedSearch: false,
        }
        this.getBubbles = this.getBubbles.bind(this);
        this.clear = this.clear.bind(this);
        this.drawMap = this.drawMap.bind(this);
  }

  componentDidMount() {
		if (this.props.responsive) {
			window.addEventListener('resize', this.resizeMap);
        }
        if (this.props.searched.length) {
            this.getBubbles(this.props.searched);
        }
		this.drawMap();
  }

  componentWillReceiveProps(newProps) {
		if (propChangeRequiresMapClear(this.props, newProps)) {
            this.clear();
            this.setState({
                finishedSearch: false,
            })
		}
  }

  componentDidUpdate() {
        if (this.props.searched.length && this.props.searched !== this.state.prevSearch) {
            this.getBubbles(this.props.searched);
        } else if (!this.state.finishedSearch && this.state.prevSearch.length) {
            this.getBubbles(this.state.prevSearch);
        }
        //this.drawMap();
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
		let map = this.map;

		if (!map) {
			map = this.map = new Datamaps({
				scope: this.props.scope,
				labels: this.props.labels,
				element: this.refs.container,
			 	geographyConfig: this.props.geographyConfig,
				bubblesConfig: {
					borderColor: '#000000',
					fillOpacity: 0.3,
					borderOpacity: 0.3,
				}
			});
			map.options.fills = {defaultFill: '#000000'}
			map.bubbles(this.state.bubbles, {
				popupTemplate: function (geo, data) {
					return ['<div class="hoverinfo">' +  data.place,
						'<br/>' +  data.text + 
						'</div>'].join('');
				}
            });
        }
    }
    
    getBubbles(query) {
        axios.post('/bubbles', { query: query})
        .then((response) => {
            this.setState({
                bubbles: response.data,
                prevSearch: query,
                finishedSearch: true
            });
        }).then(this.clear).then(this.drawMap).catch(console.log);
        // axios.get(`localhost:3000/bubbles/${query}`)
        //         .then((response) => {
        //             this.setState({
        //                 bubbles: response.data,
        //                 prevSearch: query,
        //                 finishedSearch: true
        //             });
        //             console.log(response.data);
        //         }).catch((err) => {
        //             return console.error(err);
        //         });
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
