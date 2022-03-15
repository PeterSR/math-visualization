var zoom = 3
var p1 = 1
var p2 = 10
var drawing = false

function d(x,y) {
    return Math.sqrt(x*x + y*y)
}

function f(x, y) {
    return 2/(1 + Math.exp(-p1*(d(x,y)-p2))) -1
}

function eq1(x, y) {
    return Math.round(Math.cos(zoom*(x+y)) + Math.cos(zoom*(x-y)) + f(x, y)) < 0
}

function render() {
    if (drawing) {
        return
    }

    var ctx = getMainCanvas()

    var xMin = -10
    var xMax = 10
    var yMin = -10
    var yMax = 10

    var xPixelOffset = ctx.canvas.width/2
    var yPixelOffset = ctx.canvas.height/2

    var shortestDim = Math.min(ctx.canvas.width, ctx.canvas.height)

    var sections = computeSections(ctx.canvas.width, ctx.canvas.height, 16, 12)
    var sectionsDrawn = 0

    drawing = true
    console.time("draw")

    sections.forEach((section) => {

        setTimeout(() => {

            const xLo = section.xMin
            const xHi = section.xMax
            const yLo = section.yMin
            const yHi = section.yMax
            const xStep = 1
            const yStep = 1

            for (var xPixel = xLo; xPixel < xHi; xPixel += xStep) {
                for (var yPixel = yLo; yPixel < yHi; yPixel += yStep) {
                    var x = remap(xPixel-xPixelOffset, 0, shortestDim, xMin, xMax)
                    var y = remap(yPixel+yPixelOffset, 0, shortestDim, yMin, yMax)

                    if (eq1(x, y)) {
                        drawPixel(ctx, xPixel, yPixel, 0, 0, 0)
                    } else {
                        drawPixel(ctx, xPixel, yPixel, 255, 255, 255)
                    }
                }
            }

            sectionsDrawn += 1

            if (sectionsDrawn == sections.length) {
                console.timeEnd("draw")
                drawing = false
            }
        })

    })

}