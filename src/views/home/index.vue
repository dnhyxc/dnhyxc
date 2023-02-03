<!--
 * 文章列表
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="home-wrap">
    <div class="carousel-wrap">
      <Carousel />
    </div>
    <Scrollbar :data-source="dataSource" :on-fetch-data="onFetchData" :is-pull-up-load="isPullUpLoad" class="scrollbar">
      <template #default="{ data }">
        <div :class="`${data.index === 0 && 'first-card'} card-wrap`">
          <div class="left">
            <el-image class="img" :src="IMG1" fit="cover" />
          </div>
          <div class="right">
            {{ data.i % 5 === 0 ? 'scroll up 👆🏻' : `I am item ${data.index} ` }}
          </div>
        </div>
      </template>
    </Scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Carousel from '@/components/Carousel/index.vue';
import Scrollbar from '@/components/Scrollbar/index.vue';
import IMG1 from '@/assets/images/1.jpg';

const isPullUpLoad = ref<boolean>(false);
const dataSource = ref<number>(30);

const onFetchData = async () => {
  try {
    const newData: any = await ajaxGet(/* url */);
    if (dataSource.value > 20) return;
    dataSource.value += newData;
  } catch (err) {
    // handle err
    console.log(err);
  }
};

const ajaxGet = async (/* url */) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(20);
    }, 1000);
  });
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.home-wrap {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-sizing: border-box;
  height: 100%;

  .carousel-wrap {
    margin-bottom: 5px;
  }

  .scrollbar {
    & > :first-child {
      border-top: 1px solid @card-border;
    }
  }

  .card-wrap {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 135px;
    padding: 10px;
    background-color: @menu-weak;
    border: 1px solid @card-border;
    border-top: none;
    .left {
      width: 218px;
      height: 100%;
      box-sizing: border-box;
      .img {
        width: auto;
        height: 100%;
        border-radius: 5px;
      }
    }
    .right {
      flex: 1;
    }
  }
}
</style>
