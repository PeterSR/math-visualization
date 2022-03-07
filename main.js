function f(x, y) {
    return 0
}

function eq1(x, y) {
    return Math.round(Math.cos(x) + Math.cos(y) + f(x, y)) < 0
}

function render() {
    var ctx = getMainCanvas()
    ctx.scale(10, 10)

    for (var x = 0; x < canvas.clientWidth; x++) {
        for (var y = 0; y < canvas.clientHeight; y++) {
            if (eq1(x, y)) {
                drawPixel(ctx, x, y, 0, 0, 0)
            } else {
                drawPixel(ctx, x, y, 255, 255, 255)
            }
        }
    }
}