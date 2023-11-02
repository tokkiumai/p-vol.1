let canvasWidth = 1024
let canvasHeight = 768
let pointSize = 16
let halfPointSize = pointSize * 0.5
let sinIncrement = 0.005

let mainColor = '#ffffff'
let controlColor = '#2ef8a0'
let helper2Color = '#c501e2'
let helper3Color = '#4697ff'

let birdThreshold = 0.5
let cnsWorker = document.createElement('canvas')!
let ctxWorker = cnsWorker.getContext('2d')!
cnsWorker.width = canvasWidth
cnsWorker.height = canvasHeight

let canvas = document.createElement('canvas')!
let ctx = canvas.getContext('2d')!
canvas.width = canvasWidth
canvas.height = canvasHeight

// appendChild(canvas)
// addEventListener(mousemove, handleMouseMove, false)

let mousePos = { x: 0, y: 0 }
let birds = [
  [
    {
      points: [
        [-2.75, 178.15],
        [-1.8, 109.81],
        [-1.39, 139.32],
        [-0.99, 182.42],
        [-0.88, 192.01],
        [-0.98, 156.06],
        [-2.18, 46.42],
        [-2.36, 99.47],
        [-2.75, 178.15]
      ],
      controls: [
        [-2.64, 153.41, -2.17, 107.21],
        [-1.68, 125.74, -1.45, 131.89],
        [-1.35, 185.59, -1.14, 192.46],
        [-0.97, 184.14, -0.9, 199.74],
        [-0.98, 174.86, -0.96, 163.09],
        [-0.33, 102.4, -2.15, 35.04],
        [-2.33, 58.61, -2.26, 83.47],
        [-2.47, 123.65, -2.75, 154.17]
      ],
      close: true,
      scale: 1
    },
    {
      points: [
        [-2.21, 44.8],
        [2.74, 25.69]
      ],
      controls: [[-2.34, 37.39, -3.02, 26.46]],
      close: false,
      scale: 1
    },
    {
      points: [
        [-1.18, 40.05],
        [0.11, 44.61]
      ],
      controls: [[-0.91, 17.92, -0.07, 38.83]],
      close: false,
      scale: 1
    }
  ],
  [
    {
      points: [
        [-2.87, 37.04],
        [-1.1, 187.09],
        [-1.1, 209.01],
        [-0.99, 221.79],
        [-1.1, 233.15],
        [-1.56, 204.0],
        [2.47, 159.82],
        [2.45, 137.51],
        [2.3, 134.31],
        [-2.87, 37.04]
      ],
      controls: [
        [0.15, 40.21, -0.81, 142.96],
        [-1.16, 198.52, -1.15, 209.62],
        [-1.06, 211.77, -0.99, 218.79],
        [-0.94, 226.67, -1.06, 230.32],
        [-1.23, 271.73, -1.53, 262.04],
        [-2.66, 138.63, 3.0, 70.21],
        [2.4, 171.02, 2.45, 151.72],
        [2.38, 131.31, 2.35, 147.55],
        [2.28, 118.08, 2.73, 58.47]
      ],
      close: true,
      scale: 0.8
    },
    {
      points: [
        [-0.92, 18.8],
        [0.08, 50.49]
      ],
      controls: [[-0.27, 15.71, 0.12, 33.8]],
      close: false,
      scale: 0.8
    }
  ]
]

function handleMouseMove(event: MouseEvent) {
  let rect = canvas.getBoundingClientRect()
  mousePos = {
    x: event.clientX - rect.x,
    y: event.clientY - rect.y
  }
}

function clickedPoint(p1: Point, p2: Point) {
  return (p1.x > p2.x - halfPointSize && p1.x < p2.x + halfPointSize && p1.y > p2.y - halfPointSize && p1.y < p2.y + halfPointSize)
}

function pointAlongLine(x1: number, y1: number, x2: number, y2: number, r: number) {
  return [r * x2 + (1 - r) * x1, r * y2 + (1 - r) * y1]
}

function getStaticImage(draw: Function): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    ctxWorker.clearRect(0, 0, canvasWidth, canvasHeight)
    draw(ctxWorker)
    let img = new Image()
    img.src = cnsWorker.toDataURL()
    img.onload = () => resolve(img)
    img.onerror = reject
  })
}

class Point {
  x = 0
  y = 0

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

class Control {
  points: Array<Point> = []

