<!--
 * 文章列表
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="home-wrap">
    <div class="carousel-content">
      <Carousel />
      <div class="search-btns">
        <el-button type="success" link>最新文章</el-button>
        <el-button type="warning" link>最热文章</el-button>
      </div>
      <div class="recommend">推荐文章</div>
    </div>
    <Scrollbar :data-source="dataSource" :on-fetch-data="onFetchData" :is-pull-up-load="isPullUpLoad" class="scrollbar">
      <template #default="{ data }">
        <div :class="`${data.index === 0 && 'first-card'} card-wrap`">
          <div class="card">
            <div class="card-top">
              <img class="img" :src="IMG1" />
              <div class="info">
                <div class="desc">
                  我希望有个如你一般的人，如山间清爽的风，如古城温暖的光，从清晨到夜晚，由山野到书房，等待，不怕岁月蹉跎，不怕路途遥远，只要最后是你就好！
                </div>
              </div>
            </div>
            <div class="card-bottom">
              {{ data.i + '我的酒馆' + data.index }}
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
const dataSource = ref<number>(31);

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

  .carousel-content {
    position: relative;
    margin-bottom: 3px;

    .search-btns {
      position: absolute;
      left: 11px;
      bottom: 16px;
    }

    .recommend {
      position: absolute;
      right: 11px;
      bottom: 16px;
      color: @active;
    }
  }

  .card-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    border: 1px solid @card-border;
    border-radius: 5px;
    .card {
      position: relative;
      width: 100%;
      padding: 10px 10px 3px 10px;
      cursor: pointer;

      .card-top {
        position: relative;
        width: 100%;
        height: 100%;
        .img {
          position: relative;
          height: 100%;
          width: 100%;
          object-fit: cover;
          border-radius: 5px;
        }

        .info {
          display: flex;
          align-items: center;
          box-sizing: border-box;
          position: absolute;
          bottom: 7px;
          left: 0;
          width: 100%;
          height: 42%;
          padding: 5px;
          border-bottom-left-radius: 5px;
          border-bottom-right-radius: 5px;
          background-color: rgba(0, 0, 0, 0.28);
          color: @fff;

          .desc {
            display: table-cell;
            vertical-align: middle;
            .ellipsisMore(3);
            font-size: 14px;
          }
        }
      }

      .card-bottom {
        padding: 5px 0 8px 0;
      }
    }
  }
}
</style>
