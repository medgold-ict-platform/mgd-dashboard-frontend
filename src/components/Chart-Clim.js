import CanvasJSReact from './canvasjs.react';
import React from 'react';
import api from '../api/client';

var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const colors = [ '#ffcccc','#ffb8b8', '#f4a582', '#d6604d', '#b2182b', '#67001f']
// const months = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

class Climchart extends React.Component {	
	constructor(props) {
		super(props);
		this.toggleDataSeries = this.toggleDataSeries.bind(this);
		this.state={
			all_months: !props.monthly,
			data:[],
			min: 0,
			max: 0,
			b: 0,
			xvalue: '',
			interval: 5		
		}
	}

	componentDidUpdate(prevprops) {
		if(this.props !== prevprops){
			if(this.props.location !== '' &&
				this.props.location !== prevprops.location){
				this.removeElement('export-historical')
				this.loadData();
			} 
		}
	}

	// rangeChanging(e){
	// 	console.log("E", e);
	// 	var viewportMinimum = e.axisX[0].viewportMinimum;
	// 	var viewportMaximum = e.axisX[0].viewportMaximum;
	// 	console.log("MIN", viewportMinimum)
	// 	console.log("MAX", viewportMaximum)
	// 	var maxY = 0;
	// 	for(var i = 0; i < e.data.length; i++){
	// 	  for(var j = 0; j < e.data[i].dataPoints.length; j++){
	  
	// 		if(e.data[i].dataPoints[j].x >= viewportMinimum && e.data[i].dataPoints[j].x <= viewportMaximum && e.data[i].dataPoints[j].y > maxY){
	// 		  maxY = e.data[i].dataPoints[j].y;        
	// 		}
	// 	  }
	// 	}
	// 	if(!e.options.axisY)
	// 		e.options.axisY = {};
	// 	e.options.axisY.viewportMaximum = maxY
	// }	

	// // if(e.data[0].dataPoints.length > 300){
	// // 	e.options.axisX.intervalType = "year";
	// // 	e.options.axisX.interval = 10;
	// // }
	
	rangeChanging(e){	
		console.log("E", e)
		var hours=1000*60*60;
		if(e.trigger === "reset") 
			e.chart.options.axisX.intervalType = null;
				//e.chart.options.axisX.interval = "5";
				// console.log("TRIGGER", e.trigger)
				// console.log("NULL",e.chart.options.axisX.intervalType )
				//alert("Errore reset")
		
		if(e.trigger === "zoom"){
			// console.log("TRIGGER", e.trigger);
			var diff = (e.axisX[0].viewportMaximum - e.axisX[0].viewportMinimum);
			console.log("DIFF", diff);
			// console.log("RES_MONTH",diff/(hours*24*30))
				
			if(((e.chart.axisX[0].viewportMaximum - e.axisX[0].viewportMinimum)/(hours))<12) 
				e.chart.options.axisX.intervalType = "NULL";

			//Month (Comparing Months)
			else if(((e.axisX[0].viewportMaximum - e.axisX[0].viewportMinimum)/(hours*24*30))<30){
				e.chart.options.axisX.intervalType = "month";
				e.chart.options.axisX.interval = "1"
			}	
			//Year (Comparing Years)
			else if(((e.chart.axisX[0].viewportMaximum - e.axisX[0].viewportMinimum)/(hours*24*30*30))<12) 
				e.chart.options.axisX.intervalType = "year";			
		}
		console.log(e.chart.options.axisX.intervalType)
	}				
			
	

