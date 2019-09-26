import { createCanvas } from 'canvas'
import ffmpeg from 'fluent-ffmpeg'
const canvas = createCanvas(320, 200)
const ctx = canvas.getContext("2d")
import { debounce } from 'lodash'
import { getCurrentColor } from './state';
function Point3D(x,y,z) {
  this.x = x;
  this.y = y;
  this.z = z;

  this.rotateX = function(angle) {
    var rad, cosa, sina, y, z
    rad = angle * Math.PI / 180
    cosa = Math.cos(rad)
    sina = Math.sin(rad)
    y = this.y * cosa - this.z * sina
    z = this.y * sina + this.z * cosa
    return new Point3D(this.x, y, z)
  }

  this.rotateY = function(angle) {
    var rad, cosa, sina, x, z
    rad = angle * Math.PI / 180
    cosa = Math.cos(rad)
    sina = Math.sin(rad)
    z = this.z * cosa - this.x * sina
    x = this.z * sina + this.x * cosa
    return new Point3D(x,this.y, z)
  }

  this.rotateZ = function(angle) {
    var rad, cosa, sina, x, y
    rad = angle * Math.PI / 180
    cosa = Math.cos(rad)
    sina = Math.sin(rad)
    x = this.x * cosa - this.y * sina
    y = this.x * sina + this.y * cosa
    return new Point3D(x, y, this.z)
  }

  this.project = function(viewWidth, viewHeight, fov, viewDistance) {
    var factor, x, y
    factor = fov / (viewDistance + this.z)
    x = this.x * factor + viewWidth / 2
    y = this.y * factor + viewHeight / 2
    return new Point3D(x, y, this.z)
  }
}

var vertices = [
  new Point3D(-1,1,-1),
  new Point3D(1,1,-1),
  new Point3D(1,-1,-1),
  new Point3D(-1,-1,-1),
  new Point3D(-1,1,1),
  new Point3D(1,1,1),
  new Point3D(1,-1,1),
  new Point3D(-1,-1,1)
];

// Define the vertices that compose each of the 6 faces. These numbers are
// indices to the vertex list defined above.
var faces = [[0,1,2,3],[1,5,6,2],[5,4,7,6],[4,0,3,7],[0,4,5,1],[3,2,6,7]]

var angle = 0;

const FRAME_RATE = 30

let lastFrame = new Date().getTime()
function loop() {
  const frameTime = new Date().getTime()
  const delta = frameTime - lastFrame
  var t = [];

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 320, 200);

  for (var i = 0; i < vertices.length; i++) {
    var v = vertices[i];
    var r = v.rotateX(angle).rotateY(angle).rotateZ(angle);
    var p = r.project(320, 200, 128, 3.5);
    t.push(p)
  }

  ctx.strokeStyle = getCurrentColor()

  for (var i = 0; i < faces.length; i++) {
    var f = faces[i]
    ctx.beginPath()
    ctx.moveTo(t[f[0]].x, t[f[0]].y)
    ctx.lineTo(t[f[1]].x, t[f[1]].y)
    ctx.lineTo(t[f[2]].x, t[f[2]].y)
    ctx.lineTo(t[f[3]].x, t[f[3]].y)
    ctx.closePath()
    ctx.stroke()
  }
  angle += delta * (2 / (1000 / FRAME_RATE))

  lastFrame = frameTime
}

setInterval(loop,10);
loop()


const { Converter } = require("ffmpeg-stream")

const converter = new Converter()

const minResolveWait = (fn, time) => {
  let resolved, doneArgs, waited = false
  setTimeout(() => {
    if (resolved) {
      fn(...doneArgs)
    } else {
      waited = true
    }
  }, time)
  return function (...args) {
    if (waited) {
      return fn(...args)
    }
    resolved = true
    doneArgs = args
  }
}

const sim = async (context, next) => {

  context.status  = 200
  const { Converter } = require("ffmpeg-stream")


  const converter = new Converter() // create converter

// create input writable stream
  const input = converter.createInputStream({ f: "image2pipe", r: 60 })
// output to file


  const nextFrame = () => {
    const next = minResolveWait(nextFrame, Math.ceil(1000/ 60))
    canvas
      .createJPEGStream()
      .on("end", next)
      // .on("error", reject)
      // pipe to converter, but don't end the input yet
      .pipe(
        input,
        { end: false },
      )
  }

  nextFrame()

  context.req.on('end', function() {
    input.end()
  });

  context.status  = 200

  context.set({
    'Date': new Date().toUTCString(),
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Content-Type': 'video/mp4',
  });

  const outstream = converter.createOutputStream({ movflags: 'frag_keyframe+empty_moov', f: "mp4", vcodec: "libx264", pix_fmt: "yuv420p" })
    .on('end', function() {
      console.log('file has been converted succesfully');
    })
    .on('error', function(err) {
      console.log(err.message);
    })


  context.body = outstream
  converter.run()
}

export default sim
