var zoom = 3
var p1 = 1
var p2 = 10

function d(x,y) {
    return Math.sqrt(x*x + y*y)
}

function f(x, y) {
    return 2/(1 + Math.exp(-p1*(d(x,y)-p2))) -1
}

function eq1(x, y) {
    return Math.round(Math.cos(zoom*(x+y)) + Math.cos(zoom*(x-y)) + f(x, y)) < 0
}

function render(drawContext) {
    const ctx = drawContext.ctx

    var xMin = -10
    var xMax = 10
    var yMin = -10
    var yMax = 10

    var xPixelOffset = ctx.canvas.width/2
    var yPixelOffset = ctx.canvas.height/2

    var shortestDim = Math.min(ctx.canvas.width, ctx.canvas.height)

    var sections = drawContext.sections
    var sectionsDrawn = 0

    //console.time("draw")

    p1 = drawContext.variables.p1
    p2 = drawContext.variables.p2

    // Speed up for development
    //drawContext.isMoving = true

    sections.forEach((section) => {

        //setTimeout(() => {

            const xLo = section.xMin
            const xHi = section.xMax
            const yLo = section.yMin
            const yHi = section.yMax
            const xStep = drawContext.isMoving ? 15 : 1
            const yStep = drawContext.isMoving ? 15 : 1

            for (var xPixel = xLo; xPixel < xHi; xPixel += xStep) {
                for (var yPixel = yLo; yPixel < yHi; yPixel += yStep) {
                    var x = remap(xPixel-xPixelOffset, 0, shortestDim, xMin, xMax)
                    var y = remap(yPixel+yPixelOffset, 0, shortestDim, yMin, yMax)

                    if (eq1(x, y)) {
                        drawBlackPixel(ctx, xPixel, yPixel)
                    } else {
                        drawWhitePixel(ctx, xPixel, yPixel)
                    }
                }
            }

            sectionsDrawn += 1

            if (sectionsDrawn == sections.length) {
                //console.timeEnd("draw")
                drawContext.drawEnd()
            }
        //})

    })

    return true
}


function onLoad() {
    const renderer = createRenderer("canvas")
    renderer.registerDraw(render)
    renderer.start()

    const controls = document.getElementById("dynamic-sliders")

    const p1Slider = createVariableSlider("p1", -50, 50, 0.001, 1)
    controls.appendChild(p1Slider.element)
    renderer.registerVariableControl(p1Slider)

    const p2Slider = createVariableSlider("p2", -50, 50, 0.001, 10)
    controls.appendChild(p2Slider.element)
    renderer.registerVariableControl(p2Slider)
}