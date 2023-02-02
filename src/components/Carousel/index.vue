<!--
 * 轮播图组件
 * @author: dnhyxc
 * @since: 2023-02-01
 * index.vue
-->
<template>
  <div class="carousel-wrap">
    <el-carousel loop :interval="3000" trigger="click" type="card" height="210px" class="carousel">
      <el-carousel-item v-for="item in 6" :key="item">
        <div class="carousel-item">
          <img :src="CYWL_IMG" alt="" class="img" />
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
import CYWL_IMG from '@/assets/images/cywl.jpg';
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.carousel-wrap {
  height: 230px;
  margin-bottom: 10px;
  .carousel {
    .carousel-item {
      box-sizing: border-box;
      height: 100%;
      border-radius: 5px;
      .img {
        width: 100%;
        height: 210px;
        object-fit: cover;
        border-radius: 5px;
      }
    }
  }

  // :deep {
  //   // 更改轮播图小圆点样式
  //   .el-carousel__indicators--outside {
  //     position: absolute;
  //     bottom: 0;
  //     left: 50%;
  //     transform: translateX(-50%);
  //   }
  // }
}
</style>
