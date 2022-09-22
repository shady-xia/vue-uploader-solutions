<template>
  <div id="global-uploader" :class="{'global-uploader-single': !global}">
    <!-- 上传 -->
    <uploader
      ref="uploader"
      :options="initOptions"
      :fileStatusText="fileStatusText"
      :autoStart="false"
      @file-added="onFileAdded"
      @file-success="onFileSuccess"
      @file-progress="onFileProgress"
      @file-error="onFileError"
      class="uploader-app"
    >
      <uploader-unsupport></uploader-unsupport>

      <uploader-btn id="global-uploader-btn" ref="uploadBtn">选择文件</uploader-btn>

      <uploader-list v-show="panelShow">
        <div class="file-panel" slot-scope="props" :class="{ collapse: collapse }">
          <div class="file-title">
            <div class="title">文件列表</div>
            <div class="operate">
              <el-button
                @click="collapse = !collapse"
                type="text"
                :title="collapse ? '展开' : '折叠'"
              >
                <i class="iconfont" :class="collapse ? 'el-icon-full-screen' : 'el-icon-minus'"></i>
              </el-button>
              <el-button @click="close" type="text" title="关闭">
                <i class="el-icon-close"></i>
              </el-button>
            </div>
          </div>

          <ul class="file-list">
            <li
              class="file-item"
              v-for="file in props.fileList"
              :key="file.id">
              <uploader-file
                :class="['file_' + file.id, customStatus]"
                ref="files"
                :file="file"
                :list="true"
              ></uploader-file>
            </li>
            <div class="no-file" v-if="!props.fileList.length">
              <i class="iconfont icon-empty-file"></i> 暂无待上传文件
            </div>
          </ul>
        </div>
      </uploader-list>
    </uploader>
  </div>
</template>

<script>
/**
 *  全局上传插件，两种调用方式
 *   1. 作为全局页面的组件，使用event bus
 *   调用方法：Bus.$emit('openUploader', {params: {}, options: {}})
 *               params: 发送给服务器的额外参数；
 *               options：上传选项，目前支持 target、testChunks、mergeFn、accept
 *
 *   监听函数：Bus.$on('fileAdded', fn); 文件选择后的回调
 *           Bus.$on('fileSuccess', fn); 文件上传成功的回调，监听后记得释放
 *
 *   2. 作为普通组件在单个页面中调用，使用props
 */
import { ACCEPT_CONFIG } from './js/config'
import Bus from './js/bus'
import SparkMD5 from 'spark-md5'
import { mergeSimpleUpload } from '@/api'

