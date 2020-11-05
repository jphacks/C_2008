import * as tf from '@tensorflow/tfjs-core'
import * as tflayer from '@tensorflow/tfjs-layers'
import config from '../../app_config'

const eyeWidth = config.eyeWidth
const eyeHeight = config.eyeHeight

const ridgeParameter = Math.pow(10, -4);

let model = null;
let notTrained = true;

export default {
  reset: (async () => {
    notTrained = true;

    model = null;
    model = tflayer.sequential();
    model.add(tflayer.layers.dense({ units: 2, inputShape: [eyeWidth * eyeHeight * 2 + 2], useBias: false, kernelRegularizer: tflayer.regularizers.l2({ridgeParameter}) }));

    model.compile({
      loss: 'meanSquaredError',
      optimizer: 'sgd'
    });
  }),
  train: (async (inputs, outputs) => { // 訓練関数（inputsは(N,10*6*2)の行列，outputsは(N,2)の行列）
    // inputs[0][10]...0番目のトレーニングサンプルの入力の10番目の数値
    // outputs[0][1]...0番目のトレーニングサンプルの出力の1番目の数値
    var m = inputs[0].length;

    var X = tf.tensor2d(inputs);
    var Y = tf.tensor2d(outputs);

    if(notTrained){
      notTrained = false;
    }else{
      model.predict(tf.tensor2d(inputs[0], [1,m])).print();
    }

    const history = await model.fit(X, Y, { epochs: 100 });

    console.log(history.history.loss);
    console.log(predict(inputs[0]));

    await save();

  }),
  predict: (async (input) => { // 予測関数（inputは10*6*2次元のベクトル）
    if (notTrained === true) return null
    // input[10]...入力の10番目の数値
    return predict(input);
  }),
  save: (async () => {
    await save();
  }),
  load: (async () => {
    await load();
  })
}

function predict(input){
  let m = input.length;
  const output = model.predict(tf.tensor2d(input, [1,m])).arraySync();
  const result = output[0];
  result[0] = Math.max(0, Math.min(result[0], 100));
  result[1] = Math.max(0, Math.min(result[1], 100));
  return [result[0], result[1]];
}

async function save(){
  await model.save('localstorage://gaze-model');
}

async function load(){
  model = await model.load('localstorage://gaze-model');
  notTrained = false;
}
