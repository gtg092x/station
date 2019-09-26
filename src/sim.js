import canvas from './canvases/chase'

const { Converter } = require("ffmpeg-stream")

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