export default {
  props: {
    global: {
      type: Boolean,
      default: true
    },
    // 发送给服务器的额外参数
    params: {
      type: Object
    },
    options: {
      type: Object
    }
  },

  data() {
    return {
      initOptions: {
        target: 'http://localhost:3000/upload',
        chunkSize: '2048000',
        fileParameterName: 'file',
        maxChunkRetries: 3,
        // 是否开启服务器分片校验
        testChunks: true,
        // 服务器分片校验函数，秒传及断点续传基础
        checkChunkUploadedByResponse: function (chunk, message) {
          let skip = false

          try {
            let objMessage = JSON.parse(message)
            if (objMessage.skipUpload) {
              skip = true
            } else {
              skip = (objMessage.uploaded || []).indexOf(chunk.offset + 1) >= 0
            }
          } catch (e) {}

          return skip
        },
        query: (file, chunk) => {
          return {
            ...file.params
          }
        }
      },
      fileStatusText: {
        success: '上传成功',
        error: '上传失败',
        uploading: '上传中',
        paused: '已暂停',
        waiting: '等待上传'
      },
      panelShow: false, //选择文件后，展示上传panel
      collapse: false,
      customParams: {},
      customStatus: ''
    }
  },

  watch: {
    params: {
      handler(data) {
        if (data) {
          this.customParams = data
        }
      },
      immediate: true
    },
    options: {
      handler(data) {
        if (data) {
          setTimeout(() => {
            this.customizeOptions(data)
          }, 0)
        }
      },
      immediate: true
    }
  },

  mounted() {
    Bus.$on('openUploader', ({params={}, options={}}) => {
      this.customParams = params

      this.customizeOptions(options)

      if (this.$refs.uploadBtn) {
        this.$refs.uploadBtn.$el.click()
      }
    })
  },

  computed: {
    // Uploader实例
    uploader() {
      return this.$refs.uploader.uploader
    }
  },

  methods: {
    // 自定义options
    customizeOptions(opts) {
      // 自定义上传url
      if (opts.target) {
        this.uploader.opts.target = opts.target
      }

      // 是否可以秒传、断点续传
      if (opts.testChunks !== undefined) {
        this.uploader.opts.testChunks = opts.testChunks
      }

      // merge 的方法，类型为Function，返回Promise
      this.mergeFn = opts.mergeFn || mergeSimpleUpload

      // 自定义文件上传类型
      let input = document.querySelector('#global-uploader-btn input')
      let accept = opts.accept || ACCEPT_CONFIG.getAll()
      input.setAttribute('accept', accept.join())
    },

    onFileAdded(file) {
      this.panelShow = true
      this.emit('fileAdded')

      // 将额外的参数赋值到每个文件上，以不同文件使用不同params的需求
      file.params = this.customParams

      // 计算MD5
      this.computeMD5(file).then((result) => this.startUpload(result))
    },

    /**
     * 计算md5值，以实现断点续传及秒传
     * @param file
     * @returns Promise
     */
    computeMD5(file) {
      let fileReader = new FileReader()
      let time = new Date().getTime()
      let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
      let currentChunk = 0
      const chunkSize = 10 * 1024 * 1000
      let chunks = Math.ceil(file.size / chunkSize)
      let spark = new SparkMD5.ArrayBuffer()

      // 文件状态设为"计算MD5"
      this.statusSet(file.id, 'md5')
      file.pause()

      loadNext()

      return new Promise((resolve, reject) => {
        fileReader.onload = (e) => {
          spark.append(e.target.result)

          if (currentChunk < chunks) {
            currentChunk++
            loadNext()

            // 实时展示MD5的计算进度
            this.$nextTick(() => {
              const md5ProgressText ='校验MD5 '+ ((currentChunk/chunks)*100).toFixed(0)+'%'
              document.querySelector(`.custom-status-${file.id}`).innerText = md5ProgressText
            })

          } else {
            let md5 = spark.end()

            // md5计算完毕
            resolve({md5, file})

            console.log(
              `MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${file.size} 用时：${
                new Date().getTime() - time
              } ms`
            )
          }
        }

        fileReader.onerror = function () {
          this.error(`文件${file.name}读取出错，请检查该文件`)
          file.cancel()
          reject()
        }
      })

      function loadNext() {
        let start = currentChunk * chunkSize
        let end = start + chunkSize >= file.size ? file.size : start + chunkSize

        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end))
      }
    },

    // md5计算完毕，开始上传
    startUpload({md5, file}) {
      file.uniqueIdentifier = md5
      file.resume()
      this.statusRemove(file.id)
    },

    onFileSuccess(rootFile, file, response, chunk) {
      let res = JSON.parse(response)

      // 服务端自定义的错误（即http状态码为200，但是是错误的情况），这种错误是Uploader无法拦截的
      if (!res.result) {
        this.error(res.message)
        // 文件状态设为“失败”
        this.statusSet(file.id, 'failed')
        return
      }

      // 如果服务端返回了需要合并的参数
      if (res.needMerge) {
        // 文件状态设为“合并中”
        this.statusSet(file.id, 'merging')

        this.mergeFn({
          tempName: res.tempName,
          fileName: file.name,
          ...file.params
        })
          .then((res) => {
            // 文件合并成功
            this.emit('fileSuccess')

            this.statusRemove(file.id)
          })
          .catch((e) => {})

        // 不需要合并
      } else {
        this.emit('fileSuccess')
        console.log('上传成功')
      }
    },

    onFileProgress(rootFile, file, chunk) {
      console.log(
        `上传中 ${file.name}，chunk：${chunk.startByte / 1024 / 1024} ~ ${
          chunk.endByte / 1024 / 1024
        }`
      )
    },

    onFileError(rootFile, file, response, chunk) {
      this.error(response)
    },

    close() {
      this.uploader.cancel()

      this.panelShow = false
    },

    /**
     * 新增的自定义的状态: 'md5'、'merging'、'transcoding'、'failed'
     * @param id
     * @param status
     */
    statusSet(id, status) {
      let statusMap = {
        md5: {
          text: '校验MD5',
          bgc: '#fff'
        },
        merging: {
          text: '合并中',
          bgc: '#e2eeff'
        },
        transcoding: {
          text: '转码中',
          bgc: '#e2eeff'
        },
        failed: {
          text: '上传失败',
          bgc: '#e2eeff'
        }
      }

      this.customStatus = status
      this.$nextTick(() => {
        const statusTag = document.createElement('p')
        statusTag.className = `custom-status-${id} custom-status`
        statusTag.innerText = statusMap[status].text
        statusTag.style.backgroundColor = statusMap[status].bgc

        const statusWrap = document.querySelector(`.file_${id} .uploader-file-status`)
        statusWrap.appendChild(statusTag)
      })
    },

    statusRemove(id) {
      this.customStatus = ''
      this.$nextTick(() => {
        const statusTag = document.querySelector(`.custom-status-${id}`)
        statusTag.remove()
      })
    },

    emit(e) {
      Bus.$emit(e)
      this.$emit(e)
    },

    error(msg) {
      this.$notify({
        title: '错误',
        message: msg,
        type: 'error',
        duration: 2000
      })
    }
  }
}
</script>

