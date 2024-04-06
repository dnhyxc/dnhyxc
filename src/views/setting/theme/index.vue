<!--
 * 主题设置页面
 * @author: dnhyxc
 * @since: 2023-02-20
 * index.vue
-->
<template>
  <div class="theme-wrap">
    <div class="content">
      <div class="default-wrap">
        <div class="label">主题颜色</div>
        <div class="themes">
          <div
            v-for="theme in THEME_TYPES"
            :key="theme.key"
            :class="`${(currentTheme === theme.key || (theme.key === 'freshGreen' && !currentTheme)) && 'active'} ${
              theme.key
            } theme`"
            @click.stop="changeTheme(theme.key)"
          >
            {{ theme.name }}
          </div>
        </div>
      </div>
      <div class="default-wrap">
        <div class="label">背景图主题</div>
        <div class="themes">
          <div
            v-for="theme in IMG_THEME_TYPES"
            :key="theme.key"
            :class="`${currentTheme === theme.key && 'active'} ${theme.key} theme`"
            @click.stop="changeTheme(theme.key)"
          >
            {{ theme.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { modifyTheme, setTheme, removeTheme, getTheme, ipcRenderers } from '@/utils';
import { THEME_TYPES, IMG_THEME_TYPES } from '@/constant';

const currentTheme = ref<string>(getTheme());

// 设置选择的主题
const changeTheme = (key: string) => {
  currentTheme.value = key;
  modifyTheme(key);
  ipcRenderers.setChildWinTheme(key);
  // key为freshGreen时，说明选择的是默认主题，此时把存储在store中的主题设置清除
  if (key === 'freshGreen') {
    removeTheme();
  } else {
    setTheme(key);
  }
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.bgStyles {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.theme-wrap {
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  height: 100%;
  padding: 30px 10px 10px;
  overflow-x: auto;

  .content {
    width: 80%;
    padding-left: 10px;

    .default-wrap {
      margin-bottom: 20px;

      .label {
        margin-bottom: 15px;
        font-size: 18px;
        font-weight: 700;
        color: var(--font-1);
      }

      .themes {
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;

        .theme {
          box-sizing: border-box;
          padding: 10px 0 0 15px;
          height: 90px;
          width: calc(20% - 10px);
          max-width: 150px;
          box-shadow: @shadow-mack;
          margin-right: 10px;
          color: @fff;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 700;
          margin-bottom: 10px;

          &:hover {
            box-shadow: 0 0 10px var(--theme-blue);
          }

          &:last-child {
            margin-right: 0;
          }
        }

        .freshGreen {
          background-color: #f9fff9;
          color: @font-1;
        }

        .emeraldGreen {
          background-color: #ceeaba;
          color: @font-1;
        }

        .electrum {
          background-color: #f5f5dc;
          color: @font-1;
        }

        .skygray {
          background-color: #d8e0e6;
          color: @font-1;
        }

        .black {
          background-color: #171718;
          color: @fff;
          box-shadow: 0 0 5px #fff;
        }

        .lightcyan {
          background-color: #d7fffe;
          color: @font-1;
        }

        .light {
          background-color: #fff;
          color: @font-1;
        }

        .danQingHuang {
          background: linear-gradient(126deg, #d7fffe, #f9fff9, #f8fded, #f9fff9, #d7fffe, #f5ccec);
          background-size: 151%;
          color: @font-1;
        }

        .danQingZi {
          background: linear-gradient(to top, #fffeff 0%, #d7fffe 100%);
          color: @font-1;
        }

        .colorful {
          .bgMoveColor(126deg);
          color: @font-1;
        }

        .ShaoSiming {
          background-image: url('@/assets/images/1.jpg');
          .bgStyles;
          color: @font-1;
        }

        .lateralFace {
          background-image: url('@/assets/images/face.jpg');
          .bgStyles;
          color: @fff;
        }

        .beauty {
          background-image: url('@/assets/images/beauty.jpg');
          .bgStyles;
          color: @fff;
        }

        .locomotive {
          background-image: url('@/assets/images/3.jpg');
          .bgStyles;
          color: @fff;
        }

        .island {
          background-image: url('@/assets/images/4.jpg');
          .bgStyles;
          color: @font-1;
        }

        .snow {
          background-image: url('@/assets/images/snow.jpg');
          .bgStyles;
          color: @font-1;
        }
        .cloud {
          background-image: url('@/assets/images/cloud.jpeg');
          .bgStyles;
          color: @font-1;
        }

        .sea {
          background-image: url('@/assets/images/sea.jpg');
          .bgStyles;
          color: @fff;
        }

        .fresh {
          background-image: url('@/assets/images/fresh.jpeg');
          .bgStyles;
          color: @fff;
        }

        .sun {
          background-image: url('@/assets/images/sun.jpg');
          .bgStyles;
          color: @fff;
        }

        .active {
          box-shadow: 0 0 10px var(--theme-blue);
        }
      }
    }
  }
}
</style>
