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
          <div class="card">
            <div class="card-top">
              <img class="img" :src="IMG1" />
            </div>
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

  .card-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    border: 1px solid @card-border;
    // border: 1px solid @menu-light;
    // background-color: @card-border;
    border-radius: 5px;
    .card {
      position: relative;
      width: 100%;
      padding: 10px 10px 3px 10px;
      .card-top {
        width: 100%;
        height: 100%;
        .img {
          height: 100%;
          width: 100%;
          object-fit: cover;
          border-radius: 5px;
        }
      }

      .card-bottom {
        position: absolute;
        bottom: 0;
      }
    }
  }
}
</style>
