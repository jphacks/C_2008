<template>
  <div>
    <video ref="facemeshvideo" :width="width" :height="height" autoplay="true" style="border-radius: 16px;"></video>
    <canvas ref="facemesheyeL" :width="eyeWidth" :height="eyeHeight" style="display: none"></canvas>
    <canvas ref="facemesheyeR" :width="eyeWidth" :height="eyeHeight" style="display: none"></canvas><br/>
    <canvas ref="facemesh_debug_eye_resultL" :width="eyeWidth * 16" :height="2 * eyeHeight * 16" style="display: none"></canvas>
  </div>
</template>
<script>
  import * as tf from '@tensorflow/tfjs-core'
  import * as facemesh from '@tensorflow-models/facemesh'
  require('@tensorflow/tfjs-backend-webgl')

  import config from '../../app_config'

  export default {
    name: 'FaceMesh',
    data () {
      return {
        width: config.videoWidth,
        height: config.videoHeight,
        eyeWidth: config.eyeWidth,
        eyeHeight: config.eyeHeight,
        model: null,
        video: null,
        eyeL: null,
        eyeR: null,
        stream: null,
        ready: false
      }
    },
    methods: {
      getEyes: async function() {
        if (this.ready !== true) return

        if (this.video === null) return
        // FaceMeshを利用して顔の位置を推定
        const faces = await this.model.estimateFaces(this.video)
        if (faces.length === 0) return

        // 0番目の顔のポジションから左目の位置と右目の位置を算出
        const positions = faces[0].scaledMesh
        const leftX  = Math.round(Math.min(positions[247][0], positions[130][0], positions[25][0]))
        const leftY  = Math.round(Math.min(positions[247][1], positions[ 27][1], positions[190][1]))
        const leftW  = Math.round(Math.max(positions[190][0], positions[243][0], positions[233][0]) - leftX)
        const leftH  = Math.round(Math.max(positions[ 25][1], positions[ 23][1], positions[112][1]) - leftY)
        const rightX = Math.round(Math.min(positions[414][0], positions[463][0], positions[453][0]))
        const rightY = Math.round(Math.min(positions[414][1], positions[257][1], positions[467][1]))
        const rightW = Math.round(Math.max(positions[467][0], positions[359][0], positions[255][0]) - rightX)
        const rightH = Math.round(Math.max(positions[341][1], positions[253][1], positions[255][1]) - rightY)

        if (leftW === 0 || rightW === 0 || leftH === 0 || rightH === 0) return

        if (this.eyeL === null || this.eyeR === null) return

        // this.eyeWidth*this.eyeHeightにリサイズしてカンバスに描写
        this.eyeL.getContext('2d').drawImage(this.video, leftX, leftY, leftW, leftH, 0, 0, this.eyeWidth, this.eyeHeight)
        this.eyeR.getContext('2d').drawImage(this.video, rightX, rightY, rightW, rightH, 0, 0, this.eyeWidth, this.eyeHeight)

        // カンバスをデータ化して特徴量ベクトルeyeに変換する
        const eyes = this.imageData2array(this.eyeL.getContext('2d').getImageData(0, 0, this.eyeWidth, this.eyeHeight)).concat(
          this.imageData2array(this.eyeR.getContext('2d').getImageData(0, 0, this.eyeWidth, this.eyeHeight))
        )

        const unscaledPositions = faces[0].mesh
        const headUp = unscaledPositions[10]
        const headDown = unscaledPositions[152]
        const eyeLeft = unscaledPositions[247]
        const eyeRight = unscaledPositions[414]

        // 前向きの傾き (ピッチ)
        let pitch = Math.atan((headUp[2] - headDown[2]) / (headUp[1] - headDown[1]))
        // 横向きの傾き (ヨー) なおロールはあんまり関係ないとみた
        let yaw = Math.atan((eyeLeft[2] - eyeRight[2]) / (eyeLeft[0] - eyeRight[0]))

        // ログ出力
        // console.log("ピッチ(度) " + pitch * 180 / Math.PI)
        // console.log("ヨー(度) " + yaw * 180 / Math.PI)

        // 機械学習にかける情報に追加
        eyes.push(pitch)
        eyes.push(yaw)

        // デバッグように画面に表示する
        // this.showEyes(eyes)

        // 目の目の間の中心座標 (カメラ座標) キャリブレーション時にはあまり顔を動かさない為、学習が進まない可能性
        // const eyeCenter = positions[6]
        // eyes.push(eyeCenter[0] / this.width)
        // eyes.push(eyeCenter[1] / this.height)
        // console(eyeCenter)

        //  eyesを渡す
        this.$emit("getEyes", eyes)
        return eyes
      },
      // 片目の画像データから特徴量ベクトルに変換する
      imageData2array: function (imageData) {
        const IMAGE_DATA_LENGTH = this.eyeWidth * this.eyeHeight
        const BRIGHTNESS = 256
        const STEP = 1

        let gray = new Array(IMAGE_DATA_LENGTH)
        let histogram = new Array(BRIGHTNESS).fill(0)

        // グレースケール化（明度データ）
        for (let i = 0;i < IMAGE_DATA_LENGTH;i ++) {
          // gray[i] = Math.floor((imageData.data[i * 4] * 0.299 + imageData.data[i * 4 + 1] * 0.587 + imageData.data[i * 4 + 2] * 0.114))
          // 赤青緑のチャネルの重み付き平均でグレースケール化
          gray[i] = imageData.data[i * 4] // 赤だけ利用
        }

        // ヒストグラムを作成（ただし全ての点を使わず，5つに1つの割合で使う）
        for (let i = 0;i < IMAGE_DATA_LENGTH;i += STEP) {
          histogram[gray[i]] ++;
        }
        // ヒストグラムを積み上げてフィルターを作成
        let sum = 0
        for (let j = 0;j < BRIGHTNESS;j++) {
          sum += histogram[j]
          histogram[j] = Math.floor(sum / (IMAGE_DATA_LENGTH / STEP) * BRIGHTNESS)
        }
        // フィルターに明度データを通す
        let filtered_gray = new Array(IMAGE_DATA_LENGTH)
        for (let i = 0;i < IMAGE_DATA_LENGTH;i ++) {
          filtered_gray[i] = histogram[gray[i]] / BRIGHTNESS
        }

        return filtered_gray
      },
      showEyes: function (eyes) {
        let eyeResult = this.$refs["facemesh_debug_eye_resultL"]
        let context = eyeResult.getContext('2d')
        for (let i=0;i<eyes.length;i++) {
          let brightness = (Math.floor(eyes[i] * 255)).toString(16);
          context.fillStyle = '#' + brightness + brightness + brightness
          context.fillRect((i % this.eyeWidth) * 16, Math.floor(i / this.eyeWidth) * 16, 16, 16)
        }
      }
    },
    mounted: async function () {
      this.video = this.$refs["facemeshvideo"]
      this.eyeL = this.$refs["facemesheyeL"]
      this.eyeR = this.$refs["facemesheyeR"]

      await tf.setBackend("webgl")
      this.model = await facemesh.load()

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          width: { ideal: this.width },
          height: { ideal: this.height }
        }
      })
      this.video.srcObject = this.stream

      this.video.onloadeddata = async () => {
        await this.model.estimateFaces(this.video)
        await this.model.estimateFaces(this.video)
        this.ready = true
        this.$emit("onready")
      }
    },

    beforeDestroy () {
      this.video.srcObject = null
      this.video = null
      this.model = null
      this.stream = null
      this.eyeL = null
      this.eyeR = null
      this.ready = false
    }
  }
</script>
