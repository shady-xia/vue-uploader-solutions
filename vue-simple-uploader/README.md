# vue-simple-uploader

基于vue-simple-uploader封装文件分片上传、秒传及断点续传的全局上传插件

文章地址：https://www.cnblogs.com/xiahj/p/vue-simple-uploader.html

## 常见问题汇总

* [option或者query怎么做成动态的？](#1)
* [target怎么做成动态的？](#2)
* [如何限制上传文件的个数或忽略某些文件？](#3)
* [如何自定义接口的请求参数？](#4)
* [动态修改 attrs 不成功的问题](#5)
* [关于一些自定义状态的展示（校验MD5、合并中等）](#6)
* [关于秒传和分片检验的逻辑](#7)
* [第一个分片会请求两次的问题](#8)
* [开启了testChunk后服务器收不到第一个分片](#9)
* [最后一个分片大小大于chunkSize，但不会被自动分隔，如何处理？](#10)
* [计算MD5的时候，最好隐藏“播放/暂停”按钮](#11)
* [能不能给下后端代码？](#12)

感谢大家的支持，我整理了一些常见的问题和处理思路。大家遇到了问题或者对曾经的问题有了解决方案，都可以提出来，共享成果

<a name="1"></a>
#### option或者query怎么做成动态的？

`query` 可以是函数。

```js
 query: (file, chunk) => {
    return {
        // 可以针对于每个file对象设置自定义的params
        ...file.params,
        id: file.id,
        culture: this.$i18n.locale,
    }
},
```

<a name="2"></a>
#### target怎么做成动态的？

`target` 可以是函数

<a name="3"></a>
#### 如何限制上传文件的个数或忽略某些文件？

在fileAdded或者filesAdded里面做判断，设置 `ignore` 属性为 `ture` 来过滤掉该文件

>`file-added(file)`, 添加了一个文件事件，一般用做文件校验，如果设置 `file.ignored = true` 的话这个文件就会被过滤掉。

>`files-added(files, fileList)`, 添加了一批文件事件，一般用做一次选择的多个文件进行校验，如果设置 `files.ignored = true` 或者 `fileList.ignored = true` 的话本次选择的文件就会被过滤掉。

<a name="4"></a>
#### 如何自定义接口的请求参数？

比如项目中有自己风格的接口键名定义，比如
chunkNumber，想改成chunk-number；或者想自己魔改请求中的参数，可以使用`
processParams` 配置

> `processParams`：处理请求参数，默认 `function (params) {return params}`，一般用于修改参数名字或者删除参数。0.5.2版本后，`processParams` 会有更多参数：(params, Uploader.File, Uploader.Chunk, isTest)。

<a name="5"></a>
#### 动态修改 `attrs` 不成功的问题

因为作者只在 `<uploader-btn>`组件中的 `mounted` 中绑了一次`attrs`，也就意味着 `attrs` 不是动态的了。

可以找到原生的input后设置accept

```js
const $input = $('#global-uploader-btn').find('input')
const accept = opts.accept
$input.attr('accept', accept.join())
```

<a name="6"></a>
#### 关于一些自定义状态的展示（校验MD5、合并中等）

插件原本只支持了`success`、`error`、`uploading`、`paused`、`waiting`这几种状态，并且作者没有提供扩展api。

如果想要加一些自定义的状态，比如「校验MD5」、「合并中」、「转码中」、「上传失败」等，需要自己用一些额外的小手段，比如我的做法就是使用障眼法，自己写一个标签盖在原本的状态上，并且手动控制该状态的显示和移除。

<a name="7"></a>
#### 关于秒传和分片检验的逻辑

在配置了 `testChunks` 为 `true` 后， 每次上传的最开始，插件都会先发一个 `get` 请求，来测试哪些分片在服务端已经上传过了；分片校验就是在这一步做的，插件有一个配置项是 `checkChunkUploadedByResponse` 函数，就是做秒传和断点续传的。每一个分片都会调用一次该函数，然后前端去根据后端返回的参数做判断，若该分片上传过了，返回 `true` 即可。

比如说后端可以这样做，如果一个文件已经上传过了，直接返回一个“跳过上传”的参数（比如`skipUpload`）。否则后端返回“已上传”的参数，比如 uploaded: [1, 10, 11, 12, 13]。

```js
checkChunkUploadedByResponse (chunk, message) {
    var objMessage = JSON.parse(message);
    
    // 秒传
    if (objMessage.skipUpload) {
        return true;
    }

    // 断点续传，判断当前的chunk是否上传过
    return (objMessage.uploaded || []).indexOf(chunk.offset + 1) >= 0
},
```

<a name="8"></a>
#### 第一个分片会请求两次的问题

可能是因为你的 `testChunks` 设为了 `false `，但是没删掉
`checkChunkUploadedByResponse`这个函数

<a name="9"></a>
#### 开启了testChunk后服务器收不到第一个分片

testChunk的get请求，默认带了第一个分片给服务端，如果服务端返回的是 `200` 状态，则假定当前块已经上传过了，不会再上传了；

如果遇到这个问题，需要服务端改成其他http状态码，比如`204`，这样就不在“ `200, 201, 202`”这个集合里了，代表服务端还没有这个块，需要按照标准模式上传，这样第一个分片就会再次被上传了。

<a name="10"></a>
#### 最后一个分片大小大于`chunkSize`，但不会被自动分隔，如何处理？

设置 `forceChunkSize` 选项
> `forceChunkSize`：是否强制所有的块都是小于等于 `chunkSize` 的值。默认是 `false`。

<a name="11"></a>
#### 计算MD5的时候，最好隐藏“播放/暂停”按钮

因为此时md5值还未计算完，如果点击播放或暂停，则会得到插件本身的md5值

<a name="12"></a>
#### 能不能给下后端代码？

后端不是小弟写的，只能给几个文章作为参考吧

[https://github.com/LuoLiangDSGA/spring-learning/tree/master/boot-uploader](https://github.com/LuoLiangDSGA/spring-learning/tree/master/boot-uploader)

[https://github.com/23/resumable.js/tree/master/samples](https://github.com/23/resumable.js/tree/master/samples)

[https://blog.csdn.net/oppo5630/article/details/80880224](https://blog.csdn.net/oppo5630/article/details/80880224)


## 更新记录

### 2019/7/4 更新

1、优化了计算文件MD5的方式，展示MD5的计算进度

通过分片读取文件的方式计算MD5，防止直接读取大文件时因内存占用过大导致的网页卡顿、崩溃

2、新增了的自定义的状态
 
插件原本支持了success、error、uploading、paused、waiting这几种状态，
由于业务需求，我额外增加了“校验MD5”、“合并中”、“转码中”、“上传失败”这几种自定义的状态
由于前几种状态是插件已经封装好的，我只能用比较hack的方式，当自定义状态开始时，要手动调一下statusSet方法，生成一个p标签盖在原本的状态上面；当自定义状态结束时，还要手动调用statusRemove移除该标签。
希望插件作者后面能够支持自定义状态的配置。

### 2022/1/10 更新

1、将动态的`parmas`放在了`onFileAdded`事件中，以解决了不同文件使用不同params的需求

```js
 onFileAdded(file) {
    this.panelShow = true;
    this.computeMD5(file);

    // 2022/1/10 将额外的参数赋值到每个文件上，解决了不同文件使用不同params的需求
    file.params = this.params

    Bus.$emit('fileAdded');
},
```

同时要修改options的query：

```js
query: (file, chunk) => {
    return {
        ...file.params,
    }
},
```