<style lang="scss">
#global-uploader {
  &:not(.global-uploader-single) {
    position: fixed;
    z-index: 20;
    right: 15px;
    bottom: 15px;
    box-sizing: border-box;
  }

  .uploader-app {
    width: 520px;
  }

  .file-panel {
    background-color: #fff;
    border: 1px solid #e2e2e2;
    border-radius: 7px 7px 0 0;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

    .file-title {
      display: flex;
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
      border-bottom: 1px solid #ddd;

      .operate {
        flex: 1;
        text-align: right;

        i {
          font-size: 18px;
        }
      }
    }

    .file-list {
      position: relative;
      height: 240px;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: #fff;
      transition: all 0.3s;

      .file-item {
        background-color: #fff;
      }
    }

    &.collapse {
      .file-title {
        background-color: #e7ecf2;
      }
      .file-list {
        height: 0;
      }
    }
  }

  .no-file {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
  }

  .uploader-file {
    &.md5 {
      .uploader-file-resume {
        display: none;
      }
    }
  }

  .uploader-file-icon {
    &:before {
      content: '' !important;
    }

    &[icon='image'] {
      background: url(./images/image-icon.png);
    }
    &[icon=audio] {
      background: url(./images/audio-icon.png);
      background-size: contain;
    }
    &[icon='video'] {
      background: url(./images/video-icon.png);
    }
    &[icon='document'] {
      background: url(./images/text-icon.png);
    }
    &[icon=unknown] {
      background: url(./images/zip.png) no-repeat center;
      background-size: contain;
    }
  }

  .uploader-file-actions > span {
    margin-right: 6px;
  }

  .custom-status {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }
}

/* 隐藏上传按钮 */
#global-uploader-btn {
  position: absolute;
  clip: rect(0, 0, 0, 0);
}

.global-uploader-single {
  #global-uploader-btn {
    position: relative;
  }
}
</style>
