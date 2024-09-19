addEventListener("DOMContentLoaded", (event) => {
    maptilersdk.config.apiKey = 'mmY6XO6W7RcdUkdHirOn';
    const map = new maptilersdk.Map({
    container: 'map', // container's id or the HTML element in which the SDK will render the map
    style: maptilersdk.MapStyle.STREETS,
    center: [-3.990431192947985, 39.51263816088107], // starting position [lng, lat]
    zoom: 5 // starting zoom
    });

    // const marker = new maptilersdk.Marker()
    // .setLngLat([30.5, 50.5])
    // .addTo(map);

    $(document).ready(function() {
        $.getJSON("https://eonet.gsfc.nasa.gov/api/v3/events", {
        status: "open",
        limit: 10
        })
        .done(function(data) {
        console.log("Datos completos:", data); // Imprime los datos completos en la consola
        $.each(data.events, function(key, event) {
        console.log("Evento:", event); // Imprime cada evento en la consola
        
        // Asegúrate de que el evento tenga geometría y que haya al menos un objeto en la lista de geometría
        if (event.geometry && event.geometry[0]) {
        const coordinates = event.geometry[0].coordinates; // Obtén las coordenadas
        console.log("Coordenadas: " + coordinates);
        
        // Añade un marcador en el mapa usando MapTiler
        const marker = new maptilersdk.Marker()
        .setLngLat(coordinates) // Usa las coordenadas del evento
        .addTo(map); // Agrega el marcador al mapa
        } else {
        console.log("No hay coordenadas disponibles para el evento: " + event.id);
        }
        });
        })
        .fail(function(jqxhr, textStatus, error) {
        console.error("Request Failed: " + textStatus + ", " + error);
        });
    });
        
        
    
    
    
});

