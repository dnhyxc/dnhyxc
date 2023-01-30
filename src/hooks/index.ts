import { useRouter } from 'vue-router';
import { toRaw } from 'vue';

const router = useRouter();

export const useGetRoutePath = () => {
  return toRaw(router).currentRoute.value.fullPath;
};
