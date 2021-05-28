import CanvasJSReact from './canvasjs.react';
import React from 'react';
import api from '../api/client';

var CanvasJSChart = CanvasJSReact.CanvasJSChart;


class Chart extends React.Component {	
	constructor(props) {
		super(props);
		this.toggleDataSeries = this.toggleDataSeries.bind(this);
		this.state={
			all_months: !props.monthly,
			data:[],
			tickFormat: "",
			xvalue: "",
			obs_data:[],
			viewportMinimum: "",
			viewportMaximum:"",
		}
	}

	componentDidUpdate(prevprops) {
		if(this.props !== prevprops) {
			if(this.props.location !== '' &&
			this.props.value !== '' &&
			this.props.leadt !== '' &&
			this.props.type !== ''
			&& this.props.location !== prevprops.location){
				this.removeElement('export-data')
				this.loadData();
			}
		}
	}

	loadData = () => {
		var type = this.props.type.toLowerCase()
		var location = this.props.location
		const { all_months } = this.state;
		if(type === 'risk'){
			type = 'index'
		}
		
		let params = {
			"stype": type,
			"value": this.props.value.toLowerCase().replace(' ', '_'),
			"location": location,
			"leadt": this.props.leadt
		}

		if(this.props.monthly) params["month"]= all_months ? 0 : this.props.month;
		
		api.MatchLocationSeasonal(params)
        .then((response) => {
			if(response.body.length){
				//Padding years to present
				let presentYear = new Date().getFullYear();
				let maxYear = Math.max.apply(Math, response.body.map(function(o) { return parseInt(o.year); }));
				for(let i=maxYear+1; i <= presentYear; i++){
					response.body.push({value: "0.0,0.0", year: `${i}`, month: this.props.month})
				}
			}
			var values=  []
			var elements = []
			var viewportMinimum = 0
			const current = this
			response.body.map(function(item){
				var month, x, period, label = 0
				if(item['value'] !== ""){
					if(type !== 'ecv'){
						x = parseInt(item['year'])
						period = parseInt(item['year'])
						viewportMinimum = current.props.sliderMin
						label = parseInt(item['year'])
					}else{
						month = item['month']
						x = all_months ? new Date(item['year'], month, 1) : new Date(item['year'], 0, 1)
						var date = new Date(item['year'], month-1, 1)
						const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short'})
						const [{ value: mo },,{ value: ye }] = dtf.formatToParts(date) 
						period = `${mo} ${ye}`
						viewportMinimum = new Date(current.props.sliderMin, 8, 1)
						label = date.getFullYear()+' '+ date.toLocaleString('en-GB', { month: 'short' })
					}
					var value = item['value'] ? item['value'].split(',') : [0,0]
					values.push({"x": x, "y": [parseFloat(value[0]), parseFloat(value[1])], period, "label": label, "color":item['color'], "name": item['name']})
					elements.push({"x": x, "y": parseFloat(value[0])+' '+parseFloat(value[1]), period, "label": label, "color":item['color'], "name": item['name']})
				}
				return null
			})
			this.setState({data: values, viewportMinimum: viewportMinimum})
        })
        .catch(err => {
			this.setState({data: []})
            console.error(err);
		});

		let params2 = {
			"stype": this.props.percentile_id,
			"value": this.props.value.toLowerCase().replace(' ', '_'),
			"location": location,
			"tab":"era5"
		}

		if(this.props.monthly) params2["month"]= all_months ? 0 : this.props.month;
	

		api.MatchLocation(params2)
        .then((response) => {
			var values = []
			// var xvalue = ""
			if(response.body.length){
				//Padding years to present
				let presentYear = new Date().getFullYear();
				let maxYear = Math.max.apply(Math, response.body.map(function(o) { return parseInt(o.year); }));

				for(let i=maxYear+1; i <= presentYear; i++){
					response.body.push({year: `${i}`, month: this.props.month})
				}
			}
			
			response.body.map(function(item){
				var {month, x , period, label} = 0

				if(item['value'] !== ""){
					if(type !== 'ecv'){  
						x = parseInt(item['year'])
						period = parseInt(item['year'])
						// xvalue = "####"
						label = parseInt(item['year'])
					}else{
						month = item['month']
						x = all_months ? new Date(item['year'], month, 1) : new Date(item['year'], 0, 1)
						var date = new Date(item['year'], month-1, 1)
						const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short'})
						const [{ value: mo },,{ value: ye }] = dtf.formatToParts(date) 
						period = `${mo} ${ye}`
						// xvalue = ""
						label = date.getFullYear()+' '+ date.toLocaleString('en-GB', { month: 'short' })
					}
					if(type == 'ecv')
						values.push({"x": x, "y": item['value'], period, "label": label})
					else{
						if(period>1992) //bioclimatic e wine risk
							values.push({"x": x, "y": item['value'], period, "label": label})
					}
				}
			})
			console.log(values)
			this.setState({obs_data: values})
        })
        .catch(err => {
			this.setState({obs_data: []})
            console.error(err);
		});
		this.removeElement('export-data')
		var name_of_file = 'Seasonal Forecast-'+this.props.value+'-'+this.props.sliderMin+' '+this.props.sliderMax+'-'+this.props.leadtValue+'-'+this.props.latitude+' '+this.props.longitude
		this.addElementOnMenu('Save as CSV','export-data', name_of_file)
	}

