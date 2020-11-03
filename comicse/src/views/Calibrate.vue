<template>
  <div class="container">
    <div class="calibrate">
      <FaceMesh ref="facemesh" @onready="onReadyCalibrate"/>
      <canvas class="calibrate-screen" ref="calibrate_screen" @click="calibrate"></canvas>
      <el-card class="description">
        <div style="font-size: 1.2em;">
          学習情報
          <el-button type="danger" size="mini" round plain @click="reset">データの削除</el-button>
        </div>
        <div>
          サンプル数: {{ calibrateInputs.length }}
        </div>
        <div style="font-size: 0.8em;color: gray;padding-bottom: 12px;">
          キャリブレーションしたデータは<br/>
          ブラウザに自動で保存されます．<br/>
        </div>
        <el-button type="primary" size="large" round @click="train">このサンプルデータで学習する</el-button>
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
        instruction: false,
        prev: null,
        training: false,
        calibrating: false,
        colors: ["#409EFF", "#67C23A", "#E6A23C", "#F56C6C"]
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
        Regression.reset()
        this.ready = true
        this.instruction = true
        this.predict()
      },
      calibrate: async function (e) {
        if (this.ready === false) return
        if (this.training === true) return
        if (this.calibrating === true) return
        this.calibrating = true

        let context = this.$refs.calibrate_screen.getContext("2d")

        let x = e.pageX, y = e.pageY

        context.beginPath()
        context.arc(x, y, 8, 0, 2 * Math.PI, false)
        context.fillStyle = this.colors[Math.floor(Math.random() * this.colors.length)]
        context.fill()

        console.log("キャリブレーション")
        const input = await this.$refs.facemesh.getEyes()
        const output = [x / window.innerWidth * 100, y / window.innerHeight * 100]
        if (!input) return
        this.$store.commit("pushCalibrateData", { input: input, output: output })

        context.clearRect(x - 8, y- 8, 16, 16)
        this.calibrating = false
      },
      train: async function () {
        if (this.calibrateInputs && this.calibrateInputs.length > 0) {
          this.training = true
          console.log("学習なう")
          await Regression.train(this.calibrateInputs, this.calibrateOutputs)
          this.training = false
          console.log("学習終わり！")
        }
      },
      predict: async function () {
        while (true) {
          await this.sleep(100)
          if (this.training === true) continue
          const input = await this.$refs.facemesh.getEyes()
          if (!input) continue
          const predicted_output = await Regression.predict(input)
          if (predicted_output !== null) {
            console.log(predicted_output)

            let context = this.$refs.calibrate_screen.getContext("2d")
            if (this.prev !== null)
              context.clearRect(this.prev[0] * window.innerWidth / 100 - 8, this.prev[1] * window.innerHeight / 100 - 8, 16, 16)

            context.beginPath()
            context.arc(predicted_output[0] * window.innerWidth / 100, predicted_output[1] * window.innerHeight / 100, 6, 0, 2 * Math.PI, false)
            context.fillStyle = "rgba(0,0,255)"
            context.fill()
            this.prev = predicted_output
          }
        }
      },
      sleep: function (time) {
        return new Promise((resolve) => {setTimeout(() => { resolve() }, time)})
      },
      reset: function () {
        this.$store.commit("resetCalibrateData")
        Regression.reset()
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
