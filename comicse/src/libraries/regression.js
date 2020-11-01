import * as tf from '@tensorflow/tfjs-core'
import config from '../../app_config'

const eyeWidth = config.eyeWidth
const eyeHeight = config.eyeHeight

const ridgeParameter = Math.pow(10, -5);

export default {
  weightX: new Array(eyeWidth * eyeHeight),
  weightY: new Array(eyeWidth * eyeHeight),
  train: (async (inputs, outputs) => { // 訓練関数（inputsは(N,10*6*2)の行列，outputsは(N,2)の行列）
    // inputs[0][10]...0番目のトレーニングサンプルの入力の10番目の数値
    // outputs[0][1]...0番目のトレーニングサンプルの出力の1番目の数値

    var n = outputs.length;

    var outputX = new Array(n);
    for(var i = 0; i < n; i++){
      outputX[i] = outputs[i][0];
    }
    var outputY = new Array(n);
    for(var i = 0; i < n; i++){
      outputY[i] = outputs[i][1];
    }
    
    var weightX = ridge(inputs, outputX);
    var weightY = ridge(inputs, outputY);

    var weight = new Array(2);
    weight[0] = weightX;
    weight[1] = weightY;

    return weight;

  }),
  predict: (async (input, weights) => { // 予測関数（inputは10*6*2次元のベクトル）
    // input[10]...入力の10番目の数値
    return [0, 0]
  })
}

function ridge(inputs, outputs){
  var n = inputs.length;
  var m = inputs[0].length;

  var X = tf.tensor2d(inputs, [n, m]);
  var y = tf.tensor2d(outputs, [n, 1]);

  X.print()
  y.print()

  var Xt = tf.transpose(X);
  var b = Xt.matMul(X);

  b.print()

  var reg = tf.scalar(ridgeParameter).mul(tf.eye(m, m));
  var bb = b.add(reg);

  bb.print()

  var bbb = invertMatrix(bb);

  bbb.print()

  var ss = Xt.matMul(y);

  var result = bbb.matMul(ss);

  result.print();

  return result.arraySync();
}

// calculate the determinant of a matrix m
const det = tnsr => {
  const [n, m, ...dims] = tnsr.shape.reverse()
  if (m !== n) throw new Error(`det(): Received non-square matrix.`)
  const mats = tnsr.reshape([-1, n, n]).unstack()
  const dets = mats.map(mat => {
    const r = tf.linalg.qr(mat)[1]
    const diag_r = r.flatten().stridedSlice([0], [n * n], [n + 1])
    const det_r = diag_r.prod()
    // q is product of n Householder reflections, i.e. det(q) = (-1)^n
    const det_q = n % 2 === 0 ? 1 : -1
    return tf.mul(det_q, det_r)
  })
  return tf.stack(dets).reshape(dims)
}

// the inverse of the matrix : matrix adjoint method
function invertMatrix(m) {
  //return tf.tidy(() => {
    console.log("helllo");
    const d = det(m);
    if (d === 0) {
        return
    }
    let [r, _] = m.shape;
    let rows = [...Array(r).keys()];
    let dets = [];
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < r; j++) {
        const sub_m = m.gather(tf.tensor1d(rows.filter(e => e !== i), 'int32'));
        let sli;
        if (j === 0) {
          sli = sub_m.slice([0, 1], [r - 1, r - 1]);
        } else if (j === r - 1) {
          sli = sub_m.slice([0, 0], [r - 1, r - 1]);
        } else {
          const [a, b, c] = tf.split(sub_m, [j, 1, r - (j + 1)], 1);
          sli = tf.concat([a, c], 1);
        }
        dets.push(Math.pow(-1, (i + j)) * det(sli));
      }
    }
    let com = tf.tensor2d(dets, [r, r]);
    let tr_com = com.transpose();
    let inv_m = tr_com.div(tf.scalar(d));
    return inv_m;
  //})
}
