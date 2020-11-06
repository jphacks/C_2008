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
    model.add(tflayer.layers.conv2d({
      inputShape: [eyeHeight * 2, eyeWidth, 1],
      kernelSize: 3,
      filters: 8,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));
    model.add(tflayer.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));
    model.add(tflayer.layers.conv2d({
      kernelSize: 3,
      filters: 16,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));
    model.add(tflayer.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));
    model.add(tflayer.layers.flatten());
    model.add(tflayer.layers.dense({ units: 2 }));

    model.compile({
      loss: tf.losses.huberLoss,
      optimizer: 'adam'
    });

    model.summary();
  }),
  train: (async (inputs, outputs) => { // 訓練関数（inputsは(N,10*6*2)の行列，outputsは(N,2)の行列）
    // inputs[0][10]...0番目のトレーニングサンプルの入力の10番目の数値
    // outputs[0][1]...0番目のトレーニングサンプルの出力の1番目の数値
    var m = inputs[0].length;

    var X = tf.tensor2d(inputs);
    X = X.reshape([inputs.length, eyeHeight * 2, eyeWidth, 1])
    var Y = tf.tensor2d(outputs).div(100);

    if(notTrained){
      notTrained = false;
    }else{
      console.log(predict(inputs[0]));
    }

    const history = await model.fit(X, Y, { batchSize: 128, epochs: 100 });

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
  const output = model.predict(tf.tensor4d(input, [1, eyeHeight * 2, eyeWidth, 1])).mul(100).arraySync();
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