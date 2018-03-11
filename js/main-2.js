ymaps.ready(MYAPP);

function MYAPP() {

	class Players {

		constructor(name) {
			this.name = name;
			this.cities = [];
			this.symbol = '';
		}

		humanRequre(city) {
			fetch('http://api.geonames.org/searchJSON?name_equals=' + city + '&lang=ru&featureClass=P&cities=cities1000&orderby=relevance&username=kirill_for_yandex')
				.then(game.getResponse)
				.then(game.humanInfo)
				.then(game.lastSymb)
				.then(game.player.compRequre)
				.catch(err => outRes.innerHTML = 'Введенный город не найден.');
		}

		compRequre(symbol) {
			fetch('http://api.geonames.org/searchJSON?name_startsWith=' + symbol + '&orderby=relevance&searchlang=ru&cities=cities1000&lang=ru&featureClass=P&username=kirill_for_yandex')
				.then(game.getResponse)
				.then(game.ifNothing)
				.then(game.ifRepeat)
				.then(game.compInfo)
				.then(game.lastSymb)
				.catch(err => outRes.innerHTML = err);
		}

	}

	class Game {

		constructor() {
			this.currentProfile = 0;
			this.test = new Tests();
			this.player = new Players();
		}

		loadGame() {
			game.init();
			return;
		}

		startApp() {
			game.getCity();
			console.log(game.city, game);
			return;
		}

		getCity() {
			this.city = document.getElementById('humanCity').value;
			document.getElementById('humanCity').value = outRes.innerHTML = '';
			game.test.firstTest(game.city)
			return;
		}

		getResponse(response) {
			return response.json();
		}

		humanInfo(ourData) {
			for (let i = 0; i < profiles.length; i++) {
				if (profiles[i]['checked'] == true) {
					users[i].cities.push(ourData.geonames[0].name);
					game.currentProfile = i;
				}
			}
			game.setLabel(ourData.geonames[0].lat, ourData.geonames[0].lng);
			console.log(users, game.currentProfile);
			humanContainer.innerHTML += ' ' + ourData.geonames[0].name + ', ';
			return ourData.geonames[0].name;
		}

		lastSymb(city) {
			users[game.currentProfile].symbol = city.charAt(city.length - 1);
			if (users[game.currentProfile].symbol == 'ъ' || users[game.currentProfile].symbol == 'ь') {
				users[game.currentProfile].symbol = city.charAt(city.length - 2);
			}
			return users[game.currentProfile].symbol;
		}

		ifNothing(compData) {
			return new Promise((resolve, reject) => {
				if (compData['totalResultsCount'] == 0) {
					return reject('Нажмите "The end", чтобы подвести итоги.');
				}
				return resolve(compData);
			})
		}

		ifRepeat(compData) {
			return new Promise((resolve, reject) => {
				random = Math.floor(Math.random() * compData.geonames.length);
				if (computers[game.currentProfile].cities) {
					computers[game.currentProfile].cities.forEach(function(element) {
						if (compData.geonames[random].name == element) {
							return reject('Нажмите "The end", чтобы подвести итоги.');
						}
					});
				}
				return resolve(compData);
			})
		}

		compInfo(compData) {
			computers[game.currentProfile].cities.push(compData.geonames[random].name);
			game.setLabel(compData.geonames[random].lat, compData.geonames[random].lng);
			compContainer.innerHTML += ' ' + compData.geonames[random].name + ', ';
			console.log(users, computers);
			return compData.geonames[random].name;
		}

		restart() {
			let humanTotals = '',
				compTotals = '',
				str = '';

			users[game.currentProfile].cities.forEach(function(element, index) {
				humanTotals += `${index + 1} - ${element} ,`;
			});

			computers[game.currentProfile].cities.forEach(function(element, index) {
				compTotals += `${index + 1} - ${element} ,`;
			});

			if (users[game.currentProfile].cities.length > computers[game.currentProfile].cities.length) {
				str = 'Поздравляю, вы победили.';
			} else {
				str = 'Победил компьютер.';
			}

			outRes.innerHTML = 'User: ' + humanTotals + '\n\n' + 'Computer: ' + compTotals + '\n\n' + str;
			users[game.currentProfile].cities = [];
			computers[game.currentProfile].cities = [];
			humanContainer.innerHTML = compContainer.innerHTML = '';
			game.myMap.geoObjects.each((geoObject) => {
				game.myMap.geoObjects.remove(geoObject);
			})
		}

		handleProfile(i) {
			game.currentProfile = i;
			let string = '';

			users[game.currentProfile].cities.forEach(function(element) {
				string += element + ' ,';
			});

			humanContainer.innerHTML = string;
			string = '';

			computers[game.currentProfile].cities.forEach(function(element) {
				string += element + ' ,';
			});

			compContainer.innerHTML = string;
			outRes.innerHTML = '';
			return;
		}

		init() {
			game.myMap = new ymaps.Map('map', {
				center: [0, 0],
				zoom: 2
			});
			game.myMap.controls
				.add('zoomControl', {
					left: 5,
					top: 5
				})
		}

		setLabel(lat, lng) {
			let res = ymaps.geocode([lat, lng], {
				kind: 'locality'
			});
			res.then(
				(res) => game.myMap.geoObjects.add(res.geoObjects.get(0)),
				function(err) {
					console.log(err);
				}
			);
		}

	}

	class Tests {

		firstTest(city) {
			if (city == '') {
				outRes.innerHTML = 'Введите город';
				return;
			} else game.test.checkSymbol(city);
		}

		checkSymbol(city) {
			city = city.toLowerCase();
			city = city[0].toUpperCase() + city.slice(1);
			if (users[game.currentProfile].cities.length) {
				if (city.charAt(0) == users[game.currentProfile].symbol.toUpperCase()) {
					game.test.checkCity(city)
					return;
				} else {
					outRes.innerHTML = 'Ссылка на правила игры в заглавии. 2';
					return;
				}
			} else {
				game.player.humanRequre(city);
				return;
			}
		}

		checkCity(city) {
			for (let i = 0; i < users[game.currentProfile].cities.length; i++) {
				for (let j = 0; j < computers[game.currentProfile].cities.length; j++) {
					if (city == users[game.currentProfile].cities[i] || city == computers[game.currentProfile].cities[j]) {
						outRes.innerHTML = 'Этот город уже был введен';
						return;
					}
				}
			}
			game.player.humanRequre(city);
			return;
		}
	}

	let user1 = new Players('user1');
	let user2 = new Players('user2');
	let computer1 = new Players('computer1');
	let computer2 = new Players('computer2');
	let game = new Game();

	let humanContainer = document.getElementById('humanCities');
	let compContainer = document.getElementById('compCities');
	let random;
	let outRes = document.getElementById('outRes');

	let users = [user1, user2];
	let computers = [computer1, computer2];

	let profiles = document.getElementsByName('game-profile');



	for (let i = 0; i < profiles.length; i++) {
		profiles[i].onclick = function(event) {
			game.handleProfile(i);
		}
	}

	window.addEventListener('load', game.loadGame);
	document.getElementById('btn').addEventListener('click', game.startApp);
	document.getElementById('restart').addEventListener('click', game.restart)

}