function drawPixelFactory(r, g, b) {
    const fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    return function(ctx, x, y) {
        ctx.fillStyle = fillStyle;
        ctx.fillRect(x, y, 1, 1);
    }
}

const drawBlackPixel = drawPixelFactory(0, 0, 0)
const drawWhitePixel = drawPixelFactory(255, 255, 255)

function drawPixel(ctx, x, y, r, g, b) {
    ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    ctx.fillRect(x, y, 1, 1);
}

function resetTransform(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
}

function remap(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function almostEqual(v1, v2, epsilon) {
    if (epsilon == null) {
        epsilon = 0.001
    }
    return Math.abs(v1 - v2) < epsilon
}

function computeSections(width, height, xChunks, yChunks) {
    if (xChunks == null) {
        xChunks = 1
    }
    if (yChunks == null) {
        yChunks = 1
    }

    const sections = []

    const xJump = Math.floor(width / xChunks)
    const yJump = Math.floor(height / yChunks)

    for (var xPixel = 0; xPixel < width; xPixel += xJump) {
        for (var yPixel = 0; yPixel < height; yPixel += yJump) {
            section = {
                xMin: xPixel,
                xMax: Math.min(xPixel + xJump, width),
                yMin: yPixel,
                yMax: Math.min(yPixel + yJump, height),
            }
            sections.push(section)
        }
    }

    return sections
}


// ---

function createRenderer(canvas) {
    if (typeof canvas === "string") {
        canvas = document.getElementById(canvas)
    }

    const offScreenCanvas = document.createElement('canvas');

    // Variables
    const ctx = canvas.getContext('2d')
    const offScreenCtx = offScreenCanvas.getContext('2d')

    let drawFunc = null

    let pointer = {
        x: 0,
        y: 0,
    }
    let camera = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        zoom: 1,
    }
    let MAX_ZOOM = 5
    let MIN_ZOOM = 0.1
    let SCROLL_SENSITIVITY = 0.0005

    let isMoving = false
    let isZooming = false
    let isZoomingDebounceId = null
    let isZoomingDebounceTime = 1000
    let isDragging = false
    let dragStart = { x: 0, y: 0 }
    let initialPinchDistance = null
    let lastZoom = camera.zoom
    let waitingForFrame = false

    let drawContext = {
        ctx: offScreenCtx,
        camera: camera,
        sections: [],
        isMoving: false,
        drawEnd: drawEnd,
    }

    // API functions
    function start() {
        mainRender()
    }

    function registerDraw(fn) {
        drawFunc = fn
    }

    // Private functions
    function mainRender() {
        if (!canvasHasCorrectSize()) {
            resizeCanvas()
        }

        isMoving = isDragging || isZooming

        if (isMoving) {
            waitingForFrame = false
        }

        if (!waitingForFrame) {
            waitingForFrame = true
            setTimeout(() => {
                drawContext.isMoving = isMoving
                drawContext.ctx.clearRect(0, 0, canvas.width, canvas.height)

                drawContext.ctx.save()
                drawContext.ctx.translate(canvas.width / 2, canvas.height / 2)
                drawContext.ctx.scale(camera.zoom, camera.zoom)
                drawContext.ctx.translate(-canvas.width / 2 + camera.x, -canvas.height / 2 + camera.y)

                //drawAxes(drawContext.ctx)

                if (drawFunc) {
                    drawFunc(drawContext)
                }

                drawContext.ctx.restore()
            })
        }

        requestAnimationFrame(mainRender)
    }

    function drawAxes(ctx) {
        ctx.lineWidth = 1 * camera.zoom;
        ctx.strokeStyle = 'black';
        ctx.beginPath()
        ctx.moveTo(-canvas.width / 2 - camera.x, 0)
        ctx.lineTo(ctx.canvas.width / 2 + camera.x, 0)
        ctx.stroke()
    }

    function drawEnd() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(offScreenCanvas, 0, 0)
        waitingForFrame = false
    }

    // Helper functions
    function canvasHasCorrectSize() {
        return (canvas.width === window.innerWidth && canvas.height === window.innerHeight)
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        offScreenCanvas.width = canvas.width
        offScreenCanvas.height = canvas.height

        drawContext.sections = computeSections(canvas.width, canvas.height, 16, 12)
    }

    function getEventLocation(e) {
        if (e.touches && e.touches.length == 1) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY }
        } else if (e.clientX && e.clientY) {
            return { x: e.clientX, y: e.clientY }
        } else {
            // Fallback values
            return { x: dragStart.x, y: dragStart.y }
        }
    }

    function onPointerDown(e) {
        isDragging = true
        const loc = getEventLocation(e)
        dragStart.x = loc.x / camera.zoom - camera.x
        dragStart.y = loc.y / camera.zoom - camera.y
    }

    function onPointerUp(e) {
        isDragging = false
        initialPinchDistance = null
        lastZoom = camera.zoom
    }

    function onPointerMove(e) {
        const loc = getEventLocation(e)
        pointer.x = loc.x
        pointer.y = loc.y
        if (isDragging) {
            camera.x = loc.x / camera.zoom - dragStart.x
            camera.y = loc.y / camera.zoom - dragStart.y
        }
    }

    function handleTouch(e, singleTouchHandler) {
        if (e.touches.length == 1) {
            singleTouchHandler(e)
        } else if (e.type == "touchmove" && e.touches.length == 2) {
            isDragging = false
            handlePinch(e)
        }
    }

    function handlePinch(e) {
        e.preventDefault()

        let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }

        // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
        let currentDistance = (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2

        if (initialPinchDistance == null) {
            initialPinchDistance = currentDistance
        } else {
            adjustZoom(null, currentDistance / initialPinchDistance)
        }
    }

    function adjustZoom(zoomAmount, zoomFactor) {
        if (!isDragging) {
            if (zoomAmount) {
                camera.zoom += zoomAmount
            } else if (zoomFactor) {
                camera.zoom = zoomFactor * lastZoom
            }

            camera.zoom = Math.min(camera.zoom, MAX_ZOOM)
            camera.zoom = Math.max(camera.zoom, MIN_ZOOM)

            isZooming = true

            clearTimeout(isZoomingDebounceId)

            isZoomingDebounceId = setTimeout(() => {
                isZooming = false
            }, isZoomingDebounceTime)
        }
    }

    canvas.addEventListener('mousedown', onPointerDown)
    canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
    canvas.addEventListener('mouseup', onPointerUp)
    canvas.addEventListener('touchend', (e) => handleTouch(e, onPointerUp))
    canvas.addEventListener('mousemove', onPointerMove)
    canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
    canvas.addEventListener('wheel', (e) => adjustZoom(-e.deltaY * SCROLL_SENSITIVITY))


    return {
        start: start,
        registerDraw: registerDraw,
    }
}