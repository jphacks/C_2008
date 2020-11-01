<template>
  <div class="calibrate">
    <FaceMesh ref="facemesh" @onready="onReadyCalibrate"/>
    <canvas class="calibrate-screen" ref="calibrate_screen" @click="calibrate"></canvas>
    <div class="description">
      ■キャリブレーション<br/>
      データ数: {{ calibrateInputs.length }}<br/>
      キャリブレーションしたデータは<br/>
      自動で保存されます．<br/>
      <button @click="resetCalibrateData">data reset</button>
    </div>
  </div>
</template>

<script>
  import FaceMesh from "../components/FaceMesh"
  import Regression from "../libraries/regression"
  export default {
    components: {
      FaceMesh
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
        const weight = Regression.train(input, output)
        console.log("入力: ", input)
        console.log("出力: ", output)
        console.log("重み: ", weight)

        this.$store.commit("pushCalibrateData", { input: input, output: output })
        this.$store.commit("setWeight", { weight: weight })

      },
      resetCalibrateData: function () {
        this.$store.commit("resetCalibrateData")
      }
    }
  }
</script>
<style>
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
    top: 0;
    left: 0;
    text-align: left;
  }
</style>
