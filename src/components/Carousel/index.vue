<!--
 * 轮播图组件
 * @author: dnhyxc
 * @since: 2023-02-01
 * index.vue
-->
<template>
  <div class="carousel-wrap">
    <el-carousel loop :interval="3000" trigger="click" type="card" height="210px" class="carousel">
      <el-carousel-item v-for="item in 6" :key="item" @click="toDetail(item)">
        <div class="carousel-item">
          <img :src="CYWL_IMG" alt="" class="img" />
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import CYWL_IMG from '@/assets/images/cywl.jpg';

const router = useRouter();

// 去详情页
const toDetail = (id: number) => {
  router.push(`/detail/${id}`);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.carousel-wrap {
  height: 230px;
  margin-bottom: 10px;
  // border: 1px solid @card-border;
  padding: 0 0 10px 0;
  border-radius: 5px;

  .carousel {
    .carousel-item {
      box-sizing: border-box;
      height: 100%;
      border-radius: 5px;

      .img {
        width: 100%;
        height: 210px;
        border-radius: 5px;
        .imgStyle();
      }
    }

    :deep {
      .is-active {
        box-shadow: 0 0 5px @card-border;
        border-radius: 5px;
      }
    }
  }

  :deep {
    // 更改轮播图小圆点样式
    .el-carousel__indicators--outside {
      .is-active {
        box-shadow: none;

        button {
          background-color: @theme-blue;
        }
      }
    }
  }
}
</style>