	loadData = () => {
		var type = this.props.type.toLowerCase()
		var { location } = this.props;
		const { all_months } = this.state;

		if(type === 'risk'){
			type = 'index'
		}
		
		let params = {
			"tab":this.props.tab.toLowerCase(),
			"stype": type,
			"value": this.props.value.toLowerCase().replace(' ', '_'),
			"location": location,
		}

		if(this.props.monthly){
			params["month"]= all_months ? 0 : this.props.month
		}
		
		api.MatchLocation(params)
		.then((response) => {
			var values = []
			var tickFormat =[]
			var elements = []
			response.body.map(function(el, index){
				elements.push(el['value'])
				return null
			})

			var max = Math.max(...elements.values())
			var min = Math.min(...elements.values())
			var b = parseFloat((Math.abs(max)) / (colors.length-1))
			var xvalue = ''
			this.setState({b:b, min: min, max:max})
			const _this = this
			response.body.map(function(item){
				var month = 0
				if(type !== 'ecv'){
					month = 1
					values.push({"x": parseInt(item['year']), "y": item['value'], "label": parseInt(item['year']), "color": '#000000'})
					tickFormat.push(item['year'])
					xvalue = "####"
				}else{
					var x = ""
					month = item['month']
					var date = new Date(parseInt(item['year']), parseInt(month)-1)
					params["month"]!=0 ? x = parseInt(item['year']) : x=date
					params["month"]!=0 ? xvalue="#### " + date.toLocaleString('en-GB', { month: 'short' }) : xvalue="YYYY MMM"
					values.push({"x": x, "y": item['value'], "label": date.getFullYear()+' '+ date.toLocaleString('en-GB', { month: 'short' }), "color": '#000000'})
					tickFormat.push(item['year']+' '+ month)
					xvalue = xvalue
				}
				return null
			})
			var name_of_file = this.props.tab+'-'+this.props.value+'-'+this.props.sliderMin+' '+this.props.sliderMax+'-'+this.props.latitude+'_'+this.props.longitude
			this.setState({data: values, tickFormat: tickFormat, b:b, min:min, max:max, xvalue:xvalue})
			this.removeElement('export-historical')
			this.addElementOnMenu('Save as CSV','export-historical', this.state.data, name_of_file)

        })
        .catch(err => {
            console.error(err);
       	});
	}

	convertToCSV(arr, name_of_file) {
		var title = ['tab', 'variable', 'interval', 'lat', 'lon']
		var header = name_of_file.split('-')
		var labels = ['period','value']
		const array = [title].concat([header]).concat([labels]).concat(arr)
        return array.map(it => {
			var newIt = []
			if(it.y !== undefined){
				newIt.push(it.label)
				newIt.push(it.y)
			}else{
				console.log(it)
				newIt = it
			}
            return Object.values(newIt).toString()
        }).join('\n')
	}
	
	addElementOnMenu =(title, className, data, name_of_file) => {
		var div = document.getElementsByClassName('canvasjs-chart-toolbar')[0].childNodes[3]
		var element = document.createElement("div");
		element.style.cssText = "padding: 12px 8px; background-color: white; color: black; width:170px;"
		element.innerHTML = title;
		element.className = className
		element.onclick = () =>{ 
			var csv  = 'data:text/plain;charset=utf-8,'+this.convertToCSV(data, name_of_file)
			var uri = encodeURI(csv)
			var a = document.createElement("a");
			a.href = uri;
			a.setAttribute("download", name_of_file + ".csv");
			document.body.appendChild(a);
			a.click();
		}
		element.addEventListener("mouseover",function(){
			element.style.background = 'rgb(33,150,243)';
			element.style.color = 'black';
		});
		element.onmouseout = function() {
			element.style.backgroundColor = 'white';
			element.style.color = 'black';
		};
		div.appendChild(element)
	}

	componentDidMount() {
		this.loadData()
	}

	removeElement(className){
		const removeElements = (elms) => elms.forEach(el => el.remove());
		removeElements(document.querySelectorAll("."+className))
	}

	toggleDataSeries(e){
		if(this.props.monthly){
			console.log(e.dataSeries)
			this.setState({ all_months: e.dataSeries.name.includes('(All)')}, () => {
				this.loadData()
				this.removeElement('export-historical')
			})
		} 
		document.getElementsByClassName('canvasjs-chart-toolbar')[0].children[1].click()
		this.chart.render();
	}
	
