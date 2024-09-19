document.addEventListener("DOMContentLoaded", () => {
    let dateFilterActive = false;

    // Codigo API para el mapa (maptiler)
    maptilersdk.config.apiKey = 'mmY6XO6W7RcdUkdHirOn';
    const map = new maptilersdk.Map({
        container: 'map',
        style: maptilersdk.MapStyle.STREETS,
        center: [-3.990431192947985, 39.51263816088107],
        zoom: 5
    });

    // Categorias y sus iconos
    const categoryIcons = {
        wildfires: 'https://cdn-icons-png.flaticon.com/512/1453/1453025.png',
        volcanoes: 'https://cdn-icons-png.flaticon.com/512/3095/3095247.png',
        earthquakes: 'https://cdn-icons-png.flaticon.com/512/3242/3242697.png',
        floods: 'https://cdn-icons-png.flaticon.com/512/1467/1467452.png',
        severeStorms: 'https://cdn-icons-png.flaticon.com/512/10344/10344651.png',
        snow: 'https://cdn-icons-png.flaticon.com/512/6635/6635320.png',
        seaLakeIce: 'https://cdn-icons-png.flaticon.com/512/6362/6362942.png',
        dustHaze: 'https://cdn-icons-png.flaticon.com/512/1808/1808388.png',
        landslides: 'https://cdn-icons-png.flaticon.com/512/1066/1066221.png',
        manmade: 'https://cdn-icons-png.flaticon.com/512/1685/1685897.png',
        tempExtremes: 'https://cdn-icons-png.flaticon.com/512/5847/5847577.png',
        waterColor: 'https://cdn-icons-png.flaticon.com/512/4150/4150897.png',
    }

    let markers = {};
    const activeFilters = new Set();
    let eventsData = [];

    // Funcion para cargar los eventos y situarlos en el mapa (API de EONET + Add Marker de maptiler sdk)
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

    // Actualizar la visibilidad del evento según el filtro seleccionado
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

    // Aplicar filtro de fecha
    function applyDateFilter() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
    
        if (startDate && endDate) {
            console.log(`Applying date filter: ${startDate} to ${endDate}`);
            dateFilterActive = true;
    
            // Filtrar eventos usando las fechas correctas
            const filteredEvents = eventsData.filter(event => {
                if (event.geometry && event.geometry[0].date) {
                    const eventDate = new Date(event.geometry[0].date);
                    return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
                }
                return false;
            });
    
            // Limpiar marcadores actuales
            Object.values(markers).flat().forEach(marker => marker.remove());
    
            // Reagregar solo los eventos filtrados
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
    
                    // Agregar marcador al mapa
                    marker.addTo(map);
                }
            });
        } else {
            console.log("No date range selected");
        }
    }
    
    

    // Botones de filtro
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

    // Boton para quitar el filtro de fecha
    document.getElementById('clear-date-filter').addEventListener('click', function() {
        // Limpiar los campos de fecha
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
    
        // Desactivar el estado del filtro de fechas
        dateFilterActive = false;
    
        // Volver a mostrar todos los eventos
        console.log("Limpiando filtro de fechas");
    
        // Limpiar marcadores actuales
        Object.values(markers).flat().forEach(marker => marker.remove());
    
        // Reagregar todos los eventos
        markers = {};
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
    
                // Agregar marcador al mapa
                marker.addTo(map);
            }
        });
    });
    
    // Boton para aplicar el filtro de fecha
    document.getElementById('apply-date-filter').addEventListener('click', applyDateFilter);

    loadEvents();

     // Seleccionamos el botón y el contenedor desplegable
     const toggleButton = document.getElementById('toggle-button');
     const desplegable = document.getElementById('desplegable');

     // Agregamos el evento de clic al botón
     toggleButton.addEventListener('click', function() {
         // Verificamos si el desplegable está visible
         if (desplegable.style.display === 'none' || desplegable.style.display === '') {
             // Si está oculto, lo mostramos
             desplegable.style.display = 'block';
         } else {
             // Si está visible, lo ocultamos
             desplegable.style.display = 'none';
         }
     });
});
