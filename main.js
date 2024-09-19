document.addEventListener("DOMContentLoaded", () => {
    maptilersdk.config.apiKey = 'mmY6XO6W7RcdUkdHirOn';
    const map = new maptilersdk.Map({
        container: 'map',
        style: maptilersdk.MapStyle.STREETS,
        center: [-3.990431192947985, 39.51263816088107],
        zoom: 5
    });

    const categoryIcons = {
        wildfires: 'https://cdn-icons-png.flaticon.com/512/1453/1453025.png',
        volcanoes: 'https://cdn-icons-png.flaticon.com/512/3095/3095247.png',
        earthquakes: 'https://cdn-icons-png.flaticon.com/512/3242/3242697.png',
        floods: 'https://cdn-icons-png.flaticon.com/512/1467/1467452.png',
        severeStorms: 'https://cdn-icons-png.flaticon.com/512/10344/10344651.png',
        snow: 'https://cdn-icons-png.flaticon.com/512/6635/6635320.png',
        seaLakeIce: 'https://cdn-icons-png.flaticon.com/512/6362/6362942.png',
        dustHaze: 'https://cdn-icons-png.flaticon.com/512/3722/3722653.png',
        landslides: 'https://cdn-icons-png.flaticon.com/512/3722/3722653.png',
        manmade: 'https://cdn-icons-png.flaticon.com/512/3722/3722653.png',
        tempExtremes: 'https://cdn-icons-png.flaticon.com/512/3722/3722653.png',
        waterColor: 'https://cdn-icons-png.flaticon.com/512/3722/3722653.png',
    }

    let markers = {};
    const activeFilters = new Set();
    let eventsData = [];

    // Function to fetch and add events to the map
    function loadEvents() {
        console.log("Loading events...");
        $.getJSON("https://eonet.gsfc.nasa.gov/api/v3/events", { status: "open" })
            .done(function (data) {
                console.log("Datos completos:", data);
                eventsData = data.events;

                eventsData.forEach(event => {
                    if (event.geometry && event.geometry[0]) {
                        const coordinates = event.geometry[0].coordinates;
                        const category = event.categories[0].id;
                        const iconUrl = categoryIcons[category] || '';

                        const markerElement = document.createElement('div');
                        markerElement.className = 'custom-marker';
                        markerElement.style.backgroundImage = `url(${iconUrl})`;
                        markerElement.style.width = '30px';
                        markerElement.style.height = '30px';
                        markerElement.style.backgroundSize = 'cover';

                        const popupContent = `
                            <h3>${event.title}</h3>
                            <a href="${event.link}" target="_blank">More info</a>
                        `;

                        const popup = new maptilersdk.Popup({ offset: 25 })
                            .setHTML(popupContent);

                        const marker = new maptilersdk.Marker({
                            element: markerElement
                        })
                            .setLngLat(coordinates)
                            .setPopup(popup);

                        if (!markers[category]) {
                            markers[category] = [];
                        }
                        markers[category].push(marker);

                        // Add marker to map initially if filters match
                        if (activeFilters.size === 0 || activeFilters.has(category)) {
                            marker.addTo(map);
                        }
                    } else {
                        console.log("No hay coordenadas disponibles para el evento: " + event.id);
                    }
                });
                console.log("Markers loaded:", markers);
            })
            .fail(function (jqxhr, textStatus, error) {
                console.error("Request Failed: " + textStatus + ", " + error);
            });
    }

    // Function to update marker visibility based on filters
    function updateMarkers() {
        console.log("Updating markers. Active filters:", Array.from(activeFilters));
        Object.keys(markers).forEach(category => {
            markers[category].forEach(marker => {
                if (activeFilters.size === 0 || activeFilters.has(category)) {
                    console.log(`Showing marker for category: ${category}`);
                    marker.addTo(map);
                } else {
                    console.log(`Hiding marker for category: ${category}`);
                    marker.remove();
                }
            });
        });
    }

    // Function to apply date filters
    function applyDateFilter() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (startDate && endDate) {
            console.log(`Applying date filter: ${startDate} to ${endDate}`);
            const filteredEvents = eventsData.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
            });

            // Clear current markers
            Object.values(markers).flat().forEach(marker => marker.remove());

            // Re-add markers with the date filter applied
            markers = {};
            filteredEvents.forEach(event => {
                if (event.geometry && event.geometry[0]) {
                    const coordinates = event.geometry[0].coordinates;
                    const category = event.categories[0].id;
                    const iconUrl = categoryIcons[category] || '';

                    const markerElement = document.createElement('div');
                    markerElement.className = 'custom-marker';
                    markerElement.style.backgroundImage = `url(${iconUrl})`;
                    markerElement.style.width = '30px';
                    markerElement.style.height = '30px';
                    markerElement.style.backgroundSize = 'cover';

                    const popupContent = `
                        <h3>${event.title}</h3>
                        <a href="${event.link}" target="_blank">More info</a>
                    `;

                    const popup = new maptilersdk.Popup({ offset: 25 })
                        .setHTML(popupContent);

                    const marker = new maptilersdk.Marker({
                        element: markerElement
                    })
                        .setLngLat(coordinates)
                        .setPopup(popup);

                    if (!markers[category]) {
                        markers[category] = [];
                    }
                    markers[category].push(marker);

                    // Add marker to map
                    marker.addTo(map);
                }
            });
        } else {
            console.log("No date range selected");
        }
    }

    // Event listener for filter buttons
    $('.filter-buttons button').on('click', function () {
        const category = this.id.replace('filter-', '');
        console.log(`Button clicked: ${category}`);

        if (category === 'clear') {
            activeFilters.clear();
            $('.filter-buttons button').removeClass('active');
        } else {
            if (activeFilters.has(category)) {
                activeFilters.delete(category);
                $(this).removeClass('active');
            } else {
                activeFilters.add(category);
                $(this).addClass('active');
            }
        }

        console.log("Active filters after button click:", Array.from(activeFilters));
        updateMarkers();
    });

    // Event listener for date filter button
    document.getElementById('apply-date-filter').addEventListener('click', applyDateFilter);

    loadEvents();
});