	render() {
		let data = [{
			type: "column",
			colorSet:"greenShades",
			name: `${this.props.value} (All)`,
			nameFontSize:15,
			color: "#FFFFFF",
			labelFontSize: 15,
			yValueFormatString: "#.##",
			//xValueType: "dateTime",
			xValueFormatString: this.state.xvalue,
			showInLegend: true,
			visible: this.state.all_months,
			toolTipContent: "Period: {x}<br>Value: {y}",
			dataPoints: this.state.data
		}]

		if (this.props.monthly) {
			data.unshift({
				type: "column",
				colorSet:"greenShades",
				name: `${this.props.value} (${new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(0, this.props.month, 0))})`,
				color: "#FFFFFF",
				labelFontSize: 15,
				yValueFormatString: "#.##",
				//xValueType: "dateTime",
				xValueFormatString: this.state.xvalue,
				showInLegend: true,
				visible: !this.state.all_months,
				toolTipContent: "Period: {x}<br>Value: {y}",
				dataPoints: this.state.data
			})
		}

		const options = {
			//rangeChanging: this.chart === undefined ? '' : this.rangeChanging(this.chart),
			rangeChanging: this.rangeChanging,
			height:200,
			theme: "light2",
			animationEnabled: true,
			interactivityEnabled: true,
			backgroundColor: "#FFFFFF",
			exportEnabled: true,
			labelFontSize: 15,
			animationDuration: 2000,
			zoomEnabled: true,
			title:{
				text: this.props.monthly ? `${this.props.value} ${this.props.sliderMin}-${this.props.sliderMax} ${this.props.monthString} (Lat: ${parseFloat(this.props.latitude).toFixed(2)}, Lon: ${parseFloat(this.props.longitude).toFixed(2)})` :
						`${this.props.value} ${this.props.sliderMin}-${this.props.sliderMax} (Lat: ${parseFloat(this.props.latitude).toFixed(2)}, Lon: ${parseFloat(this.props.longitude).toFixed(2)})`
			},
			dataPointMaxWidth: 100,
			dataPointMinWidth: 1,
			// subtitles: [{
			// 	text: "Click Legend to Hide or Unhide Data Series"
			// }],
			axisX: {
                title: "Time Interval",
				intervalType : "month",
				valueFormatString: this.state.xvalue, 
				labelAutoFit : true,
				titleFontColor: "#000000",
				lineColor: "#007090",
				labelFontColor: "#000000",
				tickColor: "#007090",
				fillOpacity: 0.85,
				titleFontSize: 15,
				labelFontSize: 15
			},
			axisY: [{
				title: "Value",
				titleFontColor: "#000000",
				lineColor: "#007090",
				labelFontColor: "#000000",
				tickColor: "#007090",
				includeZero: false,
				labelFontSize: 15,
				fillOpacity: 0.88,
				margin: 20,
				titleFontSize: 15,
				gridThickness: 0
			 },
			 {
				interval: 33.333333333,
				maximum: 100,
				lineThickness: 0,
				tickColor: "#FFFFFF",
				gridColor: "#007090",
				labelFontSize: 15,
				fillOpacity: 0.88,
				gridThickness: 1,
				margin:0,
				labelFormatter: function (e) {
					return ""
				}
			 },
			//  {
			// 	titleFontColor: "#000000",
			// 	labelFontColor: "#000000",
			// 	tickColor: "#000000",
			// 	interval: 50,
			// 	maximum: 100,
			// 	labelFontSize: 15,
			// 	gridThickness: 0,
			// 	labelFormatter: function (e) {
			// 		if (e.value < 33.3)
			// 			return "Lower";
			// 		else if(e.value > 33.3 && e.value < 66.7)
			// 			return "Medium";
			// 			else return "Upper"
			// 	} 
			// }
			],
			toolTip: {
				shared: false
			},
			legend: {
				itemclick: this.toggleDataSeries,
				cursor: "pointer"
			},
			data: data
		}
		
		return (
		<div style={this.props.style}>
			{
			<CanvasJSChart options = {options} 
				onRef={ref => this.chart = ref}/>}
		</div>
		);
	}
			
}
 
export default Climchart;