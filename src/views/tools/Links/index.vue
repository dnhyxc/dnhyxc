<!--
 * 编程导航
 * @author: dnhyxc
 * @since: 2023-10-15
 * index.vue
-->
<template>
  <div class="container">
    <div class="tool-title">
      前端编程导航
      <div class="sort">
        <span class="btn" @click="onSort">{{ enabled ? '关闭排序' : '开启排序' }}</span>
        <span v-show="enabled" class="btn" @click="onSaveSort">保存排序</span>
      </div>
    </div>
    <div :class="`tool-list ${checkOS() === 'mac' && 'mac-tool-list'}`">
      <el-scrollbar wrap-class="scrollbar-wrapper">
        <draggable
          v-model="toolsStore.toolList"
          item-key="id"
          draggable=".item"
          class="navigation-list"
          ghost-class="ghost"
          :disabled="!enabled"
        >
          <template #item="{ element }">
            <div class="item" @click="onClickNavIcon({ ...element, key: 'tool' })">
              <div class="navigation-item">
                <div class="item-top">
                  <Image :url="element?.toolUrl || TOOL_SVG" :transition-img="TOOL_SVG" class="prew-img" />
                </div>
                <div class="item-bottom" :title="element?.toolName">{{ element?.toolName }}</div>
              </div>
            </div>
          </template>
        </draggable>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import draggable from 'vuedraggable';
import { toolsStore } from '@/store';
import { TOOL_SVG } from '@/constant';
import { ToolsItem } from '@/typings/common';
import { checkOS } from '@/utils';

interface IProps {
  onClickNavIcon: (item: ToolsItem) => void;
}

defineProps<IProps>();

// 控制是否开启排序
const enabled = ref<boolean>(false);

const action = computed(() => {
  return enabled.value ? 'move' : 'pointer';
});

// 开启排序
const onSort = () => {
  enabled.value = !enabled.value;
};

// 保存排序
const onSaveSort = () => {
  const params = toolsStore.toolList.map((i, index) => {
    return {
      sort: index + 1,
      id: i.id,
    };
  });
  toolsStore.createToolSort({
    sortInfo: params,
  });
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .tool-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 10px;
    padding: 0 5px;
    color: var(--font-1);

    .btn {
      color: var(--theme-blue);
      font-size: 14px;
      cursor: pointer;
      font-weight: 500;

      &:last-child {
        margin-left: 10px;
      }

      &:hover {
        color: var(--el-color-primary-light-5);
      }
    }
  }

  .tool-list {
    display: flex;
    max-height: 100%;
    box-sizing: border-box;
    height: calc(100vh - 270px);
  }

  .mac-tool-list {
    height: calc(100vh - 285px);
  }

  .navigation-list {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    box-sizing: border-box;
    width: 100%;
    border-radius: 5px;
    margin-bottom: 20px;
    .clickNoSelectText();

    .ghost {
      opacity: 0.3;
      background: var(--theme-blue);
      border-radius: 5px;
    }

    .item {
      box-sizing: border-box;
      width: 10%;
      padding: 5px;

      .navigation-item {
        box-shadow: 0 0 5px 0 var(--shadow-mack);
        cursor: v-bind(action);
        border-radius: 5px;
        background-color: var(--pre-hover-bg);

        .item-top {
          padding: 5px;

          .prew-img {
            display: block;
            transition: all 0.3s;

            :deep {
              .image-item {
                max-height: 80px;
                border-radius: 5px;
              }
            }
          }
        }

        .item-bottom {
          text-align: center;
          padding: 0 5px 6px;
          .ellipsis();
          color: var(--font-1);
        }
      }

      &:hover {
        .navigation-item {
          box-shadow: 0 0 5px 0 var(--theme-blue);

          .prew-img {
            transform: scale(1.1);
          }
        }
      }
    }
  }
}
</style>