	convertToCSV(obs_array, seasonal_array, name_of_file) {
		var title = ['tab', 'variable', 'interval','starting date', 'lat', 'lon']
		var header = name_of_file.split('-')
		var labels = ['period','lower-value','upper-value','observation']

		var arr = obs_array.map(function(el) {
			el['observation'] = el.y
			delete el.y
			var el2 = []
			seasonal_array.map(y => {
				if(el.label === y.label){
					el2 = y
				}
			})
			el = Object.assign({}, el, el2)
			return el
		})
		const array = [title].concat([header]).concat([labels]).concat(arr)
        return array.map(it => {
			var newIt = []
			if(it.y !== undefined){
				newIt.push(it.label)
				newIt.push(it.y[0])
				newIt.push(it.y[1])
				newIt.push(it.observation)
			}else{
				if(it.label !== undefined){
					newIt.push(it.label)
					newIt.push('-')
					newIt.push('-')
					newIt.push(it.observation)
				}else{ newIt = it}
			}
            return Object.values(newIt).toString()
        }).join('\n')
	}

	addElementOnMenu =(title, className, name_of_file) => {
		var div = document.getElementsByClassName('canvasjs-chart-toolbar')[0].childNodes[3]
		var element = document.createElement("div");
		element.style.cssText = "padding: 12px 8px; background-color: white; color: black; width:170px;"
		element.innerHTML = title;
		element.className = className
		element.onclick = () =>{
			var csv  = 'data:text/plain;charset=utf-8,'+this.convertToCSV(this.state.obs_data, this.state.data, name_of_file)
			var uri = encodeURI(csv)
			var a = document.createElement("a");
			a.href = uri;
			a.setAttribute("download", name_of_file + ".csv");
			document.body.appendChild(a);
			a.click();
		}
		element.addEventListener("mouseover",function(){
			element.style.background = 'rgb(33,150,243)';
			element.style.color = 'white';
		});
		element.onmouseout = function() {
			element.style.backgroundColor = 'white';
			element.style.color = 'black';
		};
		div.appendChild(element)
	}

	removeElement(className){
		const removeElements = (elms) => elms.forEach(el => el.remove());
		removeElements(document.querySelectorAll("."+className))
	}

	componentDidMount() {
		this.loadData();
	}

	toggleDataSeries(e){
		if(this.props.monthly) this.setState({ all_months: e.dataSeries.name.includes('(All)')}, () =>{
			this.removeElement('export-data')
			this.loadData()
		});
		this.chart.render();
	}
	