  constructor(p1: Point, p2: Point) {
    this.points = [p1, p2]
  }
}

class BezierCurve {
  points: Array<Point> = []
  control: { points: Array<Point> } | null = null
  dragPoint: number | null = null
  dragControl: number | null = null
  dragStart: Point | null = null
  sinValue = -Math.PI * 0.5
  birdImage: HTMLImageElement | null = null

  constructor(p1: Point, p2: Point, control: { points: Array<Point> }) {
    this.points = [p1, p2]
    this.control = control
    this.updateBirdImage()
  }

  updateBirdImage = async () => {
    this.birdImage = await getStaticImage((_ctx: CanvasRenderingContext2D) => {
      _ctx.strokeStyle = '#ffffff'
      _ctx.fillStyle = 'none'
      _ctx.lineWidth = 2
      let timeIncrement = 0.1
      let t = 0
      let bezierPoints = []
      while (t < 1) {
        bezierPoints.push(this.getPoint(t))
        t += timeIncrement
      }
      for (let i = 0; i < bezierPoints.length; i++) {
        let [x, y] = bezierPoints[i]
        if (Math.random() > birdThreshold) {
          let xFlip = Math.random() > 0.5 ? -1 : 1
          let birdScale = Math.random() * 0.2 + 0.3
          let bird = birds[Math.floor(Math.random() * birds.length)]
          bird.forEach(({ points, controls, close, scale }) => {
            let totalScale = birdScale * scale
            _ctx.beginPath()
            points.forEach(([angle, distance], i) => {
              let xx = x + Math.cos(angle) * distance * totalScale * xFlip
              let yy = y + Math.sin(angle) * distance * totalScale
              if (i == 0) {
                _ctx.moveTo(xx, yy)
              } else {
                let control = controls[i - 1]
                let [angle1, distance1, angle2, distance2] = control
                let x1 = x + Math.cos(angle1) * distance1 * totalScale * xFlip
                let y1 = y + Math.sin(angle1) * distance1 * totalScale
                let x2 = x + Math.cos(angle2) * distance2 * totalScale * xFlip
                let y2 = y + Math.sin(angle2) * distance2 * totalScale
                _ctx.bezierCurveTo(x1, y1, x2, y2, xx, yy)
              }
            })
            if (close) {
              _ctx.closePath()
            }
            _ctx.stroke()
          })
        }
      }
    })
  }

  getPoint = (t: number) => {
    let { x: point1X, y: point1Y } = this.points[0]
    let { x: point2X, y: point2Y } = this.points[1]
    let [p1, p2] = this.control!.points
    let { x: control1X, y: control1Y } = p1
    let { x: control2X, y: control2Y } = p2
    let [a1X, a1Y] = pointAlongLine(point1X, point1Y, control1X, control1Y, t)
    let [a2X, a2Y] = pointAlongLine(control1X, control1Y, control2X, control2Y, t)
    let [a3X, a3Y] = pointAlongLine(control2X, control2Y, point2X, point2Y, t)
    let [b1X, b1Y] = pointAlongLine(a1X, a1Y, a2X, a2Y, t)
    let [b2X, b2Y] = pointAlongLine(a2X, a2Y, a3X, a3Y, t)
    return pointAlongLine(b1X, b1Y, b2X, b2Y, t)
  }

