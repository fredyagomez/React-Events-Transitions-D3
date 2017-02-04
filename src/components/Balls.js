import React, { PropTypes } from 'react';
import { timer } from 'd3-timer';
import { interpolateString } from 'd3-interpolate';

//Redux
import { connect } from 'react-redux';
import { newPosition } from '../actions';

const styling = 'width: 60px; height: 60px; background: radial-gradient(circle at 50% 120%, #81e8f6, #76deef 10%, #055194 80%, #062745 100%); border-radius: 50%; position: absolute;';

class Balls extends React.Component {
  static propTypes = {
    AppState: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired
  }	
  constructor (props) {
    super(props);
    this._onDragOver = this._onDragOver.bind(this);
    this._onDragStart = this._onDragStart.bind(this);
    this._onDrop= this._onDrop.bind(this);
	this._onMouseEnter = this._onMouseEnter.bind(this);
	this._onMouseLeave = this._onMouseLeave.bind(this);
	this.where_to_go = this.where_to_go.bind(this);
	this.roll_it = this.roll_it.bind(this);
    this.state = {flag_tooltip: false};
  }
  componentDidMount () {
	this.props.AppState.map((div, index) => {
      let this_div = div.div;
      this.refs[this_div].setAttribute('style', styling + ' top: ' + this.props.AppState[index].y + 'px; left: ' + this.props.AppState[index].x + 'px;');
	});
  }
  _onMouseEnter () {
    this.setState({flag_tooltip: true});
  }
  _onMouseLeave () {
    this.setState({flag_tooltip: false});
  }
  _onDragStart (event) {
    this.dragged = event.target.id;
  }  
  _onDragOver (event) {
    event.preventDefault();
	
	//Identify which one is being dragged
	this.props.AppState.map((div,index)=> {
      if (this.dragged==div.div) {
        let item = this.props.AppState;
		let divt = this.dragged;
		item[index]= {div:div.div,x:event.clientX-25,y:event.clientY-25};
		//this.setState({data:item});
		this.props.dispatch(newPosition(item));
        //console.log(this.props.AppState);
		this.refs[divt].setAttribute('style', '');
		
		//Check for balls which have been hit
		this.who_got_hit(index);
      }
	});
  }
  
  who_got_hit(index) {
	let i;
	for (i = 0; i < this.props.AppState.length; i++) {
      if (i !== index) {
		let hitter_x = this.props.AppState[index].x;
		let fixed_x = this.props.AppState[i].x;
		let hitter_y = this.props.AppState[index].y;
		let fixed_y = this.props.AppState[i].y;
		
		//Is the dragged-ball hitting a fixed-ball?
		if ((fixed_x + 80 > hitter_x && hitter_x > fixed_x -50) && 
			(fixed_y + 50 > hitter_y && hitter_y > fixed_y - 45)) {
				let order = "div"+i;
				
				//Is the hitter ball moving up-right, up-left, down-right, down-left?
				this.where_to_go(hitter_x, fixed_x, hitter_y, fixed_y, order, i);
		}
      }
    }
  } 
  
  where_to_go(hitter_x, fixed_x, hitter_y, fixed_y, order, i) { 
	if ((hitter_x-fixed_x < 0)&&(hitter_y-fixed_y < 0)) {
		let addx = this.props.AppState[i].x + 200, addy = this.props.AppState[i].y + 200;	
		this.roll_it(addx, addy, order, i);	
		
	} else if ((hitter_x-fixed_x < 0)&&(hitter_y-fixed_y > 0)) {
		let addx = this.props.AppState[i].x + 200, addy = this.props.AppState[i].y - 200;
		this.roll_it(addx, addy, order, i);
	
	} else if ((hitter_x-fixed_x > 0)&&(hitter_y-fixed_y > 0)) {
		let addx = this.props.AppState[i].x - 200, addy = this.props.AppState[i].y - 200;
		this.roll_it(addx, addy, order, i);
	
	} else if ((hitter_x-fixed_x > 0)&&(hitter_y-fixed_y < 0)) {
		let addx = this.props.AppState[i].x - 200, addy = this.props.AppState[i].y + 200;
		this.roll_it(addx, addy, order, i);
	
	} else {alert('that is a new move. I dont have the code for that yet. Sorry!');}
  }
  
  roll_it(addx, addy, order, i) {
	
	//initial and end values
	let x1 = this.props.AppState[i].x +'px', y1 = this.props.AppState[i].y + 'px';
	let item = this.props.AppState;
	item[i] = {div: "div"+i, x: addx, y: addy};
	this.props.dispatch(newPosition(item));
	//this.setState({data:item});
	let BoxLimit_x = 600; addx > BoxLimit_x ? addx = BoxLimit_x : addx;
	let BoxLimit_y = 600; addy > BoxLimit_y ? addy = BoxLimit_y : addy;
	let x2 = addx + 'px', y2 = addy + 'px';
	let interp0 = interpolateString(`${x1}`, `${x2}`);
	let interp1 = interpolateString(`${y1}`, `${y2}`);
	
	//apply timer and transition
	this.transition = timer(elapsed => {
		let t = elapsed < 500 ? (elapsed / 500): 1; 
		let current_position_x = interp0(t);
		let current_position_y = interp1(t);
		if (current_position_x == '600px' || current_position_y == '600px') {
			this.refs[order].setAttribute('style', '');
		} else {
			this.refs[order].setAttribute('style', styling + ' left: ' + interp0(t) + '; top: '+ interp1(t) + ';');
		}  
		if (t === 1) {
			this.transition.stop();
		}
	});	  
  }
  
  _onDrop (event) {
    event.preventDefault();	
	this.props.AppState.map((div,index)=> {
      if (this.dragged==div.div) {
        let item = this.props.AppState;
		let divt = this.dragged;
		item[index]= {div: div.div, x: event.clientX -25, y: event.clientY -25};
        this.props.dispatch(newPosition(item));
		this.refs[divt].setAttribute('style', styling + ' top: '+ this.props.AppState[index].y  + 'px; left: ' + this.props.AppState[index].x + 'px;');
      }
	});
  } 
  render() {

	let Tooltip;
	if (!this.state.flag_tooltip) {
		Tooltip = (<div> Grab a ball and drag it to hit and push the other balls outside the box! </div>);
	} else {
		Tooltip = (<div></div>);
	}
    return (
      <div width="600px" height="600px">
        <div id="div-1" style={{position: 'relative', width:'600px', height:'600px', margin: '10px', padding: '10px', border: '1px solid black'}} onDrop={this._onDrop} onDragOver={this._onDragOver}>
        {Tooltip}
        {this.props.AppState.map((div,key) => {
          return (<div id={div.div} 
			key={key} 
			ref={div.div}   
			onDragStart={this._onDragStart} 
			draggable="true"
			onMouseEnter={this._onMouseEnter} 
			onMouseLeave={this._onMouseLeave}
			></div>	
          );
        })} 
        </div>
		<h4> &nbsp; Using Synthetic Events + D3 transitions in React </h4>   
      </div> 
    );
  }
}			

const mapStateToProps = state => {
  const { AppState } = state;
  return {
    AppState
  };
};

export default connect(mapStateToProps)(Balls);
