$(function() {
	var myChart = echarts.init(document.getElementById('worldMap'));

	var latlong = {};

	latlong.KV = {
		'latitude': 40.7127837,
		'longitude': -74.0059413
	};
	latlong.SM = {
		'latitude': 52.3702157,
		'longitude': 4.8951679
	};
	latlong.SD = {
		'latitude': 33.7489954,
		'longitude': -84.3879824
	};
	latlong.ST = {
		'latitude': 47.6062095,
		'longitude': -122.3320708
	};
	latlong.BL = {
		'latitude': 39.024684,
		'longitude': -95.41009
	};
	latlong.TI = {
		'latitude': 34.0924569,
		'longitude': -118.3338258
	};
	latlong.DV = {
		'latitude': -26.1433,
		'longitude': 28.01908
	};
	latlong.VT = {
		'latitude': 39.9227707116,
		'longitude': 116.4614295959
	};
	latlong.KU = {
		'latitude': 36.204824,
		'longitude': 138.252924
	};
	latlong.BS = {
		'latitude': 39.024684,
		'longitude': -95.41009
	};
	latlong.VE = {
		'latitude': 38.7166509,
		'longitude': -75.0774509
	};
	latlong.PR = {
		'latitude': 53.8084526,
		'longitude': -1.5360582
	};
	latlong.TV = {
		'latitude': 52.5200066,
		'longitude': 13.404954
	};
	latlong.EW = {
		'latitude': 40.730015,
		'longitude': -73.9863834
	};
	latlong.GS = {
		'latitude': 45.5383282,
		'longitude': 10.2318166
	};

	var mapData = [{
			'code': 'KV',
			'name': 'NewYork-KonceptVR',
			'value': 5,
			'color': '#d0410e'
		},
		{
			'code': 'SM',
			'name': 'Amsterdam-SamhoudMedia',
			'value': 3,
			'color': '#d0410e'
		},
		{
			'code': 'SD',
			'name': 'Atlanta-StudioDisrupt',
			'value': 3,
			'color': '#d0410e'
		},
		{
			'code': 'ST',
			'name': 'Seattle-Seattle',
			'value': 3,
			'color': '#d0410e'
		},
		{
			'code': 'BL',
			'name': 'NewYork-BorrowedLight',
			'value': 3,
			'color': '#d0410e'
		},
		{
			'code': 'TI',
			'name': 'LosAngeles-Titmouset',
			'value': 3,
			'color': '#d0410e'
		},
		{
			'code': 'DV',
			'name': 'SouthAfrica-DeepVR',
			'value': 3,
			'color': '#d0410e'
		},
		{
			'code': 'VT',
			'name': 'Beijing-Veertv',
			'value': 3,
			'color': '#d0410e'
		},
		{
			'code': 'KU',
			'name': 'Japan-KA0RU',
			'value': 3,
			'color': '#d0410e'
		},
		{
			'code': 'BS',
			'name': 'LosAngeles-BaobabStudio',
			'value': 3,
			'color': '#d0410e'
		},
		{
			'code': 'VE',
			'name': 'Chicago-VirtualEscapes',
			'value': 3,
			'color': '#d0410e'
		},
		{
			'code': 'PR',
			'name': 'Switzerland-Project 360',
			'value': 3,
			'color': '#d0410e'
		},
		{
			'code': 'TV',
			'name': 'Berlin-Till von Ahnen',
			'value': 3,
			'color': '#d0410e'
		},
		{
			'code': 'EW',
			'name': 'Lisbon-Entrez World',
			'value': 3,
			'color': '#d0410e'
		},
		{
			'code': 'GS',
			'name': 'San Paolo-Gigoia Studios',
			'value': 3,
			'color': '#d0410e'
		},
	];

	var max = 10;
	var min = 1;
	mapData.forEach(function(itemOpt) {
		if(itemOpt.value > max) {
			max = itemOpt.value;
		}
		if(itemOpt.value < min) {
			min = itemOpt.value;
		}
	});

	option = {
		backgroundColor: 'rgba(255, 255, 255, 0)',
		tooltip: {
			trigger: 'item',
			formatter: function(params) {
				var value = (params.value + '').split('.');
				value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,') +
					'.' + value[1];
				return params.seriesName + '<br/>' + params.name + ' : ' + value;
			}
		},
		visualMap: {
			show: false,
			min: 0,
			max: max,
			inRange: {
				symbolSize: [6, 30]
			}
		},
		geo: {
			top: '30%',
			left: '10%',
			rigth: '15%',
			bottom: '5%',
			name: 'World Population (2017)',
			type: 'map',
			map: 'world',
			roam: true,
			label: {
				emphasis: {
					show: false
				}
			},
			itemStyle: {
				normal: {
					areaColor: '#143247',
					borderColor: '#23c2e3'
				},
				emphasis: {
					areaColor: '#2a333d'
				}
			}
		},
		series: [{
//			type: 'scatter',
			type: 'effectScatter',
			coordinateSystem: 'geo',
			rippleEffect: {
				brushType: 'stroke'
			},
			symbolSize: 8,
//			coordinateSystem: 'geo',
			data: mapData.map(function(itemOpt) {
				return {
					name: itemOpt.name,
					value: [
						latlong[itemOpt.code].longitude,
						latlong[itemOpt.code].latitude,
						itemOpt.value
					],
					label: {
						emphasis: {
							position: 'right',
							show: true
						}
					},
					itemStyle: {
						normal: {
							color: itemOpt.color
						}
					}
				};
			})
		}]
	};

	$.get('json/world.json', function(worldJson) {
		echarts.registerMap('world', worldJson);
		var chart = echarts.init(document.getElementById('worldMap'));
		chart.setOption(option);
		window.addEventListener('resize', function() {
			chart.resize();
		});
		myChart.setOption(option);
		window.addEventListener('resize', function() {
			myChart.resize();

		});
	});
});