function getMainCanvas() {
    const canvas = document.getElementById('canvas')
    const ctx = canvas.getContext('2d')
    return ctx
}

function drawPixel(ctx, x, y, r, g, b) {
    ctx.fillStyle = "rgb("+r+","+g+","+b+")";
    ctx.fillRect(x, y, 1, 1);
}

function remap(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function onResize() {
    var ctx = getMainCanvas()
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    render()
}

function onLoad() {
    window.addEventListener("resize", onResize)
    onResize()
}