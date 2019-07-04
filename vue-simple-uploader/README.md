# vue-simple-uploader

基于vue-simple-uploader封装文件分片上传、秒传及断点续传的全局上传插件

文章地址：https://www.cnblogs.com/xiahj/p/vue-simple-uploader.html


## 2019/7/4 更新

1、优化了计算文件MD5的方式，展示MD5的计算进度

通过分片读取文件的方式计算MD5，防止直接读取大文件时因内存占用过大导致的网页卡顿、崩溃

2、新增了的自定义的状态
 
插件原本支持了success、error、uploading、paused、waiting这几种状态，
由于业务需求，我额外增加了“校验MD5”、“合并中”、“转码中”、“上传失败”这几种自定义的状态
由于前几种状态是插件已经封装好的，我只能用比较hack的方式，当自定义状态开始时，要手动调一下statusSet方法，生成一个p标签盖在原本的状态上面；当自定义状态结束时，还要手动调用statusRemove移除该标签。
希望插件作者后面能够支持自定义状态的配置。
