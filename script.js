$(document).foundation();

$(document).ready(function () {
    $('.card').each(function (i) {
        $(this).delay(200 * i).fadeIn(500);
    });

    $('.button').hover(
        function () {
            $(this).addClass('hover')
        },
        function () {
            $(this).removeClass('hover')
        }
    );
});