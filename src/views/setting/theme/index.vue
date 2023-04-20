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
            :class="`${currentTheme === theme.key && 'active'} ${theme.key} theme`"
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
import { modifyTheme, setTheme, removeTheme, getTheme } from '@/utils';
import { THEME_TYPES, IMG_THEME_TYPES } from '@/constant';

const currentTheme = ref<string>(getTheme());

// 设置选择的主题
const changeTheme = (key: string) => {
  currentTheme.value = key;
  modifyTheme(key);
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

  .content {
    width: 80%;

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

        .theme {
          box-sizing: border-box;
          padding: 10px 0 0 15px;
          height: 90px;
          width: 150px;
          box-shadow: @shadow-mack;
          margin-right: 10px;
          color: @fff;
          border-radius: 5px;
          cursor: pointer;

          &:hover {
            box-shadow: 0 0 10px @theme-blue;
          }
        }

        .freshGreen {
          background-color: #f9fff9;
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

        .colorful {
          .bgMoveColor(126deg);
          .bgKeyframes(bgmove);
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
          background-image: url('@/assets/images/2.jpg');
          .bgStyles;
          color: @fff;
        }

        .locomotive {
          background-image: url('@/assets/images/3.jpg');
          .bgStyles;
          color: @font-1;
        }

        .island {
          background-image: url('@/assets/images/4.jpg');
          .bgStyles;
          color: @font-1;
        }

        .active {
          box-shadow: 0 0 10px @theme-blue;
        }
      }
    }
  }
}
</style>
