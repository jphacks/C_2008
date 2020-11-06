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
    model.add(tflayer.layers.dense({ units: 32}));
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

    var X = tf.tensor2d(inputs);
    X = X.slice([0,0], [inputs.length, eyeHeight * 2 * eyeWidth]);
    X = X.reshape([inputs.length, eyeHeight * 2, eyeWidth, 1])
    var Y = tf.tensor2d(outputs).div(100);

    console.log(X.shape);

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
  const x = input.slice(0, eyeHeight * eyeWidth * 2);
  console.log("predict:", x.length)
  const output = model.predict(tf.tensor4d(x, [1, eyeHeight * 2, eyeWidth, 1])).mul(100).arraySync();
  const result = output[0];
  result[0] = Math.max(0, Math.min(result[0], 100));
  result[1] = Math.max(0, Math.min(result[1], 100));

  // 122, 123は顔の位置の情報
  const faceX = input[eyeHeight * eyeWidth * 2 + 2]
  const faceY = input[eyeHeight * eyeWidth * 2 + 3]
  // どうやら右にいるほど値が小さそう
  result[0] = result[0] - (faceX - 0.5) * 100
  result[1] = result[1] + (faceY - 0.5) * 100

  // 120にピッチ、121にヨーが入ってる
  const pitch = input[eyeHeight * eyeWidth * 2]
  const yaw = input[eyeHeight * eyeWidth * 2 + 1]

  // 首の角度 (ヨー) をもとにx座標に補正を加える ちょっと大げさすぎるので、比率下げても良いかも
  console.log("補正前x " + result[0])
  result[0] = 50 - result[0]
  result[0] += (result[0] * result[0] + 10000) / ((100 / Math.tan(yaw)) - result[0])
  result[0] = 50 - result[0]
  console.log("補正後x " + result[0])

  // 首の角度 (ピッチ) をもとにy座標に補正を加える ちょっと大げさすぎるので、比率下げても良いかも
  console.log("補正前y " + result[1])
  result[1] = 50 - result[1]
  result[1] += (result[1] * result[1] + 10000) / ((100 / Math.tan(pitch)) - result[1])
  result[1] = 50 - result[1]
  console.log("補正後y " + result[1])

  return [result[0], result[1]];
}

async function save(){
  await model.save('localstorage://gaze-model');
}

async function load(){
  model = await model.load('localstorage://gaze-model');
  notTrained = false;
}
