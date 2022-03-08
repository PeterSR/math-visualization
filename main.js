


let cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 }
let cameraZoom = 1
let MAX_ZOOM = 5
let MIN_ZOOM = 0.1
let SCROLL_SENSITIVITY = 0.0005

function d(x,y) {
    return Math.sqrt(x*x + y*y)
}

function f(x, y) {
    var p1 = 1
    var p2 = 10
    return 2/(1 + Math.exp(-p1*(d(x,y)-p2))) -1
}

function eq1(x, y) {
    var zoom = 3
    return Math.round(Math.cos(zoom*(x+y)) + Math.cos(zoom*(x-y)) + f(x, y)) < 0
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

    var p = new Parallel(computeSections(ctx.canvas.width, ctx.canvas.height, 16, 12), {
        env: {
            ctx: ctx,
            drawPixel: drawPixel,
            remap, remap,
            xMin: xMin,
            xMax: xMax,
            xPixelOffset: xPixelOffset,
            yMin: yMin,
            yMax: yMax,
            yPixelOffset: yPixelOffset,
            shortestDim: shortestDim,
        },
        envNamespace: 'parallel'
    })

    function renderSection(section) {
        const {
            xMin,
            xMax,
            xPixelOffset,
            yMin,
            yMax,
            yPixelOffset,
            shortestDim,
        } = global.parallel;

        pixels = []
        for (let xPixel = section.xMin; xPixel < section.xMax; xPixel++) {
            for (let yPixel = section.yMin; yPixel < section.yMax; yPixel++) {
                const x = remap(xPixel-xPixelOffset, 0, shortestDim, xMin, xMax)
                const y = remap(yPixel+yPixelOffset, 0, shortestDim, yMin, yMax)
                if (eq1(x, y)) {
                    pixels.push([xPixel, yPixel, 0, 0, 0])
                } else {
                    pixels.push([xPixel, yPixel, 255, 255, 255])
                }
            }
        }
        return pixels
    };
    function drawSection(results) {
        results.forEach((pixels) => {
            pixels.forEach((pixel) => {
                drawPixel(ctx, pixel[0], pixel[1], pixel[2], pixel[3], pixel[4])
            })
        })
        console.timeEnd("parallel")
    }
    p.require(getMainCanvas)
    p.require(drawPixel)
    p.require(remap)
    p.require(eq1)
    p.require(f)
    p.require(d)

    console.time("parallel")
    p.map(renderSection).then(drawSection)

    console.time("traditional")

        /*
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
    */

    console.timeEnd("traditional")

}