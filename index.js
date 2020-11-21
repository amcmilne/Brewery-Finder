const breweryAPI = `https://api.openbrewerydb.org/breweries`;

const pexelsKey = "563492ad6f91700001000001fe3c105e24bd4d0fb571b345de8d087a";

let currentPage = 1;

const getPhotos = () => {
	$.ajax({
		beforeSend: function (request) {
			request.setRequestHeader("Authorization", pexelsKey);
		},
		url:
			"https://api.pexels.com/v1/search?query=beer&orientation=portrait&per_page=30",
		method: "GET",
	}).then(response => {
		const photos = [];
		response.photos.forEach(photo => {
			photos.push(photo.src.small);
		});
		localStorage.setItem("images", JSON.stringify(photos));
	});
};

const selectRandomImage = imageArr => {
	const imageIndex = Math.floor(Math.random() * imageArr.length);
	return imageArr[imageIndex];
};

const renderBreweries = (city, state, type, page) => {
	$("#breweries").empty();
	let breweryURL = `${breweryAPI}?by_city=${encodeURIComponent(
		city
	)}&by_state=${encodeURIComponent(state)}&per_page=5&page=${page}`;

	if (type) {
		breweryURL += `&by_type=${type}`;
	}
	console.log(breweryURL);
	$.ajax({
		url: breweryURL,
		method: "GET",
	}).then(resArr => {
		if (resArr.length < 1) {
			currentPage--;
			renderBreweries(city, state, type, currentPage);
		}
		resArr.forEach(response => {
			if (response) {
				const {
					name,
					type,
					street,
					city,
					state,
					postal_code,
					phone,
					website_url,
				} = response;

				const breweryContainer = $("<div>").addClass("box");
				const breweryArticle = $("<article>").addClass("media");
				const brewery = $("<div>").addClass("content");

				if (name) {
					const breweryName = $("<p>").html(`<strong>${name}</strong>`);
					brewery.append(breweryName);
				}
				if (type) {
					const breweryType = $("<p>").text(`Type: ${type}`);
					brewery.append(breweryType);
				}
				if (street) {
					const breweryStreet = $("<p>").text(street);
					brewery.append(breweryStreet);
				}
				if (city && state && postal_code) {
					const breweryAddress = $("<p>").text(
						`${city}, ${state} ${postal_code}`
					);
					brewery.append(breweryAddress);
				}
				if (phone) {
					const breweryPhone = $("<p>").html(
						`Phone: <a href='tel:${phone}'>${phone}</a>`
					);
					brewery.append(breweryPhone);
				}
				if (website_url) {
					const breweryWebsite = $("<p>").html(
						`Website: <a href=${website_url}>${website_url}</a>`
					);
					brewery.append(breweryWebsite);
				}

				const imageURL = selectRandomImage(
					JSON.parse(localStorage.getItem("images"))
				);

				const breweryImage = $(
					`<div class="media-left">
						<figure class="image">
							<img src=${imageURL} alt="Image" />
						</figure>
					</div>`
				);

				breweryArticle.append(breweryImage);
				breweryArticle.append(brewery);
				breweryContainer.append(breweryArticle);
				$("#breweries").append(breweryContainer);
			}
		});
	});
};

$("#search-form").submit(e => {
	e.preventDefault();

	const city = $("#search-city").val();
	const state = $("#search-state").val();
	const type = $("#brewery-type").val();

	localStorage.setItem("city", city);
	localStorage.setItem("state", state);
	localStorage.setItem("type", type);
	currentPage = 1;

	getPhotos();
	renderBreweries(city, state, type, currentPage);
});

$("#prev").click(() => {
	const city = localStorage.getItem("city");
	const state = localStorage.getItem("state");
	const type = localStorage.getItem("type");
	if (currentPage > 1) {
		currentPage--;
		renderBreweries(city, state, type, currentPage);
	}
});

$("#next").click(() => {
	const city = localStorage.getItem("city");
	const state = localStorage.getItem("state");
	const type = localStorage.getItem("type");
	currentPage++;
	renderBreweries(city, state, type, currentPage);
});
