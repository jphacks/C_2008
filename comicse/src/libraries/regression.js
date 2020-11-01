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

    var X = tf.tensor2d(inputs);
    var Y = tf.tensor2d(outputs);

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

    model.compile({
      loss: 'meanSquaredError',
      optimizer: 'sgd'
    });

    await model.fit(X, Y, { epochs: 10 });

    return model;

  }),
  predict: (async (input, weights) => { // 予測関数（inputは10*6*2次元のベクトル）
    // input[10]...入力の10番目の数値
    return [0, 0]
  })
}
