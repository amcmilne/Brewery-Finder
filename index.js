// JavaScript File
// API Handling
const breweryAPI = `https://api.openbrewerydb.org/breweries`;

const getBreweries = (city, state) => {
	$("#breweries").empty();
	const breweryURL = `${breweryAPI}?by_city=${encodeURIComponent(
		city
	)}&by_state=${encodeURIComponent(state)}`;
	console.log(breweryURL);
	$.ajax({
		url: breweryURL,
		method: "GET",
	}).then(resArr => {
		resArr.forEach(response => {
			console.log(response);
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
					const breweryWebsite = $("<p>").text(`Website: ${website_url}`);
					brewery.append(breweryWebsite);
				}

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

	getBreweries(city, state);
});
