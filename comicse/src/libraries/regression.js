import * as tf from '@tensorflow/tfjs-core'
import * as tflayer from '@tensorflow/tfjs-layers'
import config from '../../app_config'

const eyeWidth = config.eyeWidth
const eyeHeight = config.eyeHeight

const ridgeParameter = Math.pow(10, -5);

let model = tflayer.sequential();
let notTrained = true;

export default {
  train: (async (inputs, outputs) => { // 訓練関数（inputsは(N,10*6*2)の行列，outputsは(N,2)の行列）
    // inputs[0][10]...0番目のトレーニングサンプルの入力の10番目の数値
    // outputs[0][1]...0番目のトレーニングサンプルの出力の1番目の数値
    var m = inputs[0].length;
    var X = tf.tensor2d(inputs);
    var Y = tf.tensor2d(outputs);

    if(notTrained){
      model = null;
      model = tflayer.sequential();
      model.add(tflayer.layers.dense({ units: 2, inputShape: [m], kernelRegularizer: tflayer.regularizers.l2({ridgeParameter}) }));

      model.compile({
        loss: 'meanSquaredError',
        optimizer: 'sgd'
      });
      notTrained = false;
    }else{
      model.predict(tf.tensor2d(inputs[0], [1,m])).print();
    }

    const history = await model.fit(X, Y, { epochs: 100 });

    console.log(history.history.loss);
    const result = model.predict(tf.tensor2d(inputs[0], [1,m])).arraySync();
    console.log([result[0][0], result[0][1]]);

  }),
  predict: (async (input) => { // 予測関数（inputは10*6*2次元のベクトル）
    // input[10]...入力の10番目の数値
    const result = model.predict(tf.tensor2d(input, [1,m])).arraySync();
    result[0] = Math.max(0, Math.min(result[0], 100));
    result[1] = Math.max(0, Math.min(result[1], 100));
    return [result[0], result[1]];
  })
}
