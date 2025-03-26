'use strict';

const filmList = document.querySelector('.film-list');
const poster = document.querySelector('.poster');
const card = document.querySelector('.card');
const addToggle = document.querySelector('.add');
const dialog = document.querySelector('dialog');
const cancelBtn = document.querySelector('#cancel');
const addBtn = document.querySelector('#add');
const form = document.querySelector('form');

addToggle.addEventListener('click', (e) => {
	dialog.showModal();
});
cancelBtn.addEventListener('click', (e) => {
	form.reset();
	dialog.close();
});

async function fetchFunc() {
	filmList.innerHTML = '';
	fetch('http://localhost:3000/films?_embed=tickets')
		.then((res) => res.json())
		.then((films) => {
			const tickets = films.reduce((arr, curr) => arr.concat(curr.tickets), []);
			let lastFilmId = +films.at(-1).id;

			function displayFilm() {
				poster.setAttribute('src', this.poster);
				card.innerHTML = `
            <div>
				<p class="title">${this.title}</p>
				<p>Runtime: <span class="runtime">${this.runtime} minutes</span></p>
			</div>
			<p class="description">${this.description}</p>
			<div>
				<div class="showtime">${this.showtime}</div>
				<div>Remaining Tickets: <span class="tickets-remaining">${this.capacity - this.tickets_sold}</span></div>
			</div>
			<div>
				<button class="buy-btn">Crap</button>
				<input type="number" max="${this.capacity - this.tickets_sold}" min="1" name="number" value='1' id="number">
			</div>
			<div>
				<button class='previous'><</button>
				<button class='next'>></button>
			</div>`;

				card.setAttribute('data-item', this.id);
				const buyBtn = card.querySelector('.buy-btn');
				const remainingTickets = card.querySelector('.tickets-remaining');
				const numberOfTickets = card.querySelector('#number');

				if (this.capacity === this.tickets_sold) disable();
				else buyBtn.textContent = 'Buy Ticket';

				buyBtn.addEventListener('click', (e) => {
					if (remainingTickets.textContent === 0) return;
					this.tickets_sold = +this.tickets_sold + +numberOfTickets.value;

					fetch(`http://localhost:3000/films/${this.id}`, {
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						body: JSON.stringify({
							tickets_sold: +this.tickets_sold,
						}),
					});

					fetch(`http://localhost:3000/tickets/`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						body: JSON.stringify({
							film_id: this.id,
							number_of_tickets: `${numberOfTickets.value}`,
							id: `${tickets.length + 1}`,
						}),
					});

					remainingTickets.textContent = +remainingTickets.textContent - numberOfTickets.value;
					numberOfTickets.setAttribute('max', `${remainingTickets.textContent}`);
					numberOfTickets.value = +remainingTickets.textContent > 0 ? '1' : '0';
					if (+remainingTickets.textContent === 0) disable();

					tickets.push({
						film_id: this.id,
						number_of_tickets: 1,
						id: `${tickets.length + 1}`,
					});
				});

				const nextBtn = card.querySelector('.next');
				const prevBtn = card.querySelector('.previous');

				nextBtn.addEventListener('click', (e) => {
					if (card.dataset.item === [...filmList.querySelectorAll('li')].at(-1).dataset.item) return;
					displayFilm.call(films[card.dataset.item]);
				});
				prevBtn.addEventListener('click', (e) => {
					if (card.dataset.item === filmList.querySelector('li').dataset.item) return;
					displayFilm.call(films[+card.dataset.item - 2]);
				});

				function disable() {
					numberOfTickets.value = '0';
					buyBtn.textContent = 'Sold Out';
					buyBtn.setAttribute('disabled', '');
					buyBtn.classList.add('sold-out');
					numberOfTickets.setAttribute('disabled', '');
				}
			}

			displayFilm.call(films[0]);

			films.forEach((film) => {
				const divider = document.createElement('div');
				divider.classList.add('divider');

				const li = document.createElement('li');
				li.dataset.item = film.id;
				li.classList.add('film');
				li.textContent = film.title;
				li.addEventListener('click', displayFilm.bind(film));
				const delBtn = document.createElement('div');
				delBtn.classList.add('delete-button');
				delBtn.addEventListener('click', (e) => {
					fetch(`http://localhost:3000/films/${li.dataset.item}`, {
						method: 'DELETE',
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
					});
					films.splice(
						films.findIndex((film) => {
							return film.id === li.dataset.item;
						}),
						1
					);
					if (li.dataset.item === card.dataset.item) {
						displayFilm.call(films[0]);
					}
					e.stopPropagation();
					e.target.parentElement.nextSibling.remove();
					e.target.parentElement.remove();
				});
				li.appendChild(delBtn);

				filmList.appendChild(li);
				filmList.appendChild(divider);
			});

			form.addEventListener('submit', (e) => {
				e.preventDefault();
				const title = form.querySelector('#title').value.trim();
				const runtime = form.querySelector('#runtime').value;
				const capacity = +form.querySelector('#capacity').value;
				const showtime = form.querySelector('#showtime').value.trim();
				const description = form.querySelector('#description').value.trim();
				const poster = form.querySelector('#poster-image').value.trim();

				fetch('http://localhost:3000/films', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					body: JSON.stringify({
						id: `${lastFilmId + 1}`,
						title,
						runtime,
						capacity,
						showtime,
						tickets_sold: 0,
						description,
						poster,
					}),
				}).then(() => {
					cancelBtn.dispatchEvent(new Event('click'));
					fetchFunc();
				});
			});
		});
}

fetchFunc();
