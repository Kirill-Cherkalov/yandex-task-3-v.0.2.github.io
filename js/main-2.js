ymaps.regady(MYAPP);

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
//numberOfUsers
		constructor() {
			this.currentProfile;
			this.test = new Tests();
			this.player = new Players();
			this.profiles;
		}
		// loadGame() {
		// 	return;
		// }

		startApp() {
			game.getCity();
			console.log(game.city, game);
			return;
		}

		getCity() {
			//получает строку, введенную пользователем
			this.city = doc.getElementById('humanCity').value;
			doc.getElementById('humanCity').value = outRes.innerHTML = '';
			game.test.firstTest(game.city)
			return;
		}

		getResponse(response) {
			return response.json();
		}

		humanInfo(ourData) {
			for (let i = 0; i < profiless.length; i++) {
				if (profiless[i]['checked'] == true) {
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

			outRes.innerHTML = `${names[game.currentProfile]} ${humanTotals} \n\n  Computer ${compTotals} \n\n ${str}`;
			users[game.currentProfile].cities = [];
			computers[game.currentProfile].cities = [];
			humanContainer.innerHTML = compContainer.innerHTML = '';
			game.myMap.geoObjects.each((geoObject) => {
				game.myMap.geoObjects.remove(geoObject);
			})
		}

		switchProfile(i) {
			//вывод информацию выбранного игрока
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

		createUsers() {
			//создает игроков, вызывает init(), showInfo();
			doc.getElementsByClassName('article')[0].style['visibility'] = 'hidden';
			doc.getElementById('btn')['disabled'] = false;
			doc.getElementById('start_button')['disabled'] = false;
			doc.getElementById('humanCity')['disabled'] = false;
			doc.getElementById('restart')['disabled'] = false;

			for (let i = 0; i < numberOfUsers; i++) {
				let name = +`user${i+1}`;
				users.push(`user${i+1}`);
				computers.push(`computer${i+1}`)
			}

			for (let i = 0; i < numberOfUsers; i++) {
				names[i] = numbNames[i]['value'];
			}

			for (let i = 0; i < users.length; i++) {
				users[i] = new Players(names[i]);
				computers[i] = new Players();
			}
			console.log(names);
			console.log(users, computers);
			game.init();
			game.showInfo();
			return;
		}

		showInfo() {
			//в DOM запихивает input(ууправление) и label(имена игроков), вызывает handleProfile()
			let wrapped = doc.getElementById('profiles'),
				profileArray = [];
					// game.currentProfile =  numberOfUsers;
			let info = doc.createDocumentFragment();

			for (let i = 0; i < numberOfUsers * 2; i += 2) {
				for (let j = 1; j < numberOfUsers * 2; j += 2) {

					profileArray[i] = doc.createElement('input');
					profileArray[i].setAttribute('id', 'game-profile');
					profileArray[i].setAttribute('type', 'radio');
					// profileArray[i].setAttribute('checked', '');
					profileArray[i].setAttribute('name', 'game-profile');

					profileArray[j] = doc.createElement('label');

					profileArray[j].textContent = names[(j - 1) / 2];
				}
			}


			profileArray.forEach(function(element, index) {
				wrapped.appendChild(element);
			});
			// profiless - должна инициализироваться после вывода input-в в DOM
			profiless = doc.getElementsByName('game-profile');
			game.handleProfile();
			return;
		}

		handleProfile() {
			//срабатывает 1 раз после инициализации profiless, потом срабатывает при смене игрока
			
			for (let i = 0; i < profiless.length; i++) {
				profiless[i].onclick = function(event) {
					game.switchProfile(i);
				}
			}
		}

		calculateUsers(i) {
			//считает кол-о игроков
			numberOfUsers = numbProfiles[i]['value'];
			
			for (let j = i + 1; j < numbNames.length; j++) {
				numbNames[j].setAttribute('disabled', '');
			}
			for (let j = i; j > 0; j--) {
				numbNames[j]['disabled'] = false;
			}
		}

	}

	class Tests {

		firstTest(city) {
			//проверка на ввод пустой строки и выбор профиля
			if (city == '') {
				outRes.innerHTML = 'Введите город';
				return;
			} else if ( game.currentProfile == undefined ) {
				outRes.innerHTML = `Выберите профиль игрока `;
				return;
			} else {
				game.test.checkSymbol(city);
			}

			
		}

		checkSymbol(city) {
			//проверка первой и последней буквы
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
			//проаеряет введенный город в массиве юзера и компа
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

	let doc = document;

	let game = new Game();

	let humanContainer = doc.getElementById('humanCities'); //вывод инфы пользователя
	let compContainer = doc.getElementById('compCities'); //вывод инфы компьютера
	let random; //хранит рандомный номер город из json пакета, которы получает компьютер
	let outRes = doc.getElementById('outRes'); //вывод результата
	let profiless; //колеция для смены игроков во время игры

	let numbProfiles = doc.getElementsByName('radio'); //коллекция "радио" при запуске
	let numbNames = doc.getElementsByClassName('input-profile'); //коллекция "инпутов" при запуске
	let numberOfUsers; //получает кол-о игроков из коллекции numbProfiles

	let computers = []; //все компьютеры
	let users = []; //все игроки
	let names = []; //получает имена игроков из коллекции numbNames

	for (let i = 0; i < numbProfiles.length; i++) {
		//события при выборе кол-а игкроков
		numbProfiles[i].onclick = function(event) {
			game.calculateUsers(i);
		}
	}

	// window.addEventListener('load', game.loadGame);
	doc.getElementById('btn-profiles').addEventListener('click', game.createUsers);
	doc.getElementById('btn').addEventListener('click', game.startApp);
	doc.getElementById('restart').addEventListener('click', game.restart)

}