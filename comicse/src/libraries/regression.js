import * as tf from '@tensorflow/tfjs-core'

const eyeWidth = 10
const eyeHeight = 6

const ridgeParameter = Math.pow(10, -5);

export default {
  weightX: new Array(eyeWidth * eyeHeight),
  weightY: new Array(eyeWidth * eyeHeight),
  train: (async (inputs, outputs) => { // 訓練関数（inputsは(N,10*6*2)の行列，outputsは(N,2)の行列）
    // inputs[0][10]...0番目のトレーニングサンプルの入力の10番目の数値
    // outputs[0][1]...0番目のトレーニングサンプルの出力の1番目の数値
    var n = 1; //inputs.length;
    var m = inputs.length; //inputs[0].length;

    var X = tf.tensor2d(inputs, [n, m]);
    var y = tf.tensor2d(outputs, [n, 1]);

    X.print()
    y.print()

    var Xt = tf.transpose(X);
    var bb = Xt.matMul(X);

    bb.print()

    var reg = tf.scalar(ridgeParameter).mul(tf.eye(m, m));
    bb = bb.add(reg);

    bb.print()

    bb = invertMatrix(bb);

    bb.print()

    var ss = Xt.matMul(y);

    var result = bb.matMul(ss);

    return result;

  }),
  predict: (async (input, weights) => { // 予測関数（inputは10*6*2次元のベクトル）
    // input[10]...入力の10番目の数値
    return [0, 0]
  })
}

// calculate the determinant of a matrix m
function det(m) {
  return tf.tidy(() => {
      const [r, _] = m.shape
      if (r === 2) {
          const t = m.as1D()
          const a = t.slice([0], [1]).dataSync()[0]
          const b = t.slice([1], [1]).dataSync()[0]
          const c = t.slice([2], [1]).dataSync()[0]
          const d = t.slice([3], [1]).dataSync()[0]
          result = a * d - b * c
          return result

      } else {
          let s = 0;
          rows = [...Array(r).keys()]
          for (let i = 0; i < r; i++) {
              sub_m = m.gather(tf.tensor1d(rows.filter(e => e !== i), 'int32'))
              sli = sub_m.slice([0, 1], [r - 1, r - 1])
              s += Math.pow(-1, i) * det(sli)
          }
          return s
      }
  })
}

// the inverse of the matrix : matrix adjoint method
function invertMatrix(m) {
  return tf.tidy(() => {
      const d = det(m)
      if (d === 0) {
          return
      }
      [r, _] = m.shape
      rows = [...Array(r).keys()]
      dets = [];
      for (let i = 0; i < r; i++) {
          for (let j = 0; j < r; j++) {
              const sub_m = m.gather(tf.tensor1d(rows.filter(e => e !== i), 'int32'))
              let sli
              if (j === 0) {
                  sli = sub_m.slice([0, 1], [r - 1, r - 1])
              } else if (j === r - 1) {
                  sli = sub_m.slice([0, 0], [r - 1, r - 1])
              } else {
                  const [a, b, c] = tf.split(sub_m, [j, 1, r - (j + 1)], 1)
                  sli = tf.concat([a, c], 1)
              }
              dets.push(Math.pow(-1, (i + j)) * det(sli))
          }
      }
      com = tf.tensor2d(dets, [r, r])
      tr_com = com.transpose()
      inv_m = tr_com.div(tf.scalar(d))
      return inv_m
  })
}
