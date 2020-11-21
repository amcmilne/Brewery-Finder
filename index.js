const breweryAPI = `https://api.openbrewerydb.org/breweries`;

const pexelsKey = "563492ad6f91700001000001fe3c105e24bd4d0fb571b345de8d087a";

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

const renderBreweries = (city, state) => {
	$("#breweries").empty();
	const breweryURL = `${breweryAPI}?by_city=${encodeURIComponent(
		city
	)}&by_state=${encodeURIComponent(state)}&per_page=10`;

	$.ajax({
		url: breweryURL,
		method: "GET",
	}).then(resArr => {
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

	renderBreweries(city, state);
});

// getPhotos();