  update = () => {
    ctx.lineWidth = 2
    this.sinValue += sinIncrement
    let t = 0.5 + Math.sin(this.sinValue) * 0.5
    if (this.birdImage) {
      ctx.drawImage(this.birdImage, 0, 0)
    }
    ctx.fillStyle = mainColor
    ctx.strokeStyle = 'none'
    let { x: point1X, y: point1Y } = this.points[0]
    let { x: point2X, y: point2Y } = this.points[1]
    if (this.dragPoint !== null) {
      let deltaX = mousePos.x - this.dragStart!.x
      let deltaY = mousePos.y - this.dragStart!.y
      if (this.dragPoint === 0) {
        point1X += deltaX
        point1Y += deltaY
      } else {
        point2X += deltaX
        point2Y += deltaY
      }
    }
    ctx.fillRect(point1X - halfPointSize, point1Y - halfPointSize, pointSize, pointSize)
    ctx.fillRect(point2X - halfPointSize, point2Y - halfPointSize, pointSize, pointSize)
    ctx.fillStyle = controlColor
    let [p1, p2] = this.control!.points
    let { x: control1X, y: control1Y } = p1
    let { x: control2X, y: control2Y } = p2
    if (this.dragControl !== null) {
      let deltaX = mousePos.x - this.dragStart!.x
      let deltaY = mousePos.y - this.dragStart!.y
      if (this.dragControl === 0) {
        control1X += deltaX
        control1Y += deltaY
      } else {
        control2X += deltaX
        control2Y += deltaY
      }
    }
    ctx.fillRect(control1X - halfPointSize, control1Y - halfPointSize, pointSize, pointSize)
    ctx.fillRect(control2X - halfPointSize, control2Y - halfPointSize, pointSize, pointSize)
    ctx.fillStyle = 'none'
    ctx.strokeStyle = mainColor
    ctx.beginPath()
    ctx.moveTo(point1X, point1Y)
    ctx.bezierCurveTo(control1X, control1Y, control2X, control2Y, point2X, point2Y)
    ctx.stroke()
    ctx.fillStyle = 'none'
    ctx.strokeStyle = controlColor
    ctx.beginPath()
    ctx.moveTo(point1X, point1Y)
    ctx.lineTo(control1X, control1Y)
    ctx.lineTo(control2X, control2Y)
    ctx.lineTo(point2X, point2Y)
    ctx.stroke()
    ctx.strokeStyle = helper2Color
    let [a1X, a1Y] = pointAlongLine(point1X, point1Y, control1X, control1Y, t)
    let [a2X, a2Y] = pointAlongLine(control1X, control1Y, control2X, control2Y, t)
    let [a3X, a3Y] = pointAlongLine(control2X, control2Y, point2X, point2Y, t)
    ctx.beginPath()
    ctx.moveTo(a1X, a1Y)
    ctx.lineTo(a2X, a2Y)
    ctx.lineTo(a3X, a3Y)
    ctx.stroke()
    ctx.strokeStyle = helper3Color
    let [b1X, b1Y] = pointAlongLine(a1X, a1Y, a2X, a2Y, t)
    let [b2X, b2Y] = pointAlongLine(a2X, a2Y, a3X, a3Y, t)
    ctx.beginPath()
    ctx.moveTo(b1X, b1Y)
    ctx.lineTo(b2X, b2Y)
    ctx.stroke()
    ctx.fillStyle = mainColor
    let [c1X, c1Y] = pointAlongLine(b1X, b1Y, b2X, b2Y, t)
    ctx.fillRect(c1X - 3, c1Y - 3, 6, 6)
  }

  onMouseDown = () => {
    for (let i = 0; i < this.points.length; i++) {
      let point = this.points[i]
      if (clickedPoint(mousePos, point)) {
        this.dragPoint = i
        this.dragStart = { x: mousePos.x, y: mousePos.y }
        this.birdImage = null
        break
      }
    }
    if (this.dragPoint !== null) {
      return
    }
    let [p1, p2] = this.control!.points
    if (clickedPoint(mousePos, p1)) {
      this.dragControl = 0
      this.dragStart = { x: mousePos.x, y: mousePos.y }
      this.birdImage = null
    } else if (clickedPoint(mousePos, p2)) {
      this.dragControl = 1
      this.dragStart = { x: mousePos.x, y: mousePos.y }
      this.birdImage = null
    }
  }

  onMouseUp = () => {
    if (this.dragPoint === null && this.dragControl === null) {
      return
    }
    let deltaX = mousePos.x - this.dragStart!.x
    let deltaY = mousePos.y - this.dragStart!.y
    if (this.dragPoint !== null) {
      let point = this.points[this.dragPoint]
      point.x += deltaX
      point.y += deltaY
      this.dragPoint = null
      this.dragStart = null
    } else {
      let point = this.control!.points[this.dragControl!]
      point.x += deltaX
      point.y += deltaY
      this.dragControl = null
      this.dragStart = null
    }
    this.updateBirdImage()
  }
}

class DrawingHelper {
  bezier = new BezierCurve(new Point(halfPointSize, canvasHeight * 0.5), new Point(canvasWidth - halfPointSize, canvasHeight * 0.5), new Control(new Point(256, 128), new Point(canvasWidth - 256, canvasHeight - 128)))

  constructor() {
    // addEventListener(mousedown, this.handleMouseDown, false)
    // addEventListener(mouseup, this.handleMouseUp, false)
  }

  handleMouseDown = () => {
    this.bezier.onMouseDown()
  }

  handleMouseUp = () => {
    this.bezier.onMouseUp()
  }

  update = () => {
    try {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      this.bezier.update()
    } catch (err) {
      // MainLoop.stop()
      console.warn('update failed, ', err)
    }
  }
}

new DrawingHelper()
