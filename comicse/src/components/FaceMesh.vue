<template>
  <div>
    <video ref="facemeshvideo" :width="width" :height="height" autoplay="true"></video>
    <canvas ref="facemesheyeL" :width="eyeWidth" :height="eyeHeight" style="display: none"></canvas>
    <canvas ref="facemesheyeR" :width="eyeWidth" :height="eyeHeight" style="display: none"></canvas>
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
        const faces = await this.model.estimateFaces(this.video)
        if (faces.length === 0) return

        const positions = faces[0].scaledMesh
        const leftX  = Math.round(Math.min(positions[247][0], positions[130][0], positions[25][0]))
        const leftY  = Math.round(Math.min(positions[247][1], positions[27][1], positions[190][1]))
        const leftW  = Math.round(Math.max(positions[190][0], positions[243][0], positions[233][0]) - leftX)
        const leftH  = Math.round(Math.max(positions[ 25][1], positions[ 23][1], positions[112][1]) - leftY)
        const rightX = Math.round(Math.min(positions[414][0], positions[463][0], positions[453][0]))
        const rightY = Math.round(Math.min(positions[414][1], positions[257][1], positions[467][1]))
        const rightW = Math.round(Math.max(positions[467][0], positions[359][0], positions[255][0]) - rightX)
        const rightH = Math.round(Math.max(positions[341][1], positions[253][1], positions[255][1]) - rightY)

        if (leftW === 0 || rightW === 0 || leftH === 0 || rightH === 0) return

        if (this.eyeL === null || this.eyeR === null) return
        this.eyeL.getContext('2d').drawImage(this.video, leftX, leftY, leftW, leftH, 0, 0, this.eyeWidth, this.eyeHeight)
        this.eyeR.getContext('2d').drawImage(this.video, rightX, rightY, rightW, rightH, 0, 0, this.eyeWidth, this.eyeHeight)

        const eyes = this.imageData2array(this.eyeL.getContext('2d').getImageData(0, 0, this.eyeWidth, this.eyeHeight)).concat(
          this.imageData2array(this.eyeR.getContext('2d').getImageData(0, 0, this.eyeWidth, this.eyeHeight))
        )

        this.$emit("getEyes", eyes)
        return eyes
      },
      imageData2array: function (imageData) {
        let retval = new Array(this.eyeWidth * this.eyeHeight)
        for (let i = 0;i < this.eyeWidth * this.eyeHeight;i ++) {
          retval[i] = (imageData.data[i * 4] + imageData.data[i * 4 + 1] + imageData.data[i*4 + 2]) / 3 / 256
        }
        return retval
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
