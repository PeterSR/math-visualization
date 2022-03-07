function getMainCanvas() {
    const canvas = document.getElementById('canvas')
    const ctx = canvas.getContext('2d')
    return ctx
}

function drawPixel(ctx, x, y, r, g, b) {
    ctx.fillStyle = "rgb("+r+","+g+","+b+")";
    ctx.fillRect(x, y, 1, 1);
}

function onResize() {
    var ctx = getMainCanvas()
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}

function onLoad() {
    window.addEventListener("resize", onResize)
    onResize()

    render()
}