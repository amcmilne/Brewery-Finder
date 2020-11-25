// --------------------------- VARIABLES --------------------------------

const breweryAPI = `https://api.openbrewerydb.org/breweries`;

const pexelsKey = "563492ad6f91700001000001fe3c105e24bd4d0fb571b345de8d087a";

const locationIqKey = "pk.aa879f60d2bb5ec17e4952ada25eaec7";

var currentPage = 1;

// --------------------------- FUNCTIONS --------------------------------

// Upon performing a search, retrieve 30 beer-related images (as urls) using Pexels API
// and store in local storage for later use in the renderBreweries function
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

// Helper function to select a random image
const selectRandomImage = imageArr => {
	const imageIndex = Math.floor(Math.random() * imageArr.length);
	return imageArr[imageIndex];
};

// Use locationIQ API for reverse geocoding using latitude and longitude from
// navigator.geolocation.getCurrentPosition. Store the resulting city and state
// in locale storage for use in the renderBreweries function

const getCurrentUserLocation = (latitude, longitude) => {
	const url = `https://us1.locationiq.com/v1/reverse.php?key=${locationIqKey}&lat=${latitude}&lon=${longitude}&format=json`;
	$.ajax({
		url,
		method: "GET",
	}).then(response => {
		const city = response.address.city;
		const state = response.address.state;
		localStorage.setItem("city", city);
		localStorage.setItem("state", state);
		renderBreweries(city, state, null, currentPage);
	});
};

// Using the OpenBreweryDB API, retrieve information on breweries based on user input
// and dynamically render content as individual sections that contains the response data
// as information for each retrieved brewery. Appends a random image from local storage
// (refer to getPhotos function) to each section.
const renderBreweries = (city, state, type, page, name, isNext) => {
	// Empty out pre-existing content in div with id 'breweries'
	$("#breweries").empty();

	// Create URL to be used in ajax call using base URL and arguments passed in as
	// query parameters
	var breweryUrl;

	if (name) {
		breweryURL = `${breweryAPI}?by_name=${name}`;
	} else {
		breweryURL = `${breweryAPI}?by_city=${encodeURIComponent(
			city
		)}&by_state=${encodeURIComponent(state)}&per_page=5&page=${page}`;

		// Only append type query parameter if a type is provided
		if (type) {
			breweryURL += `&by_type=${type}`;
		}
	}

	// Make AJAX GET request to OpenBreweryDB with 'breweryURL'
	$.ajax({
		url: breweryURL,
		method: "GET",
	}).then(resArr => {
		// This conditional ensures that if the next page of results is empty,
		// then the previous page should be redisplayed.
		// Cannot simply return since renderBreweries is emptied on being called.
		// isNext is only true when the 'Next' button is clicked. This is to prevent
		// an infinite loop a search returns an empty resArr.
		if (resArr.length < 1 && isNext) {
			currentPage--;
			renderBreweries(city, state, type, currentPage, null);
		}
		resArr.forEach(response => {
			// VARIABLES
			// =====================================================================

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

			// ELEMENTS
			// =====================================================================

			// First level dynamic element
			const breweryContainer = $("<div>").addClass("box");
			// Second level dynamic element. Contains 'brewery' and 'breweryImage'
			const breweryArticle = $("<article>").addClass("media");
			// Third level dynamic element. Contains content using response data from call to 'breweryURL'.
			const brewery = $("<div>").addClass("content");

			// Conditionally render content if the corresponding data is
			// retrieved from call to 'breweryURL'.
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

			// Sets 'imageURL' to a random image url from local storage.
			const imageURL = selectRandomImage(
				JSON.parse(localStorage.getItem("images"))
			);

			// Third level dynamic content. Displays image from 'imageURL'.
			const breweryImage = $(
				`<div class="media-left">
						<figure class="image">
							<img src=${imageURL} alt="Image" />
						</figure>
					</div>`
			);

			// APPEND ELEMENTS
			// =====================================================================

			breweryArticle.append(breweryImage);
			breweryArticle.append(brewery);
			breweryContainer.append(breweryArticle);
			$("#breweries").append(breweryContainer);
		});
	});
};

// ---------------------- EVENT LISTENERS -----------------------------

// Retrieve brewery information based on user input in location form
$("#search-form").submit(e => {
	e.preventDefault();

	const city = $("#search-city").val();
	const state = $("#search-state").val();
	const type = $("#brewery-type").val();

	// Need to store the above values for later use
	// with pagination
	localStorage.setItem("city", city);
	localStorage.setItem("state", state);
	localStorage.setItem("type", type);
	// Set currentPage to 1

	currentPage = 1;

	renderBreweries(city, state, type, currentPage);
});

//retrieve brewery information based on user input in name form
$("#search-form2").submit(e => {
	e.preventDefault();

	const name = $("#search-brewery").val();

	localStorage.setItem("search-brewery", name);

	// Set currentPage to 1
	currentPage = 1;

	renderBreweries(null, null, null, null, name);
});

// See previous page of results
$("#prev").click(() => {
	// Need to retrieve information from local storage to
	// render next page of results
	const city = localStorage.getItem("city");
	const state = localStorage.getItem("state");
	const type = localStorage.getItem("type");

	// Validate page number so that the page number is NLT 1
	if (currentPage > 1) {
		// Decrement page
		currentPage--;
		renderBreweries(city, state, type, currentPage);
	}
});

// See next page of results
$("#next").click(() => {
	// Need to retrieve information from local storage to
	// render next page of results
	const city = localStorage.getItem("city");
	const state = localStorage.getItem("state");
	const type = localStorage.getItem("type");

	// Increment page
	renderBreweries(city, state, type, currentPage, null, true);
});

// Auto-render Current Location Information
$("document").ready(() => {
	navigator.geolocation.getCurrentPosition(response => {
		const latitude = response.coords.latitude;
		const longitude = response.coords.longitude;
		getCurrentUserLocation(latitude, longitude);
	});

	getPhotos();
});
