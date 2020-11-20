// JavaScript File
// API Handling
const breweryAPI = `https://api.openbrewerydb.org/breweries?by_postal=`;

// Need to use the proxy below to add CORS header to request and Access-Control-Allow-Origin: * header to the response
// * is a wildcard value to allow all domains to access the resources from the server.
// Ref: https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9

const zipCodeAPI =
	"https://cors-anywhere.herokuapp.com/https://www.zipcodeapi.com/rest/";
const zipCodeKey =
	"WwD56QP6XyYGYcJzczw7XZ3jSTQwpPclAWFh0YlGslIIlFAgotufCFQVvnS84P7j";

const getZipCodes = (city, state) => {
	const zipCodeURL = `${zipCodeAPI}${zipCodeKey}/city-zips.json/${city}/${state}`;

	$.ajax({
		url: zipCodeURL,
		method: "GET",
	}).then(response => {
		getBreweries(response.zip_codes);
	});
};

const getBreweries = zipCodes => {
	$("#breweries").empty();
	zipCodes.forEach(zipCode => {
		const breweryURL = `${breweryAPI}${zipCode}`;
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
						const breweryWebsite = $("<p>").text(`Website: ${website_url}`);
						brewery.append(breweryWebsite);
					}

					breweryArticle.append(brewery);
					breweryContainer.append(breweryArticle);
					$("#breweries").append(breweryContainer);
				}
			});
		});
	});
};

$("#search-form").submit(e => {
	e.preventDefault();

	const city = $("#search-city").val();
	const state = $("#search-state").val();

	getZipCodes(city, state);
});
