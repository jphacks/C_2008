import * as tf from '@tensorflow/tfjs-core'
import * as tflayer from '@tensorflow/tfjs-layers'
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

    var m = inputs[0].length;


    var X = tf.tensor2d(inputs);
    var Y = tf.tensor2d(outputs);

    const model = tflayer.sequential();
    model.add(tflayer.layers.dense({ units: 2, inputShape: [m] }));

    model.compile({
      loss: 'meanSquaredError',
      optimizer: 'sgd'
    });

    const history = await model.fit(X, Y, { epochs: 100 });

    model.weights.forEach(w => {
      console.log(w.name, w);
    });

    console.log(history.history.loss);

    return model;

  }),
  predict: (async (input, weights) => { // 予測関数（inputは10*6*2次元のベクトル）
    // input[10]...入力の10番目の数値
    return [0, 0]
  })
}
