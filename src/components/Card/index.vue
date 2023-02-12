<!--
 * Card组件
 * @author: dnhyxc
 * @since: 2023-02-04
 * index.vue
-->
<template>
  <div class="card-wrap" @click="toDetail(data)">
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
        <slot>
          <div class="header">
            <div class="title">
              {{ data + '我的酒馆作者作者作者作者作者作者作者作者作者作者作者作者作者作者作者' }}
            </div>
            <div class="actions">
              <span class="edit" @click="(e) => toEdit(e, data)">编辑</span>
              <span class="del" @click="(e) => onReomve(e, data)">下架</span>
            </div>
          </div>
          <div class="art-info">
            <div class="create-info">
              <span class="author" @click="toPersonal"
                >作者作者作者作者作者作者作者作者作者作者作者作者作者作者作者</span
              >
              <span class="date">2023-09-02 02:09</span>
            </div>
            <div class="tags">
              <span class="classify" @click="(e) => toClassify(e, 'electron')">分类分类分类分类分类分类分类</span>
              <span class="tag" @click="(e) => toTag(e, 'electron')">标签标签标签</span>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Message } from '@/utils';
import IMG1 from '@/assets/images/1.jpg';

const router = useRouter();

interface IProps {
  data: any;
}

withDefaults(defineProps<IProps>(), {
  data: {},
});

// 编辑
const toEdit = (e: Event, id: string) => {
  e.stopPropagation();
  console.log(id, 'id');
  router.push(`/create?id=${id}`);
};

// 下架
const onReomve = async (e: Event, id: string) => {
  e.stopPropagation();
  console.log(id, 'id');
  Message('确定下架该文章吗', '下架文章')
    .then(() => {
      ElMessage({
        type: 'success',
        message: '删除成功',
      });
    })
    .catch(() => {
      ElMessage({
        type: 'error',
        message: '删除失败',
      });
    });
};

// 去详情
const toDetail = (id: string) => {
  router.push(`/detail/${id}`);
};

// 去我的主页
const toPersonal = (e: Event) => {
  e.stopPropagation();
  router.push('/personal?id=111');
};

// 去分类
const toClassify = (e: Event, name: string) => {
  e.stopPropagation();
  router.push(`/classify?name=${name}`);
};

// 去标签页
const toTag = (e: Event, name: string) => {
  e.stopPropagation();
  router.push(`/tag?name=${name}`);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.card-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  border-radius: 5px;

  .card {
    position: relative;
    width: 100%;
    cursor: pointer;
    overflow: hidden;

    &:hover {
      .img {
        transform: scale(1.3);
        transition: all 0.3s;
      }
    }

    .card-top {
      position: relative;
      width: 100%;
      height: 100%;
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
      overflow: hidden;

      .img {
        display: block;
        position: relative;
        height: 100%;
        width: 100%;
        object-fit: cover;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        transition: all 0.3s;
      }

      .info {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 42%;
        padding: 5px;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        background-color: rgba(0, 0, 0, 0.28);
        color: @fff;
        overflow: hidden;

        .desc {
          display: table-cell;
          vertical-align: middle;
          .ellipsisMore(3);
          font-size: 14px;
        }
      }
    }

    .card-bottom {
      padding: 8px 10px;
      background-color: @card-bg;
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .title {
          flex: 1;
          margin-right: 5px;
          font-size: 16px;
          .ellipsisMore(1);
        }

        .actions {
          display: flex;
          align-items: center;
          font-size: 14px;

          .edit {
            margin-right: 10px;
            color: @theme-blue;
          }

          .del {
            color: @font-danger;
          }

          .edit,
          .del {
            &:hover {
              color: @active;
            }
          }
        }
      }

      .art-info {
        display: flex;
        flex-direction: column;

        .create-info {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .author,
          .date {
            max-width: 50%;
            font-size: 13px;
            color: @font-2;
            .ellipsisMore(1);
          }

          .author {
            margin-right: 5px;

            &:hover {
              color: @theme-blue;
            }
          }
        }

        .tags {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .classify,
          .tag {
            max-width: 50%;
            font-size: 13px;
            border-radius: 5px;
            color: @font-2;
            .ellipsisMore(1);

            &:hover {
              color: @theme-blue;
            }
          }

          .classify {
            margin-right: 5px;
          }
        }
      }
    }
  }
}
</style>
