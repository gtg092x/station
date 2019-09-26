import { createCanvas } from 'canvas';
import { getCurrentColor } from '../state';

  var Camera, Perspective, Transform3D, c, cv, drawCircle, fps, markers, n, num, offset, prs, resize, theta, time, trackCoord,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Transform3D = (function() {

    function Transform3D() {
      this.transformFunctions = [];
    }

    Transform3D.prototype.appendTranslate = function(distance) {
      return this.transformFunctions.push(function(vector) {
        return {
          x: vector.x + distance.x,
          y: vector.y + distance.y,
          z: vector.z + distance.z
        };
      });
    };

    Transform3D.prototype.appendScale = function(sx, sy, sz) {
      return this.transformFunctions.push(function(vector) {
        return {
          x: vector.x * sx,
          y: vector.y * sy,
          z: vector.z * sz
        };
      });
    };

    Transform3D.prototype.appendRotate = function(axis, theta) {
      var conj, mult, quat, sin;
      sin = Math.sin(theta / 2);
      quat = {
        w: Math.cos(theta / 2),
        x: axis.x * sin,
        y: axis.y * sin,
        z: axis.z * sin
      };
      conj = {
        w: quat.w,
        x: -quat.x,
        y: -quat.y,
        z: -quat.z
      };
      mult = function(q1, q2) {
        return {
          w: q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z,
          x: q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y,
          y: q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x,
          z: q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w
        };
      };
      return this.transformFunctions.push(function(vector) {
        vector.w = 0;
        return mult(mult(quat, vector), conj);
      });
    };

    Transform3D.prototype.append = function(transform3d) {
      return this.transformFunctions.push(function(vector) {
        var f, _i, _len, _ref;
        _ref = transform3d.transformFunctions;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          f = _ref[_i];
          vector = f(vector);
        }
        return vector;
      });
    };

    Transform3D.prototype.project = function(vector) {
      var f, _i, _len, _ref;
      _ref = this.transformFunctions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        vector = f(vector);
      }
      return vector;
    };

    return Transform3D;

  })();

  Camera = (function(_super) {

    __extends(Camera, _super);

    function Camera(target, eye) {
      var angle, axis, sightLine, unit;
      Camera.__super__.constructor.apply(this, arguments);
      sightLine = {
        x: 0,
        y: 0,
        z: 1
      };
      unit = this.normalize(this.subVector(target, eye));
      axis = this.crossProduct(unit, sightLine);
      angle = this.betweenTheta(unit, sightLine);
      this.appendTranslate({
        x: -eye.x,
        y: -eye.y,
        z: -eye.z
      });
      this.appendRotate(axis, angle);
      this.appendRotate(sightLine, Math.atan2(axis.x, axis.y) - Math.PI / 2);
    }

    Camera.prototype.subVector = function(v1, v2) {
      return {
        x: v1.x - v2.x,
        y: v1.y - v2.y,
        z: v1.z - v2.z
      };
    };

    Camera.prototype.vectorLength = function(v) {
      return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    };

    Camera.prototype.normalize = function(v) {
      var k, length, vec, _i, _len, _ref;
      length = this.vectorLength(v);
      vec = {
        x: 0,
        y: 0,
        z: 0
      };
      if (length !== 0) {
        _ref = ['x', 'y', 'z'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          k = _ref[_i];
          vec[k] = v[k] / length;
        }
      }
      return vec;
    };

    Camera.prototype.crossProduct = function(v1, v2) {
      return {
        x: v1.y * v2.z - v1.z * v2.y,
        y: -v1.x * v2.z + v1.z * v2.x,
        z: v1.x * v2.y - v1.y * v2.x
      };
    };

    Camera.prototype.innerProduct = function(v1, v2) {
      return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    };

    Camera.prototype.betweenTheta = function(v1, v2) {
      return Math.acos(this.innerProduct(v1, v2) / (this.vectorLength(v1) * this.vectorLength(v2)));
    };

    return Camera;

  })(Transform3D);

  Perspective = (function() {

    function Perspective(perspective, offset) {
      this.perspective = perspective;
      this.offset = offset;
    }

    Perspective.prototype.project = function(vector) {
      var t;
      t = this.perspective / (this.perspective + vector.z);
      return {
        t: t,
        x: vector.x * t + this.offset.x,
        y: vector.y * t + this.offset.y,
        z: vector.z
      };
    };

    return Perspective;

  })();

  cv = createCanvas(1500, 500);

  c = cv.getContext('2d');


  trackCoord = function(theta) {
    var radius;
    radius = 3000;
    return {
      x: radius * Math.cos(theta),
      y: radius * Math.sin(2 * theta),
      z: 0.1 * radius * Math.sin(theta)
    };
  };

  markers = (function() {
    var _i, _results;
    _results = [];
    for (n = _i = 0; _i < 100; n = ++_i) {
      _results.push(trackCoord(n / 100 * 2 * Math.PI));
    }
    return _results;
  })();

  offset = {
    x: cv.width / 2,
    y: cv.height / 2
  };

  prs = new Perspective(500, offset);

  drawCircle = function(point, color) {
    var radius, scale;
    point = prs.project(point);
    scale = point.t;
    if (point.z < -300 || point.x < 0 || point.y < 0 || point.x > cv.width || point.y > cv.height) {
      return;
    }
    radius = 50;
    c.lineWidth = 10 * scale;
    c.strokeStyle = color;
    c.beginPath();
    c.arc(point.x, point.y, radius * scale, 0, 2 * Math.PI, true);
    return c.stroke();
  };

  c.fillStyle = 'white';

  time = new Date().getTime();

  fps = 0;

  num = 0;

  theta = 0;

  setInterval(function() {
    var eye, marker, now, point, target, tf, _i, _len;
    c.clearRect(0, 0, cv.width, cv.height);
    target = trackCoord(theta);
    target.z += 100;
    eye = trackCoord(theta - 0.3);
    eye.z += 150;
    tf = new Camera(target, eye);
    for (_i = 0, _len = markers.length; _i < _len; _i++) {
      marker = markers[_i];
      point = tf.project(marker);
      drawCircle(point, getCurrentColor());
    }
    point = tf.project(target);
    drawCircle(point, 'red');
    now = new Date().getTime();
    if (now - time >= 1000) {
      fps = num;
      time = now;
      num = 0;
    }
    num++;
    c.fillText("FPS " + fps, 15, 20);
    return theta = (theta + 0.008) % (2 * Math.PI);
  }, 1000 / 120);

export default cv
