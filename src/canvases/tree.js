import { createCanvas } from 'canvas';

/**
 * Tree in the breeze
 *
 * @author clockmaker
 * @see http://clockmaker.jp/blog/
 *
 * forked from wonderfl
 * http://wonderfl.net/c/9KQy/
 */
// -----------------------------------------
// 定数
// -----------------------------------------

var FPS = 30; // フレームレート
var INTERVAL_SEC = 1000 / FPS >> 0; // インターバル時間

// -----------------------------------------
// 初期化
// -----------------------------------------

// 変数の初期化
const canvas = createCanvas(464, 464)
var context = canvas.getContext("2d");
var step = 0.0;
var toRadian = Math.PI / 180;

// イベントハンドラの登録
setInterval(intervalHandler, INTERVAL_SEC);

// -----------------------------------------
// イベントハンドラ
// -----------------------------------------

/**
 * インターバルハンドラー
 */
function intervalHandler(){
  context.clearRect(0, 0, 465, 465);
  creatTree(context, 232, 465, 90, 180, 5); // 上方向
  creatTree(context, 232, 465, 60, 120, 4); // 右方向
  creatTree(context, 232, 465, 120, 120, 4); // 左方向
  step += (Math.PI / 80) % Math.PI;
}

// -----------------------------------------
// いろいろ
// -----------------------------------------

/**
 * 木を描きます
 * @param {Context} g
 * @param {Number} px
 * @param {Number} py
 * @param {Number} angle
 * @param {Number} len
 * @param {int} n
 */
function creatTree(g, px, py, angle, len, n){
  if (n > 0) {
    angle += 3 * Math.cos(step) - 2;

    // よく伸びる幹
    var x1 = px + 0.1 * len * Math.cos(angle * toRadian);
    var y1 = py - 0.1 * len * Math.sin(angle * toRadian);

    // あまり伸びない幹
    var x2 = px + len * Math.cos(angle * toRadian);
    var y2 = py - len * Math.sin(angle * toRadian);

    // 線を描く
    drawLine(g, n - 1, px, py, x2, y2);

    var angleLeft = angle + 30;
    var angleRight = angle - 30;

    // すこしずつ伸びなくする
    len = len * 2 / 3;
    creatTree(g, x2, y2, angle - 3 * Math.sin(step), len, n - 1); // 上方向の幹
    creatTree(g, x1, y1, angleLeft, len * 2 / 3, n - 1); // 左方向の幹
    creatTree(g, x1, y1, angleRight, len * 2 / 3, n - 1); // 右方向の幹
    creatTree(g, x2, y2, angleLeft, len * 2 / 3, n - 1); // 左方向の幹
    creatTree(g, x2, y2, angleRight, len * 2 / 3, n - 1); // 右方向の幹
  }
}

/**
 * 線を描きます
 * @param {Context} g
 * @param {int} n
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} x2
 * @param {Number} y2
 */
function drawLine(g, n, x1, y1, x2, y2){
  g.beginPath();
  g.lineWidth = n > 0 ? n : 1;
  g.strokeStyle = "rgb(0, 128, 32)";
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
}

export default canvas
