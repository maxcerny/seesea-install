function max_getData(eventId) {
    $.get(`https://seesea.maxcerny.eu/event.php?eventId=${eventId}`, function (responseEvent) {
        $.get(`https://seesea.maxcerny.eu/data.php?eventId=${eventId}`, function (responseData) {
            // console.log(responseEvent)
            // console.log(responseData)

            let event = new Event(responseEvent, responseData)

            // console.log(event)

            $("#main_table").html(event.generateBoatTableHTML())
            $("#header").html(event.generateHeaderHTML())
        })
    })
}

$(document).ready(function () {
    let repeat = true
    function getUrlParameter(sParam) {
        let sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
        return false;
    }

    console.log(getUrlParameter('single'))
    if (getUrlParameter('single') === 'true') repeat = false
    // first run to get data instantly
    max_getData(getUrlParameter('eventId'))
    // repeat every 5 seconds
    if (repeat) {
        setInterval(function () {
            max_getData(getUrlParameter('eventId'))
        }, 5000)
    }
})