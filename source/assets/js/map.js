(function(){
	"use strict";
	var windowYear = 2010;
	var mapYear = 2010;
	var maxYear = 2010;
	var minYear = 1996;
	var marker;
	var clickedFacilityIcon = L.divIcon({
		className : 'clickedFacility'
	});
	var mouseX, mouseY;
	var map;
	var layers = {};
	var stamenAttribution = '<p>Map tiles by <a href="http://stamen.com">Stamen Design</a>,<br/>under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.<br/>Data by <a href="http://openstreetmap.org">OpenStreetMap</a>,<br/>under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.</p>';
	
	$(document).ready(function() {
		// load google api
		// google.load("visualization", "1", {
		// packages : ["corechart"]
		// });
		google.setOnLoadCallback(init);
	
		function init() {
			var utfClick;
	
			$(".fancybox").fancybox({
				fitToView : false,
				width : '90%',
				height : '90%',
				autoSize : false
			});
	
			$("#facility_tabs").tabs();
	
			// get mouse position for tooltip
			$(document).mousemove(function(e) {
				mouseX = e.pageX;
				mouseY = e.pageY;
			});
			
			layers.toner = new L.StamenTileLayer("toner-lite", {
				attribution : stamenAttribution
			});
			layers.satellite = new L.TileLayer("//otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png", {});
			layers.streets = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
				attribution : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			});
	
			layers.y2010 = L.tileLayer('http://140.160.114.197/tiles/2010/{z}/{x}/{y}.png');
			layers.y2009 = L.tileLayer('http://140.160.114.197/tiles/2009/{z}/{x}/{y}.png');
			layers.y2008 = L.tileLayer('http://140.160.114.197/tiles/2008/{z}/{x}/{y}.png');
			layers.y2007 = L.tileLayer('http://140.160.114.197/tiles/2007/{z}/{x}/{y}.png');
			layers.y2006 = L.tileLayer('http://140.160.114.197/tiles/2006/{z}/{x}/{y}.png');
			layers.y2005 = L.tileLayer('http://140.160.114.197/tiles/2005/{z}/{x}/{y}.png');
			layers.y2004 = L.tileLayer('http://140.160.114.197/tiles/2004/{z}/{x}/{y}.png');
			layers.y2003 = L.tileLayer('http://140.160.114.197/tiles/2003/{z}/{x}/{y}.png');
			layers.y2002 = L.tileLayer('http://140.160.114.197/tiles/2002/{z}/{x}/{y}.png');
			layers.y2001 = L.tileLayer('http://140.160.114.197/tiles/2001/{z}/{x}/{y}.png');
			layers.y2000 = L.tileLayer('http://140.160.114.197/tiles/2000/{z}/{x}/{y}.png');
			layers.y1999 = L.tileLayer('http://140.160.114.197/tiles/1999/{z}/{x}/{y}.png');
			layers.y1998 = L.tileLayer('http://140.160.114.197/tiles/1998/{z}/{x}/{y}.png');
			layers.y1997 = L.tileLayer('http://140.160.114.197/tiles/1997/{z}/{x}/{y}.png');
			layers.y1996 = L.tileLayer('http://140.160.114.197/tiles/1996/{z}/{x}/{y}.png');
			layers.utfGrid = new L.UtfGrid('http://140.160.114.197/utfgrid/2010/{z}/{x}/{y}.grid.json?callback={cb}');
	
			map = L.map('map', {
				center : new L.LatLng(39, -98),
				zoom : 5,
				layers : [layers.toner, layers.y2010, layers.utfGrid],
				maxZoom : 16,
				fadeAnimation : false,
				scrollWheelZoom: true
			});
			
			// hide loading message on map load
			map.whenReady(function() {
				$('#loading').fadeOut(500);
			});
	
			utfClick = function(e) {
				if (e.data) {
					loadPopup(e.data.facilitynu);
					_gaq.push(['_trackEvent', 'Map', 'Click Facility', e.data.name]);
				}
			};
			
			function loadPopup(facility_number){
				var url = 'http://140.160.114.197/api/v3/facility/' + facility_number + '.json';
	
				//Set info window year to current year
				document.getElementById('window_year').innerHTML = windowYear;
				document.getElementById('ind_year').innerHTML = windowYear;
	
					$.ajax({
						dataType : "json",
						url : url,
						success : function(facility_record) {
							windowYear = mapYear;
							cleanPopup();
							parseFacility(facility_record);
							parseChemicals(facility_record);
							parseIndustry(facility_record);
							if ($("#general_tab").attr('aria-expanded') === 'true') {
								loadChart(facility_record);
							} else {
								$("#general_tab_btn").on('click.draw_chart', function() {
									loadChart(facility_record);
									$("#general_tab_btn").off('click.draw_chart');
								});
							}
				
							initChemListListener();
							initYearChangers(facility_record);
						},
						error : function(request){
							_gaq.push(['_trackEvent', 'Error', 'Get Facility', "URL: " + url + "Response: " + request.responseText]);
						}
					});
					
				
			}
	
			layers.utfGrid.on('click', utfClick);
	
			var hover_timer = false;
			var utfMouseover = function(e) {
				if (e.data) {
					$('#hover').html(e.data.name);
					clearTimeout(hover_timer);
				}
	
				$('#hover').css({
					'display' : 'block'
				});
			};
	
			layers.utfGrid.on('mouseover', utfMouseover);
	
			layers.utfGrid.on('mouseout', function() {
				hover_timer = setTimeout(function() {
					$('#hover').hide();
				}, 200);
			});
	
			map.on('mousemove', function() {
				$('#hover').css({
					'top' : mouseY + 5,
					'left' : mouseX + 10
				});
			});
	
			// hide facility tooltip on mouseout from map
			map.on('mouseout', function() {
				$('#hover').hide();
			});
	
			var baseMaps = {
				"Toner" : layers.toner,
				"Streets" : layers.streets,
				"Satellite" : layers.satellite
			};
	
			var overlayMaps = {
				"L2010" : layers.y2010,
				"L2009" : layers.y2009,
				"L2008" : layers.y2008,
				"L2007" : layers.y2007,
				"L2006" : layers.y2006,
				"L2005" : layers.y2005,
				"L2004" : layers.y2004,
				"L2003" : layers.y2003,
				"L2002" : layers.y2002,
				"L2001" : layers.y2001,
				"L2000" : layers.y2000,
				"L1999" : layers.y1999,
				"L1998" : layers.y1998,
				"L1997" : layers.y1997,
				"L1996" : layers.y1996
			};
	
			// change year
			$('#upyear').bind('click', function() {
				toggleUp();
			});
			$('#downyear').bind('click', function() {
				toggleDown();
			});
	
			var toggleUp = function() {
				if (mapYear < maxYear) {
					map.addLayer(overlayMaps['L' + (mapYear + 1)]);
					map.removeLayer(overlayMaps['L' + mapYear]);
					mapYear += 1;
					$('#currentyear').html(mapYear);
					_gaq.push(['_trackEvent', 'Map Year', 'Increase', mapYear]);
				}
			};
	
			var toggleDown = function() {
				if (mapYear > minYear) {
					map.addLayer(overlayMaps['L' + (mapYear - 1)]);
					map.removeLayer(overlayMaps['L' + mapYear]);
					mapYear -= 1;
					$('#currentyear').html(mapYear);
					_gaq.push(['_trackEvent', 'Map Year', 'Decrease', mapYear]);
				}
			};
	
			//change basemap
			$('#tonerThumb').bind('click', function() {
				changeBasemap('Toner');
			});
			$('#streetsThumb').bind('click', function() {
				changeBasemap('Streets');
			});
			$('#satelliteThumb').bind('click', function() {
				changeBasemap('Satellite');
			});
	
			function changeBasemap(lyr) {
				for (var item in baseMaps) {
					var obj = baseMaps[item];
					if (map.hasLayer(obj)) {
						map.removeLayer(obj);
					}
					map.addLayer(baseMaps[lyr]);
					baseMaps[lyr].bringToBack();
				}
				_gaq.push(['_trackEvent', 'Basemaps', 'Change', lyr]);
			}
	
			// add handlers for  attribution
			$('div.leaflet-bottom.leaflet-right').prepend("<div class='autoattribution trans'><p>basemap info</p><p style='display:none'>hide</p></div>");
	
			// toggle attribution info
			$('.autoattribution').click(function(e) {
				e.stopPropagation();
				$('.leaflet-control-attribution').toggle("slow");
				$('.autoattribution').toggleClass("hidetoggle");
				$('.autoattribution > p').toggle();
			});
	
			// stop mouseover info for facilities when under attribution
			$('div.leaflet-bottom.leaflet-right').mouseenter(function(e) {
				e.stopPropagation();
				layers.utfGrid.off('mouseover');
				layers.utfGrid.off('click');
			});
			$('div.leaflet-bottom.leaflet-right').mouseleave(function() {
				layers.utfGrid.on('mouseover', utfMouseover);
				layers.utfGrid.on('click', utfClick);
			});
	
			/// search
			$('#search').on('focus', clearDefaultSearchText);
			$('#search').on('blur', replaceDefaultSearchText);
	
			function clearDefaultSearchText() {
				if (this.value === "Search for a facility") {
					this.value = "";
				}
			}
	
			function replaceDefaultSearchText() {
				if (this.value === "") {
					this.value = "Search for a facility";
				}
			}
	
	
			$('#search').keydown(function(e) {
				if (e.keyCode === 13) {
					var url = 'http://140.160.114.197/search/tri/facilities/?q=' + $('#search').val();
					_gaq.push(['_trackEvent', 'Search', 'Search', $('#search').val()]);
					$('#loading').fadeIn(500);
					$.ajax({
						url : url,
						success : function(r) {
							$("#searchresults").empty();
							if (r.hits.hits[0]) {
								$("#searchresultsbox").height('60%');
								$.each(r.hits.hits, function() {
									var f = this._source;
									var item = $('<p class="searchresult">' + f.Name + " - " + f.City + ", " + f.State + '</p>').on('mouseover', function() {
										showFacility(f.Latitude, f.Longitude);
									}).on('click', function() {
										zoomToFacility(f.Latitude, f.Longitude);
										loadPopup(f.FacilityNumber);
										_gaq.push(['_trackEvent', 'Search', 'Result Selected', f.Name]);
									});
									$("#searchresults").append($(item)[0]);
								});
							} else {
								$("#searchresultsbox").height(100);
								$("#searchresults").html("<p>No results for this search.</br>Please try something else.</p>");
							}
							$("#searchresultsbox").css('display') === 'none' ? $("#searchresultsbox").toggle() : null;
							$('#loading').fadeOut(500);
						},
						error : function(request) {
							$('#loading').fadeOut(500);
							_gaq.push(['_trackEvent', 'Error', 'Search', "URL: " + url + "Response: " + request.responseText]);
						}
					});
				}
			});
	
			//Facility Popup close window
			$('#fp_close').on('click.fp_close', function() {
				$('#facility_tabs').hide();
			});
			
			//Search popup close window
			$('#search_close').on('click.fp_close', function() {
				closeSearch();
			});
			
		}
	
		function cleanPopup() {
			//Remove event listeners to prevent multiple copies
			$("#chemicalList").off('click.chemdetails');
	
			document.getElementById('graph').innerHTML = '';
			document.getElementById('info_title').innerHTML = '';
			document.getElementById('info_industry').innerHTML = '';
			document.getElementById('info_address').innerHTML = '';
			document.getElementById('info_contact').innerHTML = '';
			document.getElementById('chemicalList').innerHTML = '';
			document.getElementById('industryList').innerHTML = '';
	
		}
	
		//Popup Functionality
	
		function loadChart(facility_record) {
	
			// create chart data
			if (!facility_record.Emissions || Object.keys(facility_record.Emissions).length === 1) {
				// no years of data so set the chart area to say no chart
				$('#graph').html('<p class="noChart">Not enough data for a chart</p>');
			} else {
				var data;
				var chart_data = [['Year', 'Total Pounds Released', 'Risk']];
				var chart = new google.visualization.LineChart($('#graph')[0]);
				var options = {
					title : 'Facility Performance',
					hAxis : {
						gridlines : {
							color : '#333',
							count : 10
						}
					},
					series : {
						0 : {
							argetAxisIndex : 0
						},
						1 : {
							targetAxisIndex : 1
						}
					},
					vAxes : {
						0 : {
							textStyle : {
								color : 'blue'
							},
							label : 'Total Pounds Released'
						},
						1 : {
							textStyle : {
								color : 'red'
							},
							label : 'Risk'
						}
					},
					chartArea : {
						width : '97%'
					},
					vAxis : {
						textPosition : 'in'
					}
	
				};
				$.each(facility_record.Emissions, function(k, v) {
					chart_data.push([k, Math.ceil(v.TotalPounds), Math.ceil(v.TotalScore)]);
				});
	
				//set the chart properties
				data = google.visualization.arrayToDataTable(chart_data);
				chart.draw(data, options);
			}
		}
	
		function parseFacility(facility_record) {
			$("#facility_tabs").show();
			document.getElementById('info_title').innerHTML = '<STRONG>' + facility_record.Name + '</STRONG>';
			if(facility_record.NAICS1 !== undefined && facility_record.NAICS1.name !== undefined){
				document.getElementById('info_industry').innerHTML = 'Industry: ' + facility_record.NAICS1.name;
			}
			document.getElementById('info_address').innerHTML = '<p>' + facility_record.Street + '<br />' + facility_record.City + ' ' + facility_record.State + ', ' + facility_record.ZIPCode + '<br />' + facility_record.Latitude + ' ' + facility_record.Longitude + '</p>';
			document.getElementById('info_contact').innerHTML = '<p>' + facility_record.PublicContactName + '<br />' + facility_record.PublicContactPhone.replace(/(\d\d\d)(\d\d\d)(\d\d\d\d)/, '($1) $2-$3') + '</p>';
	
			//remove previous zoomto listner
			$(".zoom_to").off('click.zoom');
	
			//Add zoom to listner
			$(".zoom_to").on('click.zoom', function() {
				zoomToFacility(facility_record.Latitude, facility_record.Longitude);
			});
	
		}
	
		function parseChemicals(facility_record) {
			var chemList = document.getElementById('chemicalList');
			var emissions;
			//Remove stale content
			chemList.innerHTML = '';
			//Parse record
			if (facility_record.Emissions !== undefined && facility_record.Emissions[windowYear] !== undefined && facility_record.Emissions[windowYear].Submissions !== undefined) {
				emissions = facility_record.Emissions[windowYear].Submissions;
			} else {
				emissions = 'NoData';
			}
	
			if (emissions !== 'NoData') {
				emissions.sort(function(a, b) {
					//http://stackoverflow.com/questions/5435228/sort-an-array-with-arrays-in-it-by-string
					//Returns results high-to-low.  Change return 1 to -1 and return -1 to 1 to reverse
					if (a.Score < b.Score) {
						return 1;
					}
					if (a.Score > b.Score) {
						return -1;
					}
					return 0;
				});
	
				for (var i; i<emissions.length; i++) {
					var div = document.createElement('div');
					div.setAttribute('class', 'chemical_row');
					div.setAttribute('id', 'cas' + emissions[i].CASNumber);
					div.innerHTML = emissions[i].Chemical + '<br />' + 'Pounds: ' + emissions[i].Pounds.toFixed(2) + ' Risk: ' + emissions[i].Score.toFixed(2) + '<div id="inf' + emissions[i].CASNumber + '" class="chemical_details"></div>';
					chemList.appendChild(div);
				}
			} else {
				chemList.innerHTML = 'No Chemical Air Releases in ' + windowYear;
			}
		}
	
		function parseIndustry(facility_record) {
			var industryList = document.getElementById('industryList');
	
			//Remove stale content
			industryList.innerHTML = '';
	
			//parse record
			for (var i = 1; i < 10; i++) {
				if (facility_record['NAICS' + i]) {
					var div = document.createElement('div');
					var html = "";
					div.setAttribute('class', 'chemical_row');
					html += '<strong>' + facility_record['NAICS' + i].name + '</strong><br />';
					if (!facility_record['NAICS' + i] || !facility_record['NAICS' + i][windowYear]) {
						html += 'This facility did not report any air releases during this year, so comparisons are unavailable.';
					} else if (facility_record['NAICS' + i][windowYear].state_count === 1 && facility_record['NAICS' + i][windowYear].us_count === 1) {
						html += 'There is only 1 facility of this type in the country.';
					} else if (facility_record['NAICS' + i][windowYear].state_count === 1 && facility_record['NAICS' + i][windowYear].us_count > 1) {
						html += 'There is only 1 facility of this type in the State. There are ' + facility_record['NAICS' + i][windowYear].us_count + ' in the country. It emits more pounds of chemicals than ' + facility_record['NAICS' + i][windowYear].us_count + ' percent of facilities of this type in the country.  It is riskier than ' + facility_record['NAICS' + i][windowYear].us_score_pct + ' percent of facilities of this type in the country.';
					} else {
						html += 'There are ' + facility_record['NAICS' + i][windowYear].state_count + ' facilities of this type in this state and ' + facility_record['NAICS' + i][windowYear].us_count + ' in the country. It emits more pounds of chemicals than ' + facility_record['NAICS' + i][windowYear].state_pounds_pct + ' percent of facilities of this type in the state and ' + facility_record['NAICS' + i][windowYear].us_pounds_pct + ' percent in the country. The facility is riskier than ' + facility_record['NAICS' + i][windowYear].state_score_pct + ' percent of facilities of this type in the state and ' + facility_record['NAICS' + i][windowYear].us_score_pct + ' percent in the country.';
					}
	
					div.innerHTML = html;
					industryList.appendChild(div);
				}
			}
		}
	
		function initChemListListener() {
			//Event Listener for chemical list click
			$("#chemicalList").on('click.chemdetails', function(e) {
				var target = $(e.target);
	
				// Check that they clicked on a chemical row and not the container
				if (target.hasClass("chemical_row")) {
					var casNum = (e.target.id).substring(3, e.target.id.length);
					var chem_details = target.children('.chemical_details');
	
					//Check to see if data was downloaded during a previous click
					//If not, download data
					if (!target.hasClass("data_loaded")) {
						//Position from top of chemical list to scroll list to
						var scrollto = $("#chemicalList").scrollTop() + chem_details.position().top - 120;
	
						//Get the clicked chemical from the api and add "data_loaded" class to prevent loading again on future clicks
						getChem(casNum);
						target.addClass("data_loaded");
						chem_details.show();
	
						//Scroll chemical list window so chemical of interest is at top
						$("#chemicalList").animate({
							scrollTop : (scrollto + 'px')
						}, 'slow');
	
					} else {
						//If data already loaded, hide or show the chemical details depending on the current view state
						if (chem_details.is(":visible")) {
							chem_details.hide();
						} else {
							chem_details.show();
						}
					}
				}
			});
		}
	
		function getChem(casNum) {
			var url = 'http://140.160.114.197/api/v3/chemical/' + casNum + '.json';
			$.ajax({
				dataType : "json",
				url : url,
				success : function(data) {
					parseChem(casNum, data);
					_gaq.push(['_trackEvent', 'Chemical Tab', 'Get Chemical', data.ChemName]);
				},
				error: function(request){
					_gaq.push(['_trackEvent', 'Error', 'Get Chemical', "URL: " + url + "Response: " + request.responseText]);
				}
			});
		}
	
		function parseChem(casNum, data) {
			var html = '';
	
			// Metal
			html += "<br /><strong>Metalic: </strong>";
			if (data.Metal === "TRUE") {
				html += 'This chemical is a metal';
			} else {
				html += 'This chemical is not a metal';
			}
	
			// Carcinogen
			html += "<br /><br /><strong>Cancer: </strong>";
			if (data.ToxicityClassInhale === "cancer" && data.ToxicityClassOral === "cancer") {
				html += "This chemical is carcinogenic through both the oral and inhalation pathways";
			} else if (data.ToxicityClassInhale === "non-cancer" && data.ToxicityClassOral === "non-cancer") {
				html += "This chemical is not known to be carcinogenic";
			} else if (data.ToxicityClassInhale === "cancer" && data.ToxicityClassOral === "non-cancer") {
				html += "This chemical is carcinogenic through the inhalation pathway but not the oral pathway";
			} else if (data.ToxicityClassInhale === "non-cancer" && data.ToxicityClassOral === "cancer") {
				html += "This chemical is carcinogenic through the oral pathway but not the inhalation pathway";
			} else {
				html += "Information on cancer causing effects are not available for this chemical";
			}
	
			// Health Effects
			html += "<br /><br /><strong>Other Health Effects: </strong>";
			if (data['Health Effects'] === undefined || data['Health Effects'] === null || data['Health Effects'].length === 0) {
				html += "Human health effects have not been identfied for this chemical";
			} else {
				html += 'Identified human health effects include: ';
				if (data['Health Effects'].length === 1) {
					html += data['Health Effects'][0];
				} else if (data['Health Effects'].length === 2) {
					html += data['Health Effects'][0] + ' and ' + data['Health Effects'][1];
				} else if (data['Health Effects'].length > 2) {
					var text = data['Health Effects'][data['Health Effects'].length - 1];
					data['Health Effects'][data['Health Effects'].length - 1] = 'and ' + text;
					html += data['Health Effects'].join(', ');
				}
			}
	
			//Federal Register
			html += "<br /><br /><strong>Federal Register: </strong>";
			if (data['Federal Register'] === "") {
				html += "There is no official definition of this chemical in the federal register";
			} else {
				html += data['Federal Register'];
			}
	
			// Aditional Information
			html += "<br /><br /><strong>Additional information: </strong>";
	
			if (data.IRIS !== "") {
				html += '<br /><a href="' + data.IRIS + '" target="_blank">Integrated Risk Information System (IRIS)</a>';
			}
			if (data.ATSDR !== "") {
				html += '<br /><a href="' + data.ATSDR + '" target="_blank">Agency for Toxic Substances and Disease Registry (ATSDR)</a>';
			}
			if (data.OPP !== "") {
				html += '<br /><a href="' + data.OPP + '" target="_blank">Office of Pesticide Programs (OPP)</a>';
			}
			if (data.OPP === "" && data.IRIS === "" && data.ATSDR === "") {
				html += "<br />None available";
			}
	
			//Add html to chemical div
			document.getElementById('inf' + casNum).innerHTML = html;
		}
	
		function initYearChangers(facility_record) {
			//remove previous listner
			$("#facility_tabs").off('click.yearchanger');
			//Set the windowYear to the mapYear on first load
			$("div.year-label").html(mapYear);
			//app.windowYear = app.mapYear;
	
			//Add click listner with yearchanger namespace for later reference
			$("#facility_tabs").on('click.yearchanger', function(e) {
				var oldyear = windowYear;
				if ($(e.target).hasClass("arrow-left")) {
					if (windowYear > minYear) {
						windowYear -= 1;
					}
				} else if ($(e.target).hasClass("arrow-right")) {
					if (windowYear < maxYear) {
						windowYear += 1;
					}
				} else {
					return;
				}
	
				if (oldyear !== windowYear) {
					$("div.year-label").html(windowYear);
					parseChemicals(facility_record);
					parseIndustry(facility_record);
					$("#chemicalList").animate({
						scrollTop : ('0px')
					}, 'fast');
					$("#IndustryList").animate({
						scrollTop : ('0px')
					}, 'fast');
				}
			});
		}
	
		// END Popup Functionality
	
		setTimeout(function() {
			google.load('visualization', '1', {
				'callback' : 'var nothing',
				'packages' : ['corechart']
			});
		}, 1000);
		// end document.ready function
	});
	
	function closeSearch() {
		$("#searchresultsbox").hide();
		$("#searchresults").empty();
	}
	
	function showFacility(lat, lng) {
		!marker ? null : map.removeLayer(marker);
		marker = L.marker([lat, lng], {
			icon : clickedFacilityIcon
		});
		marker.addTo(map);
	}
	
	function zoomToFacility(lat, lng) {
		map.setView([lat, lng], 14);
	}
})();