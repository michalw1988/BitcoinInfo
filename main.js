// ------ global variables ------

// for current prices
var usdPrice;
var eurPrice;
var plnPrice;
var gbpPrice;
var chfPrice;
var jpyPrice;
var yesterdayPrice;
var percentRate;

// for charts: to-date 
var to = new Date();
var toYear = to.getFullYear();
var toMonth = to.getMonth()+1;
var toDay = to.getDate();
var to = toYear + '-' + checklength(toMonth) + '-' + checklength(toDay);

// for charts: from-date
var fromDay = toDay;
var fromMonth = toMonth-1;
var fromYear;
if (fromMonth < 1){
	fromMonth += 12;
	fromYear = toYear-1;
} else {
	fromYear = toYear;
}
var from = fromYear + '-' + checklength(fromMonth) + '-' + checklength(fromDay);

// for charts: currency and data
var currency = 'USD';
var chartData;

// ######################################################



// ------ do at the beginning ------

// draw charts
getDataForChart('USD', from, to);

// fill right column with data
getCurrentPrices();
setInterval(getCurrentPrices, 60000);

// add clock to navbar
addClock("#clock");	

// ######################################################



// ----- functions -------

// adding leading zero to number if needed
function checklength(i) {
	if (i < 10) {
		i = "0" + i;
	}
	return i;
}
// ######################################################



// adding and updating the clock
function addClock(targetElement) {
	$(document).ready(function () {
		setInterval(function () {
			var now = new Date();
			var dateAndTime = checklength(now.getDate()) + '-' + checklength(now.getMonth()+1) + '-' + now.getFullYear() + ' ' + checklength(now.getHours()) + ':' + checklength(now.getMinutes()) + ':' + checklength(now.getSeconds());
			$(targetElement).html(dateAndTime);
		}, 1000);
	});	
}
// ######################################################



// getting actual prices for right column
function getCurrentPrices() {
	$(document).ready(function () {
	
		// get value for yesterday's closing price
		$.ajax({
			url: 'http://api.coindesk.com/v1/bpi/historical/close.json?for=yesterday',
			method: 'GET'
		}).then(function(data) {
			var result = JSON.parse(data);
			yesterdayPrice = result.bpi[Object.keys(result.bpi)[0]];
			
			// than get value for current USD price
			$.ajax({
				url: 'http://api.coindesk.com/v1/bpi/currentprice/USD.json',
				method: 'GET'
			}).then(function(data) {
				var result = JSON.parse(data);
				usdPrice = result.bpi.USD.rate_float;
				$('#usdPrice').html(usdPrice.toFixed(2) + ' USD'); // set USD price field

				// if data for actual USD and yesterday's USD price are present, calculate rise/fall
				if (yesterdayPrice && usdPrice){
					percentRate = (usdPrice / yesterdayPrice - 1)*100;
					percentRate = percentRate.toFixed(2);
					
					// set rise/fall field style
					$('#percentRate').addClass('alert');
					if (percentRate >= 0) {
						percentRate = '+' + percentRate;
						$('#percentRate').addClass('alert-success');
					} else {
						$('#percentRate').addClass('alert-danger');
					}
					// set rise/fall field value
					$('#percentRate').html(percentRate + '%');
				}
			});
		});
		
		// get value for current EUR price
		$.ajax({
			url: 'http://api.coindesk.com/v1/bpi/currentprice/EUR.json',
			method: 'GET'
		}).then(function(data) {
			var result = JSON.parse(data);
			usdPrice = result.bpi.EUR.rate_float;
			$('#eurPrice').html(usdPrice.toFixed(2) + ' EUR'); // set EUR price field
		});
		
		// get value for current PLN price
		$.ajax({
			url: 'http://api.coindesk.com/v1/bpi/currentprice/PLN.json',
			method: 'GET'
		}).then(function(data) {
			var result = JSON.parse(data);
			usdPrice = result.bpi.PLN.rate_float;
			$('#plnPrice').html(usdPrice.toFixed(2) + ' PLN'); // set PLN price field
		});
		
		// get value for current GBP price
		$.ajax({
			url: 'http://api.coindesk.com/v1/bpi/currentprice/GBP.json',
			method: 'GET'
		}).then(function(data) {
			var result = JSON.parse(data);
			usdPrice = result.bpi.GBP.rate_float;
			$('#gbpPrice').html(usdPrice.toFixed(2) + ' GBP'); // set GBP price field
		});
		
		// get value for current CHF price
		$.ajax({
			url: 'http://api.coindesk.com/v1/bpi/currentprice/CHF.json',
			method: 'GET'
		}).then(function(data) {
			var result = JSON.parse(data);
			usdPrice = result.bpi.CHF.rate_float;
			$('#chfPrice').html(usdPrice.toFixed(2) + ' CHF'); // set CHF price field
		});
		
		// get value for current JPY price
		$.ajax({
			url: 'http://api.coindesk.com/v1/bpi/currentprice/JPY.json',
			method: 'GET'
		}).then(function(data) {
			var result = JSON.parse(data);
			usdPrice = result.bpi.JPY.rate_float;
			$('#jpyPrice').html(usdPrice.toFixed(2) + ' JPY'); // set JPY price field
		});
	});
}
// ######################################################



