<template>
  <div class="page page-home">
    <div class="btn-group">
      <el-button type="primary" size="medium" @click="upload">上传</el-button>
    </div>
    <div class="file-box">
      <p class="title">文件资源库</p>

      <!-- todo 已上传的文件列表 -->

      <div class="empty" v-if="!fileList.length">
        <el-empty>
          <template #description>
            <p>暂无文件，请先<a class="upload" @click="upload">上传</a></p>
          </template>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script>
import Bus from '/vue-simple-uploader/js/bus'

export default {
  name: 'home',

  data() {
    return {
      fileList: []
    }
  },

  mounted() {
    // 文件选择后的回调
    Bus.$on('fileAdded', () => {
      console.log('文件已选择')
    })

    // 文件上传成功的回调
    Bus.$on('fileSuccess', () => {
      console.log('文件上传成功')
    })
  },

  beforeDestroy() {
    Bus.$off('fileAdded')
    Bus.$off('fileSuccess')
  },

  methods: {
    upload() {
      // 打开文件选择框
      Bus.$emit('openUploader', {
        // 给服务端的额外参数
        params: {
          page: 'home'
        }
      })
    }
  },
}
</script>

<style scoped lang="scss">
.page-home {
  height: 100%;
}

.file-box {
  position: relative;
  margin-top: 20px;
  padding: 30px;
  flex: 1;
  background-color: #fff;

  .title {
    padding-left: 10px;
    font-size: 15px;
    border-left: 4px solid #1989fa;
  }

  .empty {
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);

    .upload {
      color: #1989fa;
      cursor: pointer;
    }
  }
}
</style>
