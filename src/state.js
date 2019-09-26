const state = {
  colorIndex: 1,
}

export const allColors = [
  'rgb(255,255,255)',
  'rgb(255,128,128)',
  'rgb(255,0,128)',
  'rgb(128,0,255)',
]

export const getCurrentColor = () => {
  return allColors[state.colorIndex]
}

export const nextColor = (ctx) => {
  ctx.status = 200
  state.colorIndex = (state.colorIndex + 1) % allColors.length
}