// load data from Coindesk API
function getDataForChart(currency, from, to) {
	$('#loader').css('display', 'block'); // show loader
	$.ajax({
		url: 'http://api.coindesk.com/v1/bpi/historical/close.json?start='+from+'&end='+to+'&currency='+currency, // get data in given currency and time range
		method: 'GET'
	}).then(function(data) {
		chartData = JSON.parse(data);
		chartData = chartData.bpi;
		drawChart(chartData);
		$('#loader').css('display', 'none'); // hide loader when data is ready
	});
}
// ######################################################



// calculate values for charts and draw them
function drawChart(data) {

	var numberOfPrices = Object.keys(data).length;
	var priceList = [];	// all prices
	var pricesForCharts = []; // only prices for charts

	// for grouping prices
	var groupSize = Math.round(numberOfPrices / 30);
	var groupCount = Math.ceil(numberOfPrices/groupSize);
	var whichPrice = 0;
	
	// put all prices into array
	for (var i in data) {
		var price = data[i];
		priceList.push(data[i]);
	}
	
	// finding highest value in each group (for charts)
	for (var i = 0; i < groupCount; i++){
		var highestInGroup = 0;
		if (numberOfPrices >= groupSize) { // when remaining values count is greater than group size
			numberOfPrices -= groupSize;
		} else { // when only small number of values left ( less than group size)
			groupSize = numberOfPrices;
		}
		// find highest value in given group
		for (n = 0; n < groupSize; n++){ 
			if (priceList[whichPrice] > highestInGroup) {
				highestInGroup = priceList[whichPrice];
			}
			whichPrice++;
		}
		// add that highest value in given group to the chart values
		pricesForCharts.push(highestInGroup);
	}
	
	// draw charts
	new Chartist.Line('#chartLine', {
		series: [pricesForCharts]
	});
	
	new Chartist.Bar('#chartBar', {
		series: [pricesForCharts]
	});
}
// ######################################################



