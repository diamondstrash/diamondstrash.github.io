document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('gaugeCanvas');
    const ctx = canvas.getContext('2d');
    const loadingMessage = document.getElementById('loadingMessage');
    const url = "https://api.thingspeak.com/channels/2558267/fields/1.json?api_key=A774R4UYPD6JMSL8&results=1";

    function drawGauge(value) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;
        const startAngle = 0.75 * Math.PI; // 135 degrees
        const endAngle = 2.25 * Math.PI; // 405 degrees
        const currentAngle = startAngle + (value / 100) * (endAngle - startAngle); // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#eee';
    ctx.stroke();

    // Draw the foreground arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, currentAngle, false);
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#2e7d32';
    ctx.stroke();

    // Draw the text
    ctx.font = '24px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${value}%`, centerX, centerY);
}

function updateGauge() {
    // Show loading message initially
    loadingMessage.style.display = 'block';
    canvas.style.display = 'none';

    // Fetch the data from ThingSpeak
    $.getJSON(url, function (data) {
        var field1Values = [];
        $.each(data.feeds, function (index, feed) {
            field1Values.push(feed.field1);
        });

        // Ensure the data is loaded before drawing the gauge
        if (field1Values.length > 0 && field1Values[0] !== null) {
            const chargePer = parseFloat(field1Values[0]);
            drawGauge(chargePer);
            // Hide loading message and show canvas
            loadingMessage.style.display = 'none';
            canvas.style.display = 'block';
        } else {
            console.error('No data received from ThingSpeak');
            loadingMessage.innerText = 'Chargement en cours, veuillez patienter...';
        }
    }).fail(function () {
        console.error('Failed to fetch data from ThingSpeak');
        loadingMessage.innerText = 'Chargement en cours, veuillez patienter...';
    });
}

// Function to refresh iframes
function refreshIframes() {
    $('iframe').each(function () {
        const src = $(this).attr('src');
        $(this).attr('src', src);
    });
}

// Initial update
updateGauge();

// Update the gauge and refresh iframes every 30 seconds
setInterval(() => {
    updateGauge();
    refreshIframes();
}, 30000);

// Toggle iframes visibility
$('.toggleBar').click(function () {
    const target = $(this).data('target');
    $(target).toggle();
    const buttonText = $(target).is(':visible') ? '-' : '+';
    $(this).find('span').last().text(buttonText);
});
});