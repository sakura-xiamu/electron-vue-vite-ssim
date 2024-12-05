<template>
  <section>
    <div class="flex">
      <figure>
        <input type="file" @change="($event) => {
          handleImageUpload($event, 0);
          handleFileChange($event, 0);
        }" accept="image/*">
        <img :src="imageUrl[0]" alt="" width="100" height="100">
      </figure>
      <figure>
        <input type="file" @change="($event) => {
          handleImageUpload($event, 1);
          handleFileChange($event, 1);
        }" accept="image/*">
        <img :src="imageUrl[1]" alt="" width="100" height="100">
      </figure>
    </div>
    <input type="number" v-model.number="press" placeholder="图片压缩倍数"/>
    <button @click="diffImage">对比</button>
    <p>相似度是：
      <output>{{ output }}</output>
    </p>
  </section>
</template>

<script setup>
import ssim from 'ssim.js'
import {ref} from "vue";

const output = ref(null)
const press = ref(10)
const imageUrl = ref([])
const inputImgs = [];


const handleFileChange = (event, imageNumber) => {
  const file = event.target.files[0]
  if (file) {
    // 创建预览URL
    imageUrl.value[imageNumber] = URL.createObjectURL(file)
  }
}

// 图片转imageData需要的canvas
// 为了节省开销，就在外面定义，只用这一个玩耍了
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', {
  willReadFrequently: true
});

// image 转 imagedata的方法
const image2data = (img, flag) => {
  const {width, height} = canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
};

const compareImg = () => {
  // 开始转imageData并对比相似度
  if (inputImgs.length === 2) {
    // 首先是尺寸，按照面积小的那个算
    let {width, height} = inputImgs[0];
    // 如果面积大了，算第2个图
    if (width * height > inputImgs[1].width * inputImgs[0].height) {
      width = inputImgs[1].width;
      height = inputImgs[1].height;
    }
    canvas.width = width / press.value;
    canvas.height = height / press.value;

    const {mssim, performance} = ssim(image2data(inputImgs[0]), image2data(inputImgs[1]));
    // 显示对比结果
    output.value = `${mssim} (${performance}ms)`;
  }
}

const diffImage = () => {
  compareImg();
}

const handleImageUpload = (event, imageNumber) => {
  const file = event.target.files[0];
  if (!file) return;

  // 方法1：使用 FileReader 读取
  const reader = new FileReader();
  reader.onload = (e) => {
    // 创建 Image 对象
    const img = new Image();
    img.onload = () => {
      inputImgs[imageNumber] = img;
      console.log('图片宽度:', img.width);
      console.log('图片高度:', img.height);
    }
    img.src = e.target.result;
  }
  reader.readAsDataURL(file);
}

</script>
