<template>
  <div>
    <video ref="video" :width="width" :height="height" autoplay="true"></video>
    <canvas ref="eyeL" :width="eyeWidth" :height="eyeHeight"></canvas>
    <canvas ref="eyeR" :width="eyeWidth" :height="eyeHeight"></canvas>
  </div>
</template>
<script>
  export default {
    name: 'FaceMesh',
    props: ['active'],
    data () {
      return {
        width: 320,
        height: 240,
        eyeWidth: this.$config.eyeWidth,
        eyeHeight: this.$config.eyeHeight,
        video: null,
        eyeL: null,
        eyeR: null,
        stream: null
      }
    },
    methods: {
      getEyes: async function() {
        if (this.video === null) return
        const faces = await this.$facemesh.estimateFaces(this.video)
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

        this.$emit("getEyes",
          this.imageData2array(this.eyeL.getContext('2d').getImageData(0, 0, this.eyeWidth, this.eyeHeight)).concat(
            this.imageData2array(this.eyeR.getContext('2d').getImageData(0, 0, this.eyeWidth, this.eyeHeight))
          )
        )
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
      this.video = this.$refs["video"]
      this.eyeL = this.$refs["eyeL"]
      this.eyeR = this.$refs["eyeR"]

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          width: { ideal: this.width },
          height: { ideal: this.height }
        }
      })
      this.video.srcObject = this.stream

      await new Promise((resolve) => { this.video.onloadeddata = () => { resolve() } })

      while (this.active) {
        await this.getEyes()
      }
    },

    beforeDestroy () {
      this.video.srcObject = null
      this.video = null
      this.stream = null
      this.eyeL = null
      this.eyeR = null
    }
  }
</script>
