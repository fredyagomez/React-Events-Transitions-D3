import React from 'react';
import { timer } from 'd3-timer';
import { interpolateString } from 'd3-interpolate';

const styling = 'width: 60px; height: 60px; background: radial-gradient(circle at 50% 120%, #81e8f6, #76deef 10%, #055194 80%, #062745 100%); border-radius: 50%; position: absolute;';

class Balls extends React.Component {
  constructor (props) {
    super(props);
    this._onDragOver = this._onDragOver.bind(this);
    this._onDragStart = this._onDragStart.bind(this);
    this._onDrop= this._onDrop.bind(this);
	this._onMouseEnter = this._onMouseEnter.bind(this);
	this._onMouseLeave = this._onMouseLeave.bind(this);
	this.where_to_go = this.where_to_go.bind(this);
	this.roll_it = this.roll_it.bind(this);
    this.state = {data:[{div:'div0',x: 0,y: 0},
	{div:'div1',x:300,y:150},{div:'div2',x:150,y:400},
	{div:'div3',x:360,y:450}], 
	divs:{}, flag_tooltip: false};
  }
  componentDidMount () {
	this.state.divs = {div0, div1, div2, div3};
	this.roll_it(150, 50, "div0", 0);
    this.state.divs.div1.setAttribute('style', styling + ' top: ' + this.state.data[1].y + 'px; left: ' + this.state.data[1].x + 'px;');
	this.state.divs.div2.setAttribute('style', styling + ' top: ' + this.state.data[2].y + 'px; left: ' + this.state.data[2].x + 'px;');
	this.state.divs.div3.setAttribute('style', styling + ' top: ' + this.state.data[3].y + 'px; left: ' + this.state.data[3].x + 'px;');
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
	this.state.data.map((div,index)=> {
      if (this.dragged==div.div) {
        let item = this.state.data;
		let divt = this.dragged;
		item[index]= {div:div.div,x:event.clientX-25,y:event.clientY-25};
		this.setState({data:item});
		this.state.divs[divt].setAttribute('style', '');
		
		//Check for balls which have been hit
		this.who_got_hit(index);
      }
	});
  }
  
  who_got_hit(index) {
	let i;
	for (i = 0; i < this.state.data.length; i++) {
      if (i !== index) {
		let hitter_x = this.state.data[index].x;
		let fixed_x = this.state.data[i].x;
		let hitter_y = this.state.data[index].y;
		let fixed_y = this.state.data[i].y;
		
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
		let addx = this.state.data[i].x + 200, addy = this.state.data[i].y + 200;	
		this.roll_it(addx, addy, order, i);	
		
	} else if ((hitter_x-fixed_x < 0)&&(hitter_y-fixed_y > 0)) {
		let addx = this.state.data[i].x + 200, addy = this.state.data[i].y - 200;
		this.roll_it(addx, addy, order, i);
	
	} else if ((hitter_x-fixed_x > 0)&&(hitter_y-fixed_y > 0)) {
		let addx = this.state.data[i].x - 200, addy = this.state.data[i].y - 200;
		this.roll_it(addx, addy, order, i);
	
	} else if ((hitter_x-fixed_x > 0)&&(hitter_y-fixed_y < 0)) {
		let addx = this.state.data[i].x - 200, addy = this.state.data[i].y + 200;
		this.roll_it(addx, addy, order, i);
	
	} else {alert('that is a new move. I dont have the code for that yet. Sorry!');}
  }
  
  roll_it(addx, addy, order, i) {
	
	//initial and end values
	let x1 = this.state.data[i].x +'px', y1 = this.state.data[i].y + 'px';
	let item = this.state.data;
	item[i] = {div: "div"+i, x: addx, y: addy};
	this.setState({data:item});
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
			this.state.divs[order].setAttribute('style', '');
		} else {
			this.state.divs[order].setAttribute('style', styling + ' left: ' + interp0(t) + '; top: '+ interp1(t) + ';');
		}  
		if (t === 1) {
			this.transition.stop();
		}
	});	  
  }
  
  _onDrop (event) {
    event.preventDefault();	
	this.state.data.map((div,index)=> {
      if (this.dragged==div.div) {
        let item = this.state.data;
		let divt = this.dragged;
		item[index]= {div: div.div, x: event.clientX -25, y: event.clientY -25};
        this.setState({data:item});
		this.state.divs[divt].setAttribute('style', styling + ' top: '+ this.state.data[index].y  + 'px; left: ' + this.state.data[index].x + 'px;');
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
        {this.state.data.map((div,key) => {
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
export default Balls;
