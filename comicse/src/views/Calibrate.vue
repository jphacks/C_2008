<template>
  <div class="container">
    <div class="calibrate">
      <FaceMesh ref="facemesh" @onready="onReadyCalibrate"/>
      <canvas class="calibrate-screen" ref="calibrate_screen" @click="calibrate"></canvas>
      <el-card class="description">
        <div style="font-size: 1.2em;">学習情報</div>
        <div>
          サンプル数: {{ calibrateInputs.length }}
        </div>
        <div style="font-size: 0.8em;color: gray;padding-bottom: 12px;">
          キャリブレーションしたデータは<br/>
          ブラウザに自動で保存されます．<br/>
        </div>
        <el-button type="danger" size="mini" round plain @click="resetCalibrateData">データの削除</el-button>
      </el-card>
    </div>
    <transition>
      <div class="loading" v-if="!ready">
        <div style="display: flex;flex-direction: row;justify-content: center">
          <el-card style="width: 640px;padding: 32px 0;">
            <img src="@/assets/icons/loading.gif"/><br/>
            学習のための準備をしています<br/>
            しばらくお待ちください
          </el-card>
        </div>
      </div>
    </transition>
    <el-dialog
      title="キャリブレーション"
      :visible.sync="instruction"
      width="40%">
      <span style="color: #0D83FC">明るい部屋</span>で，画面中央のカメラに<span style="color: #0D83FC">顔全体が映るように</span>してください<br/>
      <span style="color: #0D83FC">カーソルに視線を合わせたまま，</span>ページのあちこちをクリックしてください<br/>
      精度を上げるため少なくとも<span style="color: #0D83FC">30回ほど</span>クリックをしてください<br/>
      なお，<span style="color: #0D83FC">顔の映像やデータは一切サーバーに送信いたしません</span><br/>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="instruction = false">わかった</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import FaceMesh from "../components/FaceMesh"
  import Regression from "../libraries/regression"
  import { VueLoading } from 'vue-loading-template'
  export default {
    components: {
      FaceMesh,
      VueLoading
    },
    data () {
      return {
        ready: false,
        instruction: true,
        prev: null
      }
    },
    computed: {
      calibrateInputs: function () { return this.$store.state.calibrateInputs },
      calibrateOutputs: function () { return this.$store.state.calibrateOutputs }
    },
    mounted () {
      this.$refs.calibrate_screen.width = window.innerWidth
      this.$refs.calibrate_screen.height = window.innerHeight
    },
    methods: {
      onReadyCalibrate: function () {
        this.ready = true
        this.predict()
      },
      calibrate: async function (e) {
        if (this.ready === false) return
        let context = this.$refs.calibrate_screen.getContext("2d")

        context.beginPath()
        context.arc(e.pageX, e.pageY, 8, 0, 2 * Math.PI, false)
        context.fillStyle = "rgba(255,0,0)"
        context.fill()


        console.log("キャリブレーション")
        const input = await this.$refs.facemesh.getEyes()
        const output = [e.pageX / window.innerWidth * 100, e.pageY / window.innerHeight * 100]
        if (!input) return
        this.$store.commit("pushCalibrateData", { input: input, output: output })

        // trainを呼び出すとweightが戻ってくる
        await Regression.train(this.calibrateInputs, this.calibrateOutputs)
        console.log("入力: ", input)
        console.log("出力: ", output)

        context.clearRect(e.pageX-8, e.pageY-8, 16, 16)
      },
      predict: async function () {
        while (true) {
          const input = await this.$refs.facemesh.getEyes()
          if (!input) continue
          const predicted_output = await Regression.predict(input)

          console.log(predicted_output)
          if (predicted_output !== null) {
            let context = this.$refs.calibrate_screen.getContext("2d")
            if (this.prev !== null)
              context.clearRect(this.prev[0] * window.innerWidth / 100 - 8, this.prev[1] * window.innerWidth / 100 - 8, 16, 16)

            context.beginPath()
            context.arc(predicted_output[0] * window.innerWidth / 100, predicted_output[1] * window.innerWidth / 100, 6, 0, 2 * Math.PI, false)
            context.fillStyle = "rgba(0,0,255)"
            context.fill()
            this.prev = predicted_output
          }

          this.sleep(100)
        }
      },
      sleep: function (time) {
        return new Promise((resolve) => {setTimeout(() => { resolve() }, time)})
      },
      resetCalibrateData: function () {
        this.$store.commit("resetCalibrateData")
      }
    }
  }
</script>
<style>
  .container {
    width: 100%;
    height: 100%;
  }
  .calibrate {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: 100%;
  }
  .calibrate-screen {
    position: absolute;
    top: 0;
    left: 0;
  }
  .description {
    position: absolute;
    top: 16px;
    left: 16px;
    text-align: left;
  }
  .loading {
    position: fixed;
    top: 0;
    left: 0;
    background-color: #ffffff;
    z-index: 5;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: 100%;
  }

  .v-enter-active, .v-leave-active {
    transition: opacity .5s;
  }
  .v-enter, .v-leave-to {
    opacity: 0;
  }
</style>
