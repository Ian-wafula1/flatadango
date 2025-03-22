"use strict";

const filmList = document.querySelector('.film-list')
const poster = document.querySelector('.poster')
const card = document.querySelector('.card')
const divider = document.createElement('div')
divider.classList.add('divider')


fetch('http://localhost:3000/films').then(res => res.json())
.then(films => {
    let ticketId = 0;
    function displayFilm(){
        poster.setAttribute('src', this.poster)
        card.innerHTML = `
            <div>
				<p class="title">Title: ${this.title}</p>
				<p class="runtime">Runtime: ${this.runtime} minutes</p>
			</div>
			<div>
				<p class="description">${this.description}</p>
				<div>
					<div class="showtime">${this.showtime}</div>
					<div>Remaining Tickets: <span class="tickets-remaining">${this.capacity - this.tickets_sold}</span></div>
				</div>
			</div>
			<div>
				<button class="buy-btn">Crap</button>
			</div>`
        card.setAttribute('data-item', this.id)
        const buyBtn = card.querySelector('button')
        const remainingTickets = card.querySelector('.tickets-remaining')
        if (this.capacity === this.tickets_sold) {
            buyBtn.textContent = 'Sold Out'
            buyBtn.classList.add('sold-out')
        } else {
            buyBtn.textContent = 'Buy Ticket'
        }
    }
    displayFilm.call(films[0])
    films.forEach(film => {
        const li = document.createElement('li')
        li.classList.add('film')
        li.textContent = film.title
        li.addEventListener('click', displayFilm.bind(film))

        filmList.appendChild(li)
        filmList.appendChild(divider)
    });
})
.catch(error => console.log(error.message))