<!--
 * 个人资料
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="profile-wrap">
    <div class="user-info">
      <div class="cover">
        <div class="img-wrap">
          <Image :url="mainCover || IMG1" :transition-img="IMG1" class="cover-img" />
          <div class="upload-cover-wrap">
            <Upload v-model:file-path="mainCover" :preview="false" :show-img="false" :fixed-number="[800, 200]">
              <el-button type="primary" link class="action">
                <i class="font iconfont icon-19shuxie3x" />
                编辑封面图
              </el-button>
            </Upload>
          </div>
        </div>
        <div class="author-info">
          <div class="head-img-wrap">
            <Upload v-model:file-path="headUrl" :fixed-number="[130, 130]">
              <template #preview>
                <Image :url="headUrl || HEAD_IMG" :transition-img="HEAD_IMG" class="cover-img" />
              </template>
            </Upload>
          </div>
          <div class="username">{{ loginStore.userInfo?.username }}</div>
        </div>
      </div>
    </div>
    <div class="content">
      <el-form ref="formRef" :rules="rules" :model="profileForm" label-width="100px" class="form-wrap">
        <el-form-item label="用户名" prop="username" class="form-item">
          <el-input
            v-model.trim="profileForm.username"
            v-focus
            size="large"
            placeholder="请输入用户名"
            @keyup.enter="onEnter"
          />
        </el-form-item>
        <el-form-item
          label="职位"
          prop="job"
          :rules="{
            trigger: 'blur',
          }"
          class="form-item"
        >
          <el-input v-model.trim="profileForm.job" size="large" placeholder="请输入职位" @keyup.enter="onEnter" />
        </el-form-item>
        <el-form-item
          label="座右铭"
          prop="motto"
          :rules="{
            trigger: 'blur',
          }"
          class="form-item"
        >
          <el-input
            v-model.trim="profileForm.motto"
            size="large"
            maxlength="50"
            placeholder="请输入座右铭"
            show-word-limit
            @keyup.enter="onEnter"
          />
        </el-form-item>
        <el-form-item
          label="个人介绍"
          prop="introduce"
          :rules="{
            trigger: 'blur',
          }"
          class="form-item"
        >
          <el-input
            v-model.trim="profileForm.introduce"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 5 }"
            maxlength="200"
            show-word-limit
            placeholder="请输入个人介绍"
            @keyup.enter="onEnter"
          />
        </el-form-item>
        <el-form-item class="form-item action-list">
          <el-button type="primary" class="action" @click="onUpdateInfo(formRef)">保存修改</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import { HEAD_IMG, IMG1 } from '@/constant';
import { loginStore } from '@/store';
import { verifyUsername } from '@/utils';
import Upload from '@/components/Upload/index.vue';

const router = useRouter();

const formRef = ref<FormInstance>();

const mainCover = ref<string>(loginStore.userInfo?.mainCover || IMG1);
const headUrl = ref<string>(loginStore.userInfo?.headUrl || HEAD_IMG);

const profileForm = reactive<{
  username: string;
  job: string;
  motto: string;
  introduce: string;
}>({
  username: loginStore.userInfo?.username || '',
  job: loginStore.userInfo?.job || '',
  motto: loginStore.userInfo?.motto || '',
  introduce: loginStore.userInfo?.introduce || '',
});

const validateUsername = (rule: any, value: any, callback: any) => {
  const { msg, status } = verifyUsername(value);
  if (value === '') {
    callback(new Error('用户名不能为空'));
  } else if (!status) {
    callback(new Error(msg));
  } else {
    callback();
  }
};

const rules = reactive<FormRules>({
  username: [{ validator: validateUsername, trigger: 'blur' }],
});

// 确定更新用户信息
const onUpdateInfo = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      loginStore.updateUserInfo(
        {
          ...profileForm,
          headUrl: headUrl.value,
          mainCover: mainCover.value,
        },
        1, // 1 标识更改用户信息，2 标识更改用户密码
        router,
      );
    } else {
      return false;
    }
  });
};

// 输入回车事件
const onEnter = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (valid) {
      loginStore.updateUserInfo(
        {
          ...profileForm,
          headUrl: headUrl.value,
          mainCover: mainCover.value,
        },
        1, // 1 标识更改用户信息，2 标识更改用户密码
        router,
      );
    } else {
      return false;
    }
  });
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.profile-wrap {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 10px 0 10px 10px;
  border-radius: 5px;

  .user-info {
    box-sizing: border-box;
    padding-right: 10px;

    .cover {
      box-sizing: border-box;
      width: 100%;
      height: auto;
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      .img-wrap {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        height: 200px;
        .cover-img {
          width: 100%;
          height: 100%;
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
          .imgStyle();
        }

        .upload-cover-wrap {
          position: absolute;
          top: 10px;
          right: 10px;

          .action {
            display: flex;
            align-items: center;
            color: rgba(225, 225, 225, 0.85);
            padding: 6px;
            font-size: 16px;

            &:hover {
              color: @theme-blue;
              .textLg();
            }

            .font {
              margin-right: 5px;
              margin-bottom: 3px;
            }
          }
        }
      }

      .author-info {
        box-sizing: border-box;
        position: relative;
        display: flex;
        justify-content: flex-start;
        width: 100%;
        .head-img-wrap {
          position: absolute;
          top: -90px;
          left: 15px;
          width: 130px;
          height: 130px;
          border-radius: 5px;
          padding: 5px;
          background-image: @card-lg;
          box-shadow: 0 0 10px @shadow-color;

          .cover-img {
            display: block;
            width: 100%;
            height: 100%;
            border-radius: 4px;
            .imgStyle();
          }
        }

        .username {
          flex: 1;
          padding: 15px 15px 15px 180px;
          font-size: 20px;
          font-weight: 700;
        }
      }
    }
  }

  .content {
    margin-right: 10px;
    padding: 20px 25% 20px 20%;
    box-sizing: border-box;

    .action-list {
      :deep {
        .el-form-item__content {
          justify-content: flex-end;
        }
      }
    }
  }
}
</style>