	render() {
		let data = [{
				type: "rangeColumn",
				colorSet:"greenShades",
				name: `${this.props.value} (${new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(0, this.props.month, 0))})`,
				color: "#08306b",
				yValueFormatString: "###0.00",
				fillOpacity: .88,
				showInLegend: this.props.monthly,
				visible: !this.state.all_months,
				toolTipContent: "Period: {period}<br>Seasonal Forecast: <br> {name} <br>",
				xValueFormatString: "",
				// toolTipContent: "{x}<br>High: {y[0]}<br>Low: {y[1]}",
				// { x: new Date(2004,0), y: [66.7,100], color: "#fe5009"},
				dataPoints: this.state.data
			},{
				type: "scatter",
				name: `Observation (${new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(0, this.props.month, 0))})`,
				markerType: "circle",
				yValueFormatString: "###0.00",
				xValueFormatString: "YYYY",
				color: "#00CED1",
				markerSize: 12,
				showInLegend: this.props.monthly,
				visible: !this.state.all_months,
				toolTipContent: "Observation: <br>Value: {y}",
				// 	{ x: new Date(2014,0), y: 78 },
				dataPoints: this.state.obs_data
			},{
				type: "rangeColumn",
				colorSet:"greenShades",
				name: `${this.props.value} (All)`,
				color: "#08306b",
				yValueFormatString: "###0.00",
				showInLegend: true,
				fillOpacity: .88,
				visible: this.state.all_months,
				toolTip: true,
				toolTipContent: "Period: {period}<br>Seasonal Forecast: <br> {name} <br>",
				xValueFormatString: "",
				// toolTipContent: "{x}<br>High: {y[0]}<br>Low: {y[1]}",
				// { x: new Date(2004,0), y: [66.7,100], color: "#fe5009"},
				dataPoints: this.state.data
			},
			{
				type: "scatter",
				name: "Observation (All)",
				markerType: "circle",
				yValueFormatString: "###0.00",
				xValueFormatString: "YYYY",
				color: "#00CED1",
				markerSize: this.props.monthly ? 3 : 12,
				showInLegend: true,
				toolTip: true,
				visible: this.state.all_months,
				toolTipContent: "Observation: <br>Value: {y}",
				// 	{ x: new Date(2014,0), y: 78 },
				dataPoints: this.state.obs_data
			}
		]

		const options = {
			height:200,
			theme: "light2",
			animationEnabled: true,
			interactivityEnabled: true,
			exportEnabled: true,
			animationDuration: 2000,
			zoomEnabled: true,
			title:{
				text: this.props.monthly ? 
					`${this.props.value} ${this.props.sliderMin}-${this.props.sliderMax} ${this.props.monthString} (Lat: ${this.props.latitude}, Lon: ${this.props.longitude})` :
					`${this.props.value} ${this.props.sliderMin}-${this.props.sliderMax} (Lat: ${this.props.latitude}, Lon: ${this.props.longitude})`
			},
			// subtitles: [{
			// 	text: "Click Legend to Hide or Unhide Data Series"
			// }],
			dataPointMaxWidth: 50,
			dataPointMinWidth: 1,
			axisX: {
                title: "Years",
				interval: 1,
				titleFontColor: "#343434",
				lineColor: "#343434",
				labelFontColor: "#343434",
				tickColor: "#343434",
				intervalType: "year",
				//valueFormatString: "YYYY"
				labelFontSize: 10,
				// viewportMinimum: this.state.viewportMinimum,
				// viewportMaximum: this.state.viewportMaximum
			},
			axisY: [{
					title: "Terciles",
					titleFontColor: "#343434",
					lineColor: "#343434",
					labelFontColor: "#343434",
					tickColor: "#343434",
					includeZero: false,
					interval: 10,
					maximum: 100,
					minimum:0,
					margin: 30,
					gridThickness: 0
				},{
					interval: 33.333333333,
					maximum: 100,
					lineThickness: 0,
					tickColor: "#ffffff",
					gridColor: "#343434",
					gridThickness: 3,
					margin:0,
					lineColor:"#73ff00",
					labelFormatter: function (e) {
						return ""
					}
				},{
					titleFontColor: "#000000",
					labelFontColor:  "#000000",
					tickColor: "#000000",
					interval: 50,
					maximum: 100,
					labelMaxWidth: 100,
					labelFontSize: 10,
					gridThickness: 0,	
					labelFormatter: function(e){
						if (e.value < 33.3)
							return "Lower Tercile - Tercile 0-33.33";
						else if(e.value > 33.3 && e.value < 66.7)
							return "Medium Tercile - Tercile 33.33-66.7";
							else return "Upper Tercile - Tercile 66.7-100.0"
					}
			}],
			toolTip: {
				shared: false
			},
			legend: {
				itemclick: this.toggleDataSeries,
				cursor: "pointer"
			},
			rangeSelector: {
				enabled: false
			},
			navigator: {
				data: data,
				slider: {
				  minimum: new Date(2018, 0, 15),
				  maximum: new Date(2018, 2, 1)
				}
			},
			data: data
		}
		
		return (
			<div style={this.props.style}>
				<CanvasJSChart options = {options} 
					onRef={ref => this.chart = ref}>
					</CanvasJSChart>
			</div>
		);
	}
			
}
  
export default Chart;