function f(x, y) {
    return 0
}

function eq1(x, y) {
    return Math.cos(x) + Math.cos(y) + f(x, y) < 0
}

function render() {
    var ctx = getMainCanvas()

    var xMin = -10
    var xMax = 10
    var yMin = -10
    var yMax = 10

    var xPixelOffset = ctx.canvas.width/2
    var yPixelOffset = ctx.canvas.height/2

    var shortestDim = Math.min(ctx.canvas.width, ctx.canvas.height)

    for (var xPixel = 0; xPixel < ctx.canvas.width; xPixel++) {
        for (var yPixel = 0; yPixel < ctx.canvas.height; yPixel++) {
            var x = remap(xPixel-xPixelOffset, 0, shortestDim, xMin, xMax)
            var y = remap(yPixel+yPixelOffset, 0, shortestDim, yMin, yMax)

            if (eq1(x, y)) {
                drawPixel(ctx, xPixel, yPixel, 0, 0, 0)
            } else {
                drawPixel(ctx, xPixel, yPixel, 255, 255, 255)
            }
        }
    }
}