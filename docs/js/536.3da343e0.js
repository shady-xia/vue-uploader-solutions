"use strict";(self["webpackChunkvue_uploader_soultions"]=self["webpackChunkvue_uploader_soultions"]||[]).push([[536],{3536:function(e,t,s){s.r(t),s.d(t,{default:function(){return p}});var l=function(){var e=this,t=e._self._c;return t("div",{staticClass:"page page-home"},[t("div",{staticClass:"btn-group"},[t("el-button",{attrs:{type:"primary",size:"medium"},on:{click:e.upload}},[e._v("上传")])],1),t("div",{staticClass:"file-box"},[t("p",{staticClass:"title"},[e._v("文件资源库")]),e.fileList.length?e._e():t("div",{staticClass:"empty"},[t("el-empty",{scopedSlots:e._u([{key:"description",fn:function(){return[t("p",[e._v("暂无文件，请先"),t("a",{staticClass:"upload",on:{click:e.upload}},[e._v("上传")])])]},proxy:!0}],null,!1,1751674375)})],1)])])},o=[],i=s(8558),a={data(){return{fileList:[]}},mounted(){i.Z.$on("fileAdded",(()=>{console.log("文件已选择")})),i.Z.$on("fileSuccess",(()=>{console.log("文件上传成功")}))},beforeDestroy(){i.Z.$off("fileAdded"),i.Z.$off("fileSuccess")},methods:{upload(){i.Z.$emit("openUploader",{params:{page:"home"}})}}},u=a,n=s(1001),c=(0,n.Z)(u,l,o,!1,null,"838e677c",null),p=c.exports}}]);