// handling various buttons click
$(document).ready(function(){

	// "Notowania"
	$("#chartPageLink").click(function(){
		$("#chartDiv").fadeIn();
		$("#infoDiv").css("display", "none"); 
		$("#aboutDiv").css("display", "none");
		$("#chartPageLink").addClass("active");
		$("#infoPageLink").removeClass("active");
		$("#aboutPageLink").removeClass("active");
		$("#leftColumn").removeClass("hidden-xs");
		drawChart(chartData);	
		return false;		 
	});
	
	// "Czym jest Bitcoin?"
	$("#infoPageLink").click(function(){
		$("#chartDiv").css("display", "none"); 
		$("#infoDiv").fadeIn();
		$("#aboutDiv").css("display", "none"); 
		$("#chartPageLink").removeClass("active");
		$("#infoPageLink").addClass("active");
		$("#aboutPageLink").removeClass("active");
		$("#leftColumn").addClass("hidden-xs");
		return false;
	});
	
	// "O stronie"
	$("#aboutPageLink").click(function(){
		$("#chartDiv").css("display", "none"); 
		$("#infoDiv").css("display", "none"); 
		$("#aboutDiv").fadeIn();
		$("#chartPageLink").removeClass("active");
		$("#infoPageLink").removeClass("active");
		$("#aboutPageLink").addClass("active");
		$("#leftColumn").addClass("hidden-xs");
		return false;
	});
	
	// Wykres "1 miesi¹c"
	$("#chartRange1Button").click(function(){
		$("#chartRange1Button").addClass("active");
		$("#chartRange2Button").removeClass("active");
		$("#chartRange3Button").removeClass("active");
		$("#chartRange4Button").removeClass("active");
		 
		to = new Date();
		toYear = to.getFullYear();
		toMonth = to.getMonth()+1;
		toDay = to.getDate();
		to = toYear + '-' + checklength(toMonth) + '-' + checklength(toDay);
		fromDay = toDay;
		fromMonth = toMonth-1;
		fromYear;
		if (fromMonth < 1){
		 fromMonth += 12;
		 fromYear = toYear-1;
		} else {
		 fromYear = toYear;
		}
		from = fromYear + '-' + checklength(fromMonth) + '-' + checklength(fromDay);
		
		getDataForChart(currency, from, to);
		return false;
	});
	
	// Wykres "3 miesi¹ce"
	$("#chartRange2Button").click(function(){
		$("#chartRange1Button").removeClass("active");
		$("#chartRange2Button").addClass("active");
		$("#chartRange3Button").removeClass("active");
		$("#chartRange4Button").removeClass("active");
		 
		to = new Date();
		toYear = to.getFullYear();
		toMonth = to.getMonth()+1;
		toDay = to.getDate();
		to = toYear + '-' + checklength(toMonth) + '-' + checklength(toDay);
		fromDay = toDay;
		fromMonth = toMonth-3;
		fromYear;
		if (fromMonth < 1){
		 fromMonth += 12;
		 fromYear = toYear-1;
		} else {
		 fromYear = toYear;
		}
		from = fromYear + '-' + checklength(fromMonth) + '-' + checklength(fromDay);
		 
		getDataForChart(currency, from, to);
		return false;
	});
	
	// Wykres "1 rok"
	$("#chartRange3Button").click(function(){
		$("#chartRange1Button").removeClass("active");
		$("#chartRange2Button").removeClass("active");
		$("#chartRange3Button").addClass("active");
		$("#chartRange4Button").removeClass("active");
		 
		to = new Date();
		toYear = to.getFullYear();
		toMonth = to.getMonth()+1;
		toDay = to.getDate();
		to = toYear + '-' + checklength(toMonth) + '-' + checklength(toDay);
		fromDay = toDay;
		fromMonth = toMonth;
		fromYear = toYear-1;
		from = fromYear + '-' + checklength(fromMonth) + '-' + checklength(fromDay);
		 
		getDataForChart(currency, from, to);
		return false;
	});
	
	// Wykres "5 lat"
	$("#chartRange4Button").click(function(){
		$("#chartRange1Button").removeClass("active");
		$("#chartRange2Button").removeClass("active");
		$("#chartRange3Button").removeClass("active");
		$("#chartRange4Button").addClass("active");
		 
		to = new Date();
		toYear = to.getFullYear();
		toMonth = to.getMonth()+1;
		toDay = to.getDate();
		to = toYear + '-' + checklength(toMonth) + '-' + checklength(toDay);		
		fromDay = toDay;
		fromMonth = toMonth;
		fromYear = toYear-5;
		from = fromYear + '-' + checklength(fromMonth) + '-' + checklength(fromDay);
		 
		getDataForChart(currency, from, to);
		return false;
	});
	
	// Typ wykresu: liniowy
	$("#linearChartButton").click(function(){
		$("#linearChartButton").addClass("active");
		$("#barChartButton").removeClass("active");
		$("#chartLine").css('display', 'block');
		$("#chartBar").css('display', 'none');
		drawChart(chartData);
		return false;
	});
	
	// Typ wykresu: œwiecowy
	$("#barChartButton").click(function(){
		$("#linearChartButton").removeClass("active");
		$("#barChartButton").addClass("active");
		$("#chartLine").css('display', 'none');
		$("#chartBar").css('display', 'block');
		drawChart(chartData);
		return false;
	});
	
	// Waluta wykresu: USD
	$("#usdCurrency").click(function(){
		currency = 'USD';
		getDataForChart(currency, from, to);
		return false;
	});
	
	// Waluta wykresu: EUR
	$("#eurCurrency").click(function(){
		currency = 'EUR';
		getDataForChart(currency, from, to);
		return false;
	});
	
	// Waluta wykresu: PLN
	$("#plnCurrency").click(function(){
		currency = 'PLN';
		getDataForChart(currency, from, to);
		return false;
	});
	
	// Waluta wykresu: GPB
	$("#gbpCurrency").click(function(){
		currency = 'GBP';
		getDataForChart(currency, from, to);
		return false;
	});
	
	// Waluta wykresu: CHF
	$("#chfCurrency").click(function(){
		currency = 'CHF';
		getDataForChart(currency, from, to);
		return false;
	});
	
	// Waluta wykresu: JPY
	$("#jpyCurrency").click(function(){
		currency = 'JPY';
		getDataForChart(currency, from, to);
		return false;
	});	
}); 
// ######################################################