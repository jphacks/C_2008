<template>
  <div class="calibrate">
    <FaceMesh ref="facemesh" @onready="ready"/>
    <canvas class="calibrate-screen" ref="calibrate_screen" @click="calibrate"></canvas>
  </div>
</template>

<script>
  import FaceMesh from "../components/FaceMesh"
  import Regression from "../libraries/regression"
  export default {
    components: {
      FaceMesh
    },
    mounted () {
      this.$refs.calibrate_screen.width = window.innerWidth
      this.$refs.calibrate_screen.height = window.innerHeight
    },
    methods: {
      ready: function () {
        console.log("準備ができました．クリックして目のキャリブレーションを行ってください")
      },
      calibrate: async function (e) {
        console.log("キャリブレーション")
        const input = await this.$refs.facemesh.getEyes()
        const output = [e.pageX / window.innerWidth * 100, e.pageY / window.innerHeight * 100]
        const weight = Regression.train(input, output)
        console.log("入力: ", input)
        console.log("出力: ", output)
        console.log("重み: ", weight)
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
</style>
