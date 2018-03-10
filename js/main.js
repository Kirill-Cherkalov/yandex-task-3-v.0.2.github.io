ymaps.ready(MYAPP);

function MYAPP() {
	let outRes = document.getElementById('outRes'),
		humanContainer = document.getElementById('humanCities'),
		compContainer = document.getElementById('compCities'),
		lastSymb = '';

	let user = {
		getCity: function() {
			user.city = document.getElementById('humanCity').value;
			document.getElementById('humanCity').value = outRes.innerHTML = '';
			tests.firstCheck(user.city);
		},
		cities: []
	};

	let comp = {
		cities: [],
		random: 0
	};

	let restart = {
		getResults: function() {
			let humanTotals = '',
				compTotals = '',
				str = '';
			console.log(user.cities, comp.cities);
			user.cities.forEach(function(element, index) {
				humanTotals += `${index + 1} - ${element} ,`;
			});

			comp.cities.forEach(function(element, index) {
				compTotals += `${index + 1} - ${element} ,`;
			});

			if (user.cities.length > comp.cities.length) {
				str = 'Поздравляю, вы победили.';
			} else {
				str = 'Победил компьютер.';
			}
			restart.showResult(humanTotals, compTotals, str);
		},
		showResult: function(humanTotals, compTotals, str) {
			outRes.innerHTML = 'User: ' + humanTotals + '\n\n' + 'Computer: ' + compTotals + '\n\n' + str;
			user.cities = [];
			comp.cities = [];
			humanContainer.innerHTML = compContainer.innerHTML = '';
			myMap.geoObjects.each((geoObject) => {
				myMap.geoObjects.remove(geoObject);
			});
		}
	};

	let tests = {
		firstCheck: function(city) {
			if (city == '') {
				outRes.innerHTML = 'Введите город';
				return;
			} else tests.checkSymbol(user.city);
		},
		checkSymbol: function(city) {
			city = city.toLowerCase();
			city = city[0].toUpperCase() + city.slice(1);
			if (user.cities.length) {
				if (city.charAt(0) == lastSymb.toUpperCase()) {
					tests.checkCity(city)
					return;
				} else {
					outRes.innerHTML = 'Ссылка на правила игры в заглавии.';
					return;
				}
			} else {
				send.humanRequre(city);
				return;
			}
		},
		checkCity: function(city) {
			for (let i = 0; i < user.cities.length; i++) {
				for (let j = 0; j < comp.cities.length; j++) {
					if (city == user.cities[i] || city == comp.cities[j]) {
						outRes.innerHTML = 'Этот город уже был введен';
						return;
					}
				}
			}
			send.humanRequre(city);
		},
		ifNothing: function(compData) {
			return new Promise((resolve, reject) => {
				if (compData['totalResultsCount'] == 0) {
					return reject('Нажмите "The end", чтобы подвести итоги.');
				}
				return resolve(compData);
			})

		},
		ifRepeat: function(compData) {
			return new Promise((resolve, reject) => {
				comp.random = Math.floor(Math.random() * compData.geonames.length);
				let rand = comp.random;
				if (comp.cities) {
					comp.cities.forEach(function(element) {
						if (compData.geonames[rand].name == element) {
							return reject('Нажмите "The end", чтобы подвести итоги.');
						}
					});
				}
				return resolve(compData);
			})
		}
	};

	let send = {
		humanRequre: function(city) {
			fetch('http://api.geonames.org/searchJSON?name_equals=' + city + '&lang=ru&featureClass=P&cities=cities1000&orderby=relevance&username=kirill_for_yandex')
				.then(send.getResponse)
				.then(handleRequest.humanInfo)
				.then(handleRequest.LastSymb)
				.then(send.compRequre)
				.catch(err => outRes.innerHTML = 'Введенный город не найден.');
		},
		compRequre: function(symbol) {
			fetch('http://api.geonames.org/searchJSON?name_startsWith=' + symbol + '&orderby=relevance&searchlang=ru&cities=cities1000&lang=ru&featureClass=P&username=kirill_for_yandex')
				.then(send.getResponse)
				.then(tests.ifNothing)
				.then(tests.ifRepeat)
				.then(handleRequest.compInfo)
				.then(handleRequest.LastSymb)
				.catch(err => outRes.innerHTML = err);
		},
		getResponse: function(response) {
			return response.json();
		}
	};

	let handleRequest = {
		humanInfo: function(ourData) {
			user.cities.push(ourData.geonames[0].name);
			yandex.setLabel(ourData.geonames[0].lat, ourData.geonames[0].lng);
			// console.log(user.cities);
			humanContainer.innerHTML += ' ' + ourData.geonames[0].name + ', ';
			return ourData.geonames[0].name;
		},
		LastSymb: function(city) {
			lastSymb = city.charAt(city.length - 1);
			if (lastSymb == 'ъ' || lastSymb == 'ь') {
				lastSymb = city.charAt(city.length - 2);
			}
			return lastSymb;
		},
		compInfo: function(compData) {
			rand = comp.random;
			comp.cities.push(compData.geonames[rand].name);
			yandex.setLabel(compData.geonames[rand].lat, compData.geonames[rand].lng);

			compContainer.innerHTML += ' ' + compData.geonames[rand].name + ', ';
			return compData.geonames[rand].name;
		}
	};

	let yandex = {
		init: function() {
			myMap = new ymaps.Map('map', {
				center: [0, 0],
				zoom: 2
			});
			myMap.controls
				.add('zoomControl', {
					left: 5,
					top: 5
				})
		},
		setLabel: function(lat, lng) {
			let res = ymaps.geocode([lat, lng], {
				kind: 'locality'
			});
			res.then(
				(res) =>  myMap.geoObjects.add(res.geoObjects.get(0)),
				function(err) {}
			);
		}
	};

	yandex.init();
	document.getElementById('btn').addEventListener('click', user.getCity);
	document.getElementById('restart').addEventListener('click', restart.getResults);
}