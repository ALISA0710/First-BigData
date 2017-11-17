//start!

$(document).ready(function() {
	var ws;

	function connectWS() {
		hideOrShowLocal(false);
		if(ws == null) {
			var lockReconnect = false; //避免重复连接 
			var wsUrl = 'ws://47.92.89.210:8080/web-ssm/web';
//--------------------------------------------------------测试
//			var wsUrl = 'ws://192.168.1.4:8080/web';

			function createWebSocket(url) {
				try {
					ws = new WebSocket(url);
					initEventHandle();
				} catch(e) {
					reconnect(url);
				}
			}

			function initEventHandle() {
				ws.onclose = function(evt) {
					reconnect(wsUrl);
//										alert("webSocket已断开连接！！");
				};
				ws.onerror = function(evt) {
					reconnect(wsUrl);
				};
				ws.onopen = function(evt) {
					ws.send("succeed");
					console.log("webSocket已连接！！");
					//心跳检测重置 
					heartCheck.reset().start();
				};
				ws.onmessage = function(evt) {
					parseData(evt.data);
					reconnect();
					//如果获取到消息，心跳检测重置 
					//拿到任何消息都说明当前连接是正常的 
					heartCheck.reset().start();
				}
			}

			function reconnect(url) {
				if(lockReconnect) return;
				lockReconnect = true;
				//没连接上会一直重连，设置延迟避免请求过多 
				setTimeout(function() {
					createWebSocket(url);
					lockReconnect = false;
				}, 2000);
			}
			//心跳检测 
			var heartCheck = {
				timeout: 60000, //60秒 
				timeoutObj: null,
				serverTimeoutObj: null,
				reset: function() {
					clearTimeout(this.timeoutObj);
					clearTimeout(this.serverTimeoutObj);
					return this;
				},
				start: function() {
					var self = this;
					this.timeoutObj = setTimeout(function() {
						//这里发送一个心跳，后端收到后，返回一个心跳消息， 
						//onmessage拿到返回的心跳就说明连接正常 
						ws.send("HeartBeat");
						self.serverTimeoutObj = setTimeout(function() { //如果超过一定时间还没重置，说明后端主动断开了 
							ws.close(); //如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次 
						}, self.timeout)
					}, this.timeout)
				}
			}
			createWebSocket(wsUrl);
		}
	}
	connectWS();

	var localStatus, remoteStatus, currentPattern, deviceNum;
	var deviceData = [];
	var cinemaName = [],
		cinemaTicket = [];
	var videoData = [];
	//解析json数据方法
	function parseData(_data) {
		var datav_json = JSON.parse(_data);

		//获取本地控制，云端通信，当前模式信息
		localStatus = datav_json.benDiConnect.name;
		remoteStatus = datav_json.yunDuanConnect.name;
		currentPattern = datav_json.model;
		deviceNum = datav_json.gearConnectCount;

		deviceData = datav_json.devicejson;
		videoData = datav_json.videolist;

		//获取票房统计柱状图信息
		cinemaName = datav_json.namelist;
		cinemaTicket = datav_json.countlist;

		getData();
	}

	var isSwiper = false;

	function getData() {
		//远程连接状态判断
		switch(remoteStatus) {
			case "已连接":
				connectOrDisconnect(true);
				break;
			case "未连接":
				connectOrDisconnect(false);
				break;
		}
		//本地连接状态判断
		switch(localStatus) {
			case "已连接":
				$("#localdata").html(localStatus).siblings().css("background-color", "green");
				break;
			case "未连接":
				$("#localdata").html(localStatus).siblings().css("background-color", "red");
				break;
		}
		//模式状态判断
		$("#moshidata").html(currentPattern);

		$("#devicedata").html(deviceNum);

		//console.log("设备数量： " + deviceData.length);
		setTableData(deviceData);
		if(isSwiper == false) {
			setSwiper(videoData);
		}
		setOption(cinemaName, cinemaTicket);

	}

	//隐藏或显示本地连接
	function hideOrShowLocal(isShow) {
		if(!isShow) {
			$("#bendi").hide();
			$("#moshi").hide();
			$("#id").hide();
			$("#shuliang").hide();
		} else {
			$("#bendi").show();
			$("#moshi").show();
			$("#id").show();
			$("#shuliang").show();
		}
	}

	//远程是否连接
	//*isConnect* true为已连接，false为未连接
	function connectOrDisconnect(isConnect) {
		hideOrShowLocal(isConnect);
		if(!isConnect) {
			$("#remotedata").html(remoteStatus).siblings().css("background-color", "red");
		} else {
			$("#remotedata").html(remoteStatus).siblings().css("background-color", "#04c504");
		}
	}

	//设置表格（设备列表）数据
	function setTableData(_tableData) {

		var table = $(".tbody");
		resetTable();
		for(var i = 0; i < _tableData.length; i++) {
			var table_item = table[i].getElementsByTagName("div");
			for(var j = 0; j < table_item.length; j++) {
				table_item[0].innerHTML = _tableData[i].id;
				table_item[1].innerHTML = _tableData[i].temperature + "℃";
				table_item[2].innerHTML = _tableData[i].battery + "%";
				if(_tableData[i].isPut == "null" || _tableData[i].isPut === "null") {
					table_item[3].innerHTML = "-";
				} else {
					table_item[3].innerHTML = _tableData[i].isPut;
				}
				if(_tableData[i].playContent == "null" || _tableData[i].playContent === "null") {
					table_item[4].innerHTML = "-";
				} else {
					table_item[4].innerHTML = _tableData[i].playContent;
				}
				table_item[5].innerHTML = _tableData[i].currProc;
			}
			console.log(_tableData[i].currProc);
		}
	}

	//重置设备列表
	function resetTable() {
		var table = $(".tbody");
		for(var i = 0; i < table.length; i++) {
			var table_item = table[i].getElementsByTagName("div");
			for(var j = 0; j < table_item.length; j++) {
				table_item[j].innerHTML = "-";
			}
		}
	}

	//设置轮播（影片简介信息）数据
	function setSwiper(_SwiperData) {
		var swiper = $(".swiper-slide");
		for(var i = 0; i < _SwiperData.length; i++) {
			var swiper_item = swiper[i].getElementsByTagName("div");
			var swiper_img = swiper[i].getElementsByTagName("img");
			swiper_img[0].src = _SwiperData[i].imageUrl;
			for(var j = 0; j < swiper_item.length; j++) {
				swiper_item[0].innerHTML = _SwiperData[i].evideoName;
				swiper_item[1].innerHTML = _SwiperData[i].evideointroduce;
			}
		}

		//给轮播新加的两个div赋值
		swiper[5].getElementsByTagName("img")[0].src = _SwiperData[0].imageUrl;
		swiper[5].getElementsByTagName("div")[0].innerHTML = _SwiperData[0].evideoName;
		swiper[5].getElementsByTagName("div")[1].innerHTML = _SwiperData[0].evideointroduce;

		swiper[6].getElementsByTagName("img")[0].src = _SwiperData[1].imageUrl;
		swiper[6].getElementsByTagName("div")[0].innerHTML = _SwiperData[1].evideoName;
		swiper[6].getElementsByTagName("div")[1].innerHTML = _SwiperData[0].evideointro1uce;

		isSwiper = true;
	}

	//---------------------------------------------------------------柱状图--------------------------------------------------------------
	var myChart = echarts.init(document.getElementById('ZhuzhuangChart'));

	//设置柱状图（影片票价）数据
	//*——dataName* 影片名称数组        *_dataValue* 影片票价数组
	function setOption(_dataName, _dataValue) {

		option = {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow',
					//					color:'#2a2a44'
				}
			},
			legend: {
				data: ['2017年']
			},
			grid: {
				top: '10%',
				left: '5%',
				right: '10%',
				bottom: '35%',
				containLabel: true,
				color: '#2a2a44'
			},
			xAxis: {
				type: 'value',
				boundaryGap: [0, 0.1],
				axisLabel: {
					show: true,
					textStyle: {
						color: '#fff'
					}
				},
				axisLine: {
					lineStyle: {
						color: '#858694',
						width: 2, //这里是为了突出显示加上的
					}
				},
				splitLine: {
					lineStyle: {
						color: '#2a2a44'
					}
				}

			},
			yAxis: {
				type: 'category',
				data: _dataName,
				label: {
					position: "left"
				},
				axisLabel: {
					formatter: '{value}',
					textStyle: {
						color: '#fff',
						fontSize: '8'
					}
				},
				axisLine: {
					lineStyle: {
						color: '#858694',
						width: 2, //这里是为了突出显示加上的
					}
				}

			},
			series: [

				{
					type: 'bar',
					data: _dataValue,
					itemStyle: {
						//柱形图圆角，鼠标移上去效果
						emphasis: {
							barBorderRadius: [0, 5, 5, 0]
						},

						normal: {
							//柱形图圆角，初始化效果
							barBorderRadius: [0, 5, 5, 0],

						},
					},
					barWidth: "35%"
				}
			],
			//柱状图颜色
			color: ['#5beff6']
		};
		myChart.setOption(option);
		window.addEventListener('resize', function() {
			myChart.resize();
		});

	}
	//------------------------------------------------------------------------------------------------------------------------------------------
});

//end!