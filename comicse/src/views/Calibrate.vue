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
        ready: false
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
        console.log("準備ができました．クリックして目のキャリブレーションを行ってください")
      },
      calibrate: async function (e) {
        if (this.ready === false) return
        console.log("キャリブレーション")
        const input = await this.$refs.facemesh.getEyes()
        const output = [e.pageX / window.innerWidth * 100, e.pageY / window.innerHeight * 100]
        this.$store.commit("pushCalibrateData", { input: input, output: output })

        // trainを呼び出すとweightが戻ってくる
        const weight = await Regression.train(this.calibrateInputs, this.calibrateOutputs)
        console.log("入力: ", input)
        console.log("出力: ", output)
        console.log("重み: ", weight)

        this.$store.commit("setWeight", { weight: weight })

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
    z-index: 1000;
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
