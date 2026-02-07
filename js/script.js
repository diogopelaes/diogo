$(document).ready(function () {
    // 1. Generate Line Numbers based on the number of .line elements
    const lineCount = $('.code-lines .line').length;
    let lineNumbersHtml = '';

    for (let i = 1; i <= lineCount; i++) {
        lineNumbersHtml += `<span class="line-number">${i}</span>`;
    }

    $('.line-numbers').html(lineNumbersHtml);

    // 2. Status Bar "Cursor" position simulation
    // Since lines are static divs, we can't truly track cursor, but we can simulate hover logic or just leave it static.
    // Let's make it a bit interactive on hover.

    $('.line').hover(function () {
        // Get line index (1-based)
        const index = $(this).index() + 1;
        // Update status bar
        $('.status-item:contains("Ln")').text(`Ln ${index}, Col 1`);

        // Highlight line number
        $('.line-number').css('color', '');
        $('.line-number').eq(index - 1).css('color', '#fff');
    }, function () {
        // Reset (optional)
    });

    // 3. Simple Tab Logic (Visual Only for now as there is only one file)
    $('.tab').click(function () {
        $('.tab').removeClass('active');
        $(this).addClass('active');
    });

    // 4. Sidebar Toggle (Mobile Friendly)
    // Maybe add a hamburger menu logic later if requested.

    console.log("IDE Loaded successfully.");
